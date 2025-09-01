import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import campaignApi from './campain.api';
import type {
  Campaign,
  CampaignQueryParams,
  Offer,
  OfferQueryParams,
  ValidationItem,
} from './types';

// Query keys
const CAMPAIGNS_KEY = 'campaigns';
const OFFERS_KEY = 'offers';
const CAMPAIGN_ANALYTICS_KEY = 'campaign-analytics';
const OFFER_ANALYTICS_KEY = 'offer-analytics';
const CAMPAIGN_STATISTICS_KEY = 'campaign-statistics';

// =============================================================================
// CAMPAIGN HOOKS
// =============================================================================

// Get all campaigns
export const useCampaigns = (params?: CampaignQueryParams) => {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, params],
    queryFn: () => campaignApi.getAllCampaignsForAdmin(params),
  });
};

// Get specific campaign
export const useCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: [CAMPAIGNS_KEY, campaignId],
    queryFn: () => campaignApi.getCampaignForAdmin(campaignId),
    enabled: !!campaignId,
  });
};

// Create campaign
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignData: Partial<Campaign>) =>
      campaignApi.createCampaign(campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Update campaign
export const useUpdateCampaign = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignData: Partial<Campaign>) =>
      campaignApi.updateCampaign(campaignId, campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, campaignId] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Delete campaign
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => campaignApi.deleteCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Activate campaign
export const useActivateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => campaignApi.activateCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, campaignId] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Deactivate campaign
export const useDeactivateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => campaignApi.deactivateCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY, campaignId] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Get campaign analytics
export const useCampaignAnalytics = (campaignId: string) => {
  return useQuery({
    queryKey: [CAMPAIGN_ANALYTICS_KEY, campaignId],
    queryFn: () => campaignApi.getCampaignAnalytics(campaignId),
    enabled: !!campaignId,
  });
};

// =============================================================================
// OFFER HOOKS
// =============================================================================

// Get all offers
export const useOffers = (params?: OfferQueryParams) => {
  return useQuery({
    queryKey: [OFFERS_KEY, params],
    queryFn: () => campaignApi.getAllOffersForAdmin(params),
  });
};

// Get specific offer
export const useOffer = (offerId: string) => {
  return useQuery({
    queryKey: [OFFERS_KEY, offerId],
    queryFn: () => campaignApi.getOfferForAdmin(offerId),
    enabled: !!offerId,
  });
};

// Create offer
export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerData: Partial<Offer>) => campaignApi.createOffer(offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Update offer
export const useUpdateOffer = (offerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerData: Partial<Offer>) =>
      campaignApi.updateOffer(offerId, offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY, offerId] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Delete offer
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => campaignApi.deleteOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Activate offer
export const useActivateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => campaignApi.activateOffer(offerId),
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY, offerId] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Deactivate offer
export const useDeactivateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => campaignApi.deactivateOffer(offerId),
    onSuccess: (_, offerId) => {
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY, offerId] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Get offer analytics
export const useOfferAnalytics = (offerId: string) => {
  return useQuery({
    queryKey: [OFFER_ANALYTICS_KEY, offerId],
    queryFn: () => campaignApi.getOfferAnalytics(offerId),
    enabled: !!offerId,
  });
};

// =============================================================================
// BULK OPERATIONS HOOKS
// =============================================================================

// Bulk activate campaigns
export const useBulkActivateCampaigns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignIds: string[]) =>
      campaignApi.bulkActivateCampaigns(campaignIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Bulk deactivate campaigns
export const useBulkDeactivateCampaigns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignIds: string[]) =>
      campaignApi.bulkDeactivateCampaigns(campaignIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Bulk activate offers
export const useBulkActivateOffers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerIds: string[]) => campaignApi.bulkActivateOffers(offerIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// Bulk deactivate offers
export const useBulkDeactivateOffers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerIds: string[]) =>
      campaignApi.bulkDeactivateOffers(offerIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OFFERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATISTICS_KEY] });
    },
  });
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Get statistics
export const useCampaignStatistics = () => {
  return useQuery({
    queryKey: [CAMPAIGN_STATISTICS_KEY],
    queryFn: () => campaignApi.getStatistics(),
  });
};

// Validate items
export const useValidateItems = () => {
  return useMutation({
    mutationFn: (items: ValidationItem[]) => campaignApi.validateItems(items),
  });
};