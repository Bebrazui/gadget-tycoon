
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquareText, AlertCircle, Smile, Meh, Frown, Bot, Cpu } from 'lucide-react';
import type { PhoneDesign, Transaction, GeneratePhoneReviewOutput } from '@/lib/types';
import { LOCAL_STORAGE_MY_PHONES_KEY, LOCAL_STORAGE_TRANSACTIONS_KEY } from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import { SectionTitle } from '@/components/shared/SectionTitle';

interface DisplayReview extends GeneratePhoneReviewOutput {
  phoneName: string;
  phoneId: string;
  reviewType?: 'ai' | 'local';
}

export default function ReviewsPage() {
  const { t } = useTranslation();
  const [displayReviews, setDisplayReviews] = useState<DisplayReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const phonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);

    const allPhones: PhoneDesign[] = phonesString ? JSON.parse(phonesString) : [];
    const allTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];

    const soldPhoneNames = new Set<string>();
    allTransactions.forEach(txn => {
      if (txn.type === 'income' && txn.description.startsWith("transactionMarketSaleOf")) {
        const paramsMatch = txn.description.match(/phoneName:(.*?),/);
        if (paramsMatch && paramsMatch[1]) {
          soldPhoneNames.add(paramsMatch[1]);
        }
      }
    });
    
    const reviewsToShow: DisplayReview[] = [];
    allPhones.forEach(phone => {
      if (phone.review && soldPhoneNames.has(phone.name)) {
        // Attempt to parse the review if it's a string, or use it directly if it's an object
        // This is a bit of a hack because phone.review *should* be just text based on current design
        // but to make it work with GeneratePhoneReviewOutput, we create a mock structure
        // In a real scenario, GeneratePhoneReviewOutput would be stored directly or its parts.
        let reviewData: GeneratePhoneReviewOutput;
        if (typeof phone.review === 'string') {
            // Basic sentiment detection based on keywords for demo purposes if full object not stored
            let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
            if (phone.review.toLowerCase().includes("excellent") || phone.review.toLowerCase().includes("great")) sentiment = "Positive";
            else if (phone.review.toLowerCase().includes("poor") || phone.review.toLowerCase().includes("bad")) sentiment = "Negative";

            reviewData = {
                reviewText: phone.review,
                pros: [], // Not stored directly with simple string review
                cons: [], // Not stored directly with simple string review
                overallSentiment: sentiment 
            };
        } else if (typeof phone.review === 'object' && phone.review !== null && 'reviewText' in phone.review) {
             // This case should not happen with current PhoneDesign.review: string;
             // but if it were to store GeneratePhoneReviewOutput, this would handle it
             reviewData = phone.review as GeneratePhoneReviewOutput;
        } else {
            // Fallback for unexpected review format
             reviewData = {
                reviewText: String(phone.review || t('notSet')),
                pros: [],
                cons: [],
                overallSentiment: "Neutral"
            };
        }

        reviewsToShow.push({
          ...reviewData,
          phoneName: phone.name,
          phoneId: phone.id,
          reviewType: (phone as any).reviewType || 'local', // Cast to any if reviewType is not in official PhoneDesign
        });
      }
    });

    setDisplayReviews(reviewsToShow);
    setIsLoading(false);
  }, [t]);

  const getSentimentIcon = (sentiment: "Positive" | "Neutral" | "Negative") => {
    switch (sentiment) {
      case "Positive": return <Smile className="h-5 w-5 text-green-500" />;
      case "Neutral": return <Meh className="h-5 w-5 text-yellow-500" />;
      case "Negative": return <Frown className="h-5 w-5 text-red-500" />;
      default: return <MessageSquareText className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getReviewSourceIcon = (reviewType?: 'ai' | 'local') => {
    if (reviewType === 'ai') {
        return <Bot className="h-4 w-4 text-blue-500" title={t('reviewType_ai')} />;
    }
    return <Cpu className="h-4 w-4 text-purple-500" title={t('reviewType_local')} />; // Default to local/algorithmic
  };


  if (isLoading) {
    return <div className="text-center py-10">{t('loading')}</div>;
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        title={t('reviewsPageTitle')}
        description={t('reviewsPageDesc')}
      />

      {displayReviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Alert variant="default" className="bg-muted/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t('noReviewsYet')}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review) => (
            <Card key={`${review.phoneId}-${review.reviewText.slice(0,10)}`} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{review.phoneName}</CardTitle>
                    {getSentimentIcon(review.overallSentiment)}
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                    {getReviewSourceIcon(review.reviewType)}
                    {review.reviewType === 'ai' ? t('reviewType_ai') : t('reviewType_local')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <p className="text-sm italic text-muted-foreground">"{review.reviewText}"</p>
                {review.pros && review.pros.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-600">{t('reviewPros')}:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground pl-4">
                      {review.pros.map((pro, i) => <li key={`pro-${i}`}>{pro}</li>)}
                    </ul>
                  </div>
                )}
                {review.cons && review.cons.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-600">{t('reviewCons')}:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground pl-4">
                      {review.cons.map((con, i) => <li key={`con-${i}`}>{con}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
