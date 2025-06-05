
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
    MATERIAL_OPTIONS, PROCESSOR_OPTIONS, DISPLAY_OPTIONS, OPERATING_SYSTEM_OPTIONS
} from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { fetchNewClientContractAction } from './actions';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { List, ListItem } from '@/components/ui/list';

export default function ProcurementPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
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
      const newContract = await fetchNewClientContractAction();
      if (newContract) {
        const updatedAvailableContracts = [...availableContracts, newContract].slice(0, MAX_AVAILABLE_CONTRACTS);
        setAvailableContracts(updatedAvailableContracts);
        localStorage.setItem(LOCAL_STORAGE_AVAILABLE_CONTRACTS_KEY, JSON.stringify(updatedAvailableContracts));
      } else {
         setError(t('noAvailableContracts'));
      }
    } catch (e) {
      console.error("Error fetching new contract:", e);
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
        specificProcessor: PROCESSOR_OPTIONS.options,
        specificDisplayType: DISPLAY_OPTIONS.options,
        targetOs: OPERATING_SYSTEM_OPTIONS.options,
    };

    if (optionLists[key]) {
        const foundOption = optionLists[key]?.find(opt => opt.value === value);
        return foundOption ? t(foundOption.label) : String(value);
    }
    return String(value);
  }

  const renderSpecs = (specs: RequiredSpecs) => {
    const lines: string[] = [];
    Object.entries(specs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        const displayValue = getSpecDisplayValue(key as keyof RequiredSpecs, value);
        lines.push(t(`spec_${key as keyof RequiredSpecs}`, { value: displayValue }));
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
            Icon = Loader2; // Spinner for in progress
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
            <Icon className={`w-3 h-3 mr-1 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
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
            {t('btnFetchNewContracts')}
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
                         {contract.acceptedDate && <p className="text-xs text-muted-foreground">Accepted: {new Date(contract.acceptedDate).toLocaleDateString()}</p>}
                    </CardContent>
                    <CardFooter>
                        {/* Placeholder for future actions like 'Submit Phone' or 'Abandon Contract' */}
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
