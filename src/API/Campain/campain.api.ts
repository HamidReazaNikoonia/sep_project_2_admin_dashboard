import api from '../axios';
import type {
  Campaign,
  CampaignListResponse,
  CampaignResponse,
  CampaignAnalyticsResponse,
  CampaignStatisticsResponse,
  CampaignQueryParams,
  Offer,
  OfferListResponse,
  OfferResponse,
  OfferQueryParams,
  BulkOperationResponse,
  ValidationResponse,
  ValidationItem,
} from './types';

export const campaignApi = {
  // =============================================================================
  // ADMIN CAMPAIGN ROUTES
  // =============================================================================
  
  // Get all campaigns for admin
  getAllCampaignsForAdmin: async (params?: CampaignQueryParams): Promise<CampaignListResponse> => {
    const response = await api.get('/admin/campaigns', { params });
    return response.data;
  },

  // Create new campaign
  createCampaign: async (campaignData: Partial<Campaign>): Promise<CampaignResponse> => {
    const response = await api.post('/admin/campaigns', campaignData);
    return response.data;
  },

  // Get specific campaign for admin
  getCampaignForAdmin: async (campaignId: string): Promise<CampaignResponse> => {
    const response = await api.get(`/admin/campaigns/${campaignId}`);
    return response.data;
  },

  // Update campaign
  updateCampaign: async (campaignId: string, campaignData: Partial<Campaign>): Promise<CampaignResponse> => {
    const response = await api.put(`/admin/campaigns/${campaignId}`, campaignData);
    return response.data;
  },

  // Delete campaign
  deleteCampaign: async (campaignId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/campaigns/${campaignId}`);
    return response.data;
  },

  // Campaign status management
  activateCampaign: async (campaignId: string): Promise<CampaignResponse> => {
    const response = await api.patch(`/admin/campaigns/${campaignId}/activate`);
    return response.data;
  },

  deactivateCampaign: async (campaignId: string): Promise<CampaignResponse> => {
    const response = await api.patch(`/admin/campaigns/${campaignId}/deactivate`);
    return response.data;
  },

  // Campaign analytics
  getCampaignAnalytics: async (campaignId: string): Promise<CampaignAnalyticsResponse> => {
    const response = await api.get(`/admin/campaigns/${campaignId}/analytics`);
    return response.data;
  },

  // =============================================================================
  // ADMIN OFFER ROUTES
  // =============================================================================

  // Get all offers for admin
  getAllOffersForAdmin: async (params?: OfferQueryParams): Promise<OfferListResponse> => {
    const response = await api.get('/admin/offers', { params });
    return response.data;
  },

  // Create new offer
  createOffer: async (offerData: Partial<Offer>): Promise<OfferResponse> => {
    const response = await api.post('/admin/offers', offerData);
    return response.data;
  },

  // Get specific offer for admin
  getOfferForAdmin: async (offerId: string): Promise<OfferResponse> => {
    const response = await api.get(`/admin/offers/${offerId}`);
    return response.data;
  },

  // Update offer
  updateOffer: async (offerId: string, offerData: Partial<Offer>): Promise<OfferResponse> => {
    const response = await api.put(`/admin/offers/${offerId}`, offerData);
    return response.data;
  },

  // Delete offer
  deleteOffer: async (offerId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/offers/${offerId}`);
    return response.data;
  },

  // Offer status management
  activateOffer: async (offerId: string): Promise<OfferResponse> => {
    const response = await api.patch(`/admin/offers/${offerId}/activate`);
    return response.data;
  },

  deactivateOffer: async (offerId: string): Promise<OfferResponse> => {
    const response = await api.patch(`/admin/offers/${offerId}/deactivate`);
    return response.data;
  },

  // Offer analytics
  getOfferAnalytics: async (offerId: string): Promise<CampaignAnalyticsResponse> => {
    const response = await api.get(`/admin/offers/${offerId}/analytics`);
    return response.data;
  },

  // =============================================================================
  // UTILITY ROUTES
  // =============================================================================

  // Bulk operations for campaigns
  bulkActivateCampaigns: async (campaignIds: string[]): Promise<BulkOperationResponse> => {
    const response = await api.post('/admin/campaigns/bulk-activate', { campaignIds });
    return response.data;
  },

  bulkDeactivateCampaigns: async (campaignIds: string[]): Promise<BulkOperationResponse> => {
    const response = await api.post('/admin/campaigns/bulk-deactivate', { campaignIds });
    return response.data;
  },

  // Bulk operations for offers
  bulkActivateOffers: async (offerIds: string[]): Promise<BulkOperationResponse> => {
    const response = await api.post('/admin/offers/bulk-activate', { offerIds });
    return response.data;
  },

  bulkDeactivateOffers: async (offerIds: string[]): Promise<BulkOperationResponse> => {
    const response = await api.post('/admin/offers/bulk-deactivate', { offerIds });
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<CampaignStatisticsResponse> => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  // Validate campaign/offer items
  validateItems: async (items: ValidationItem[]): Promise<ValidationResponse> => {
    const response = await api.post('/admin/validate-items', { items });
    return response.data;
  },
};

export default campaignApi;