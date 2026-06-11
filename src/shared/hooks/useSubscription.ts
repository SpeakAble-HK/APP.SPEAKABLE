import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PlanId = 'free' | 'plus' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface SubscriptionFeatures {
  daily_credits: number;
  monthly_cap: number;
  speech_quest: boolean;
  ai_voice_clone: boolean;
  ipa_transcription: boolean;
  diagnostics: boolean;
  ad_free: boolean;
  parent_insights: boolean;
  nepa_analysis: boolean;
  therapist_collaboration: boolean;
  unlimited_practice: boolean;
  interactive_stories: number;
  mini_games: number;
}

export interface UserSubscription {
  plan_id: PlanId;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'annual';
  current_period_end: string | null;
  features: SubscriptionFeatures;
  plan_name: string;
  plan_name_zh: string;
  max_child_accounts: number;
}

const DEFAULT_FREE_SUBSCRIPTION: UserSubscription = {
  plan_id: 'free',
  status: 'active',
  billing_cycle: 'monthly',
  current_period_end: null,
  features: {
    daily_credits: 5,
    monthly_cap: 30,
    speech_quest: false,
    ai_voice_clone: false,
    ipa_transcription: false,
    diagnostics: false,
    ad_free: false,
    parent_insights: false,
    nepa_analysis: false,
    therapist_collaboration: false,
    unlimited_practice: false,
    interactive_stories: 3,
    mini_games: 6,
  },
  plan_name: 'Free',
  plan_name_zh: '免費',
  max_child_accounts: 1,
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    fetchSubscription(user.id);
  }, [user?.id]);

  const fetchSubscription = async (userId: string) => {
    setLoading(true);
    try {
      // Try to fetch subscription with plan details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .single();

      if (subscriptionError || !subscriptionData) {
        // No subscription found or error, use free plan
        setSubscription(DEFAULT_FREE_SUBSCRIPTION);
      } else {
        // Map the data to our UserSubscription format
        const plan = subscriptionData.plan as any;
        setSubscription({
          plan_id: subscriptionData.plan_id as PlanId,
          status: subscriptionData.status as SubscriptionStatus,
          billing_cycle: subscriptionData.billing_cycle as 'monthly' | 'annual',
          current_period_end: subscriptionData.current_period_end,
          features: plan.features as SubscriptionFeatures,
          plan_name: plan.name,
          plan_name_zh: plan.name_zh,
          max_child_accounts: plan.max_child_accounts,
        });
      }
    } catch {
      // Silently fall back to free plan on any error
      setSubscription(DEFAULT_FREE_SUBSCRIPTION);
    }
    setLoading(false);
  };

  const hasFeature = useCallback(
    (feature: keyof SubscriptionFeatures): boolean => {
      if (!subscription) return false;
      const value = subscription.features[feature];
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;
      return false;
    },
    [subscription]
  );

  const isPaidPlan = useCallback((): boolean => {
    if (!subscription) return false;
    return subscription.plan_id === 'plus' || subscription.plan_id === 'pro';
  }, [subscription]);

  const isProPlan = useCallback((): boolean => {
    if (!subscription) return false;
    return subscription.plan_id === 'pro';
  }, [subscription]);

  const canAccessFeature = useCallback(
    (requiredPlan: PlanId): boolean => {
      if (!subscription) return false;
      const planHierarchy: Record<PlanId, number> = {
        free: 0,
        plus: 1,
        pro: 2,
      };
      return planHierarchy[subscription.plan_id] >= planHierarchy[requiredPlan];
    },
    [subscription]
  );

  return {
    subscription,
    loading,
    hasFeature,
    isPaidPlan,
    isProPlan,
    canAccessFeature,
    refreshSubscription: () => user && fetchSubscription(user.id),
  };
}
