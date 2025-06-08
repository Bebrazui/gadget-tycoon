
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Briefcase, FileText, CheckCircle2, XCircle } from 'lucide-react';
import type { ClientContract, RequiredSpecs } from '@/lib/types';
import { 
    LOCAL_STORAGE_AVAILABLE_CONTRACTS_KEY, 
    LOCAL_STORAGE_ACCEPTED_CONTRACTS_KEY,
    MAX_AVAILABLE_CONTRACTS,
    MATERIAL_OPTIONS, PROCESSOR_OPTIONS, DISPLAY_OPTIONS, OPERATING_SYSTEM_OPTIONS,
    GenerateClientContractInputSchema, ClientContractSchema // Import Zod schemas
} from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { fetchNewClientContractAction } from './actions';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { List, ListItem } from '@/components/ui/list';
import { useSettings } from '@/context/SettingsContext'; // For offline mode

function generateLocalClientContract(t: (key: string, replacements?: Record<string, string | number>) => string): ClientContract {
    const clientNames = ["Local Solutions Inc.", "Regional Innovations Co.", "Community Gadgets Ltd.", "Simulated Devices Corp."];
    const contractTitles = [t('localContractTitle1'), t('localContractTitle2'), t('localContractTitle3')];
    const briefs = [t('localContractBrief1'), t('localContractBrief2'), t('localContractBrief3')];
    
    const baseSpecs: RequiredSpecs[] = [
        { minRam: 4, maxUnitCost: 180 },
        { specificMaterial: 'plastic', minBattery: 3500, minStorage: 64 },
        { targetOs: 'stock_android', minCameraMP: 12 },
        { mustHaveNFC: true, minScreenSize: 5.8, maxUnitCost: 250 },
    ];
    const chosenBaseSpec = baseSpecs[Math.floor(Math.random() * baseSpecs.length)];
    
    // Add 1-2 more random specs
    const potentialExtraSpecs: (keyof RequiredSpecs)[] = ['minStorage', 'minRam', 'minCameraMP', 'minBattery', 'mustHaveOIS', 'maxUnitCost'];
    const numExtraSpecs = Math.floor(Math.random() * 2) + 1; // 1 or 2 extra
    
    for (let i = 0; i < numExtraSpecs; i++) {
        const randomSpecKey = potentialExtraSpecs[Math.floor(Math.random() * potentialExtraSpecs.length)];
        if (chosenBaseSpec[randomSpecKey] === undefined) {
             if (randomSpecKey === 'minStorage') chosenBaseSpec.minStorage = [64, 128, 256][Math.floor(Math.random() * 3)];
             else if (randomSpecKey === 'minRam') chosenBaseSpec.minRam = [4, 6, 8][Math.floor(Math.random() * 3)];
             else if (randomSpecKey === 'minCameraMP') chosenBaseSpec.minCameraMP = [12, 16, 48][Math.floor(Math.random() * 3)];
             else if (randomSpecKey === 'minBattery') chosenBaseSpec.minBattery = [3000, 4000, 5000][Math.floor(Math.random() * 3)];
             else if (randomSpecKey === 'mustHaveOIS') chosenBaseSpec.mustHaveOIS = Math.random() > 0.5;
             else if (randomSpecKey === 'maxUnitCost' && chosenBaseSpec.maxUnitCost === undefined) chosenBaseSpec.maxUnitCost = [150, 200, 300, 400][Math.floor(Math.random() * 4)];
        }
    }

    const contract: ClientContract = {
        id: `local_contract_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
        contractTitle: contractTitles[Math.floor(Math.random() * contractTitles.length)],
        brief: briefs[Math.floor(Math.random() * briefs.length)],
        requiredSpecs: chosenBaseSpec,
        quantity: Math.floor(Math.random() * (300 - 50 + 1)) + 50, // 50-300
        rewardFlatBonus: Math.floor(Math.random() * (5000 - 500 + 1)) + 500, // 500-5000
        penaltyFlat: Math.floor(Math.random() * (2500 - 200 + 1)) + 200, // 200-2500
        deadlineDays: Math.floor(Math.random() * (15 - 7 + 1)) + 7, // 7-15
        status: 'available',
    };
    
    // Validate with Zod before returning
    const validation = ClientContractSchema.safeParse(contract);
    if (!validation.success) {
        console.error("Generated local contract failed Zod validation:", validation.error.flatten());
        // Fallback to a super simple one if complex generation fails validation
        return {
            id: crypto.randomUUID(), clientName: "Fallback Local Client", contractTitle: "Basic Order",
            brief: "A very basic device order.", requiredSpecs: { minRam: 4 }, quantity: 50,
            rewardFlatBonus: 500, penaltyFlat: 200, deadlineDays: 10, status: 'available',
        };
    }
    return validation.data;
}


export default function ProcurementPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [availableContracts, setAvailableContracts] = useState<ClientContract[]>([]);
  const [acceptedContracts, setAcceptedContracts] = useState<ClientContract[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = useCallback(() => {
    try {
      const availableStored = localStorage.getItem(LOCAL_STORAGE_AVAILABLE_CONTRACTS_KEY);
      setAvailableContracts(availableStored ? JSON.parse(availableStored) : []);
      const acceptedStored = localStorage.getItem(LOCAL_STORAGE_ACCEPTED_CONTRACTS_KEY);
      setAcceptedContracts(acceptedStored ? JSON.parse(acceptedStored) : []);
    } catch (e) {
      console.error("Error loading contracts from localStorage:", e);
      setError(t('localStorageErrorAvailableContracts')); 
      setAvailableContracts([]);
      setAcceptedContracts([]);
    }
  }, [t]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const handleFetchNewContracts = async () => {
    if (availableContracts.length >= MAX_AVAILABLE_CONTRACTS) {
      toast({
        variant: "default",
        title: t('statusStatus'),
        description: t('maxContractsReached', {max: MAX_AVAILABLE_CONTRACTS}),
      });
      return;
    }
    setIsFetching(true);
    setError(null);
    try {
      let newContract: ClientContract | null = null;
      if (settings.useOnlineFeatures) {
        newContract = await fetchNewClientContractAction();
      } else {
        newContract = generateLocalClientContract(t);
        toast({
            title: t('localContractGeneratedTitle'),
            description: t('localContractGeneratedDesc')
        });
      }

      if (newContract) {
        const updatedAvailableContracts = [...availableContracts, newContract].slice(-MAX_AVAILABLE_CONTRACTS); // Keep only the last MAX_AVAILABLE_CONTRACTS
        setAvailableContracts(updatedAvailableContracts);
        localStorage.setItem(LOCAL_STORAGE_AVAILABLE_CONTRACTS_KEY, JSON.stringify(updatedAvailableContracts));
      } else {
         setError(t('noAvailableContracts'));
      }
    } catch (e) {
      console.error("Error fetching/generating new contract:", e);
      setError(t('errorFetchingContracts'));
    }
    setIsFetching(false);
  };

  const handleAcceptContract = (contractId: string) => {
    const contractToAccept = availableContracts.find(c => c.id === contractId);
    if (!contractToAccept) return;

    const updatedAvailable = availableContracts.filter(c => c.id !== contractId);
    const updatedAccepted = [...acceptedContracts, { ...contractToAccept, status: 'accepted' as const, acceptedDate: new Date().toISOString() }];

    setAvailableContracts(updatedAvailable);
    setAcceptedContracts(updatedAccepted);
    localStorage.setItem(LOCAL_STORAGE_AVAILABLE_CONTRACTS_KEY, JSON.stringify(updatedAvailable));
    localStorage.setItem(LOCAL_STORAGE_ACCEPTED_CONTRACTS_KEY, JSON.stringify(updatedAccepted));

    toast({
      title: t('contractAcceptedToastTitle'),
      description: t('contractAcceptedToastDesc', { contractTitle: contractToAccept.contractTitle }),
    });
  };

  const getSpecDisplayValue = (key: keyof RequiredSpecs, value: any): string => {
    const optionLists: Record<string, any[] | undefined> = {
        specificMaterial: MATERIAL_OPTIONS.options,
        specificProcessor: PROCESSOR_OPTIONS.options, // Ensure you have all processor options here for display
        specificDisplayType: DISPLAY_OPTIONS.options, // Ensure you have all display options here
        targetOs: OPERATING_SYSTEM_OPTIONS.options,
    };

    if (optionLists[key]) {
        const foundOption = optionLists[key]?.find(opt => opt.value === value);
        return foundOption ? t(foundOption.label) : String(value);
    }
    // For boolean values that are true
    if (typeof value === 'boolean' && value) {
        return t('yes'); // Assuming you have a 'yes' translation
    }
    // For boolean values that are false, we might not want to display them or display 'No'
    if (typeof value === 'boolean' && !value) {
        return t('no'); // Assuming you have a 'no' translation, or return empty string '' if not needed
    }
    return String(value);
  }

  const renderSpecs = (specs: RequiredSpecs) => {
    const lines: string[] = [];
    Object.entries(specs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        // Skip rendering boolean 'false' values, unless explicitly desired
        if (typeof value === 'boolean' && !value && (key === 'mustHaveNFC' || key === 'mustHaveOIS')) {
            // lines.push(t(`spec_${key as keyof RequiredSpecs}_false`, { value: getSpecDisplayValue(key as keyof RequiredSpecs, value) }));
            return; // Don't show "NFC: No" unless it's an explicit requirement *against* NFC
        }
        lines.push(t(`spec_${key as keyof RequiredSpecs}`, { value: getSpecDisplayValue(key as keyof RequiredSpecs, value) }));
      }
    });
    if (lines.length === 0) return <p className="text-sm text-muted-foreground">{t('notSet')}</p>;
    return (
      <List>
        {lines.map((line, index) => <ListItem key={index} className="text-sm py-0.5">{line}</ListItem>)}
      </List>
    );
  };
  
  const getStatusChip = (status: ClientContract['status']) => {
    let bgColor = 'bg-gray-500/20';
    let textColor = 'text-gray-400';
    let Icon = FileText;

    switch (status) {
        case 'available':
            bgColor = 'bg-blue-500/20';
            textColor = 'text-blue-400';
            Icon = Briefcase;
            break;
        case 'accepted':
        case 'in_progress':
            bgColor = 'bg-yellow-500/20';
            textColor = 'text-yellow-400';
            Icon = Loader2; 
            break;
        case 'completed_success':
            bgColor = 'bg-green-500/20';
            textColor = 'text-green-400';
            Icon = CheckCircle2;
            break;
        case 'completed_failed_specs':
        case 'completed_failed_deadline':
            bgColor = 'bg-red-500/20';
            textColor = 'text-red-400';
            Icon = XCircle;
            break;
    }
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${bgColor} ${textColor}`}>
            <Icon className={`w-3 h-3 mr-1 ${(status === 'in_progress' || status === 'accepted') ? 'animate-spin' : ''}`} />
            {t(`contractStatus_${status}`)}
        </span>
    );
  };


  return (
    <div className="space-y-8">
      <SectionTitle title={t('procurementPageTitle')} description={t('procurementPageDesc')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('availableContractsTitle')}</CardTitle>
          <Button onClick={handleFetchNewContracts} disabled={isFetching || availableContracts.length >= MAX_AVAILABLE_CONTRACTS}>
            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
            {settings.useOnlineFeatures ? t('btnFetchNewContracts') : t('btnFetchNewContractsLocal')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFetching && availableContracts.length === 0 && <p className="text-sm text-muted-foreground">{t('fetchingContracts')}</p>}
          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>{t('errorStatus')}</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          
          {!isFetching && availableContracts.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">{t('noAvailableContracts')}</p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableContracts.map(contract => (
              <Card key={contract.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{contract.contractTitle}</CardTitle>
                    {getStatusChip(contract.status)}
                  </div>
                  <CardDescription>{t('contractFrom', { clientName: contract.clientName })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <p className="text-sm text-muted-foreground italic">"{contract.brief}"</p>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('requiredSpecsTitle')}:</h4>
                    {renderSpecs(contract.requiredSpecs)}
                  </div>
                  <p className="text-sm">{t('contractQuantity', { quantity: contract.quantity })}</p>
                  <p className="text-sm">{t('contractReward', { reward: contract.rewardFlatBonus.toLocaleString() })}</p>
                  <p className="text-sm">{t('contractPenalty', { penalty: contract.penaltyFlat.toLocaleString() })}</p>
                  <p className="text-sm">{t('contractDeadline', { days: contract.deadlineDays })}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleAcceptContract(contract.id)} className="w-full">
                    {t('btnAcceptContract')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('acceptedContractsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {acceptedContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noAcceptedContracts')}</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {acceptedContracts.map(contract => (
                 <Card key={contract.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{contract.contractTitle}</CardTitle>
                            {getStatusChip(contract.status)}
                        </div>
                        <CardDescription>{t('contractFrom', { clientName: contract.clientName })}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-grow">
                        <p className="text-sm text-muted-foreground italic">"{contract.brief}"</p>
                        <div>
                            <h4 className="font-semibold text-sm mb-1">{t('requiredSpecsTitle')}:</h4>
                            {renderSpecs(contract.requiredSpecs)}
                        </div>
                        <p className="text-sm">{t('contractQuantity', { quantity: contract.quantity })}</p>
                        <p className="text-sm">{t('contractReward', { reward: contract.rewardFlatBonus.toLocaleString() })}</p>
                        <p className="text-sm">{t('contractPenalty', { penalty: contract.penaltyFlat.toLocaleString() })}</p>
                        <p className="text-sm">{t('contractDeadline', { days: contract.deadlineDays })}</p>
                         {contract.acceptedDate && <p className="text-xs text-muted-foreground">{t('contractAcceptedDateLabel') || 'Accepted'}: {new Date(contract.acceptedDate).toLocaleDateString()}</p>}
                    </CardContent>
                    <CardFooter>
                        {/* TODO: Implement contract fulfillment logic */}
                        <Button variant="outline" className="w-full" disabled>{t('contractStatus_in_progress')}</Button>
                    </CardFooter>
                 </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
