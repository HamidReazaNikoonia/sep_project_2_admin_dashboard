// Base Types
type ObjectId = string; // MongoDB ObjectId as string in frontend
type ISOString = string; // ISO date string format

// Enums
export type CampaignType = 'flash_sale' | 'seasonal' | 'clearance' | 'bundle' | 'referral' | 'course' | 'product';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type DiscountType = 'percentage' | 'fixed' | 'bogo';

// Upload interface (referenced from other types)
export interface Upload {
  _id: string;
  file_name: string;
  url?: string;
}

// User interface (referenced from other types)
export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

// Campaign Analytics Schema
export interface CampaignAnalytics {
  totalViews: number;
  totalClicks: number;
  totalPurchases: number;
  totalRevenue: number;
  conversionRate: number;
  clickThroughRate: number;
  lastUpdated: string;
}

// Campaign Item Schema
export interface CampaignItem {
  _id: string;
  itemType: CampaignType;
  itemId: ObjectId;
  originalPrice: number;
  campaignPrice: number;
  discountPercentage?: number;
  maxQuantity?: number | null; // null means unlimited
  soldQuantity: number;
  isActive: boolean;
}

// Global Discount Schema
export interface GlobalDiscount {
  isEnabled: boolean;
  type: DiscountType;
  value?: number;
  maxDiscountAmount?: number;
}

// Social Media Schema
export interface SocialMedia {
  shareText?: string;
  hashtags: string[];
  socialImage?: Upload;
}

// Notification Settings Schema
export interface NotificationSettings {
  emailNotification: boolean;
  smsNotification: boolean;
  pushNotification: boolean;
}

// Main Campaign Interface
export interface Campaign {
  _id: string;
  
  // Basic Information
  title: string;
  description: string;
  shortDescription?: string;
  
  // Campaign Type & Status
  type: CampaignType;
  status: CampaignStatus;
  
  // Timing
  startDate: string;
  endDate: string;
  
  // Display Settings
  isActive: boolean;
  isFeatured: boolean;
  priority: number; // 0-10
  
  // Visual Elements
  bannerImage?: Upload;
  thumbnailImage?: Upload;
  galleryImages: Upload[];
  
  // Campaign Colors
  primaryColor: string; // hex color
  secondaryColor: string; // hex color
  
  // Campaign Items
  items: CampaignItem[];
  
  // Discount Settings
  globalDiscount: GlobalDiscount;
  
  // Purchase Limits
  limitPerUser?: number | null;
  totalLimit?: number | null;
  
  // SEO and Marketing
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  
  // Social Media
  socialMedia: SocialMedia;
  
  // Management
  createdBy: ObjectId;
  managedBy: ObjectId[];
  
  // Analytics
  analytics: CampaignAnalytics;
  
  // Terms and Conditions
  termsAndConditions?: string;
  
  // Auto Settings
  autoActivate: boolean;
  autoDeactivate: boolean;
  
  // Notifications
  notifications: NotificationSettings;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface CampaignListResponse {
  campaigns: Campaign[];
  totalResults: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignResponse {
  campaign: Campaign;
}

export interface CampaignAnalyticsResponse {
  analytics: CampaignAnalytics;
}

export interface CampaignStatisticsResponse {
  totalCampaigns: number;
  activeCampaigns: number;
  scheduledCampaigns: number;
  completedCampaigns: number;
  totalRevenue: number;
  totalViews: number;
  totalClicks: number;
  averageConversionRate: number;
}

// Offer Types (similar to Campaign but for offers)
export interface Offer extends Omit<Campaign, 'type'> {
  offerType: string;
}

export interface OfferListResponse {
  offers: Offer[];
  totalResults: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OfferResponse {
  offer: Offer;
}

// Bulk Operations
export interface BulkOperationResponse {
  success: boolean;
  message: string;
  affectedCount: number;
}

// Validation Types
export interface ValidationItem {
  itemType: CampaignType;
  itemId: ObjectId;
}

export interface ValidationResponse {
  valid: boolean;
  validItems: ValidationItem[];
  invalidItems: ValidationItem[];
  message: string;
}

// Query Parameters
export interface CampaignQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CampaignStatus;
  type?: CampaignType;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface OfferQueryParams extends Omit<CampaignQueryParams, 'type'> {
  offerType?: string;
}