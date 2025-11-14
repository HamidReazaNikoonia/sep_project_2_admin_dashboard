import { User } from '../Users/types';
import { Product } from '../Products/types';
import { Course } from '../Course/types';
// import { Address } from '../Address/types';

export type OrderStatus = 'waiting' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'finish';
export type PaymentMethod = 'credit_card' | 'zarinpal' | 'bank_transfer' | 'cash_on_delivery';
export type PaymentStatus = 'paid' | 'unpaid';

export interface OrderProduct {
  product?: Product;
  course?: Course;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customer: User;
  transactionId?: string;
  reference: string;
  products: OrderProduct[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingAddress?: string;
  billingAddress?: string;
  deliveryFees?: number;
  taxRate?: number;
  taxes?: number;
  total: number;
  returned: boolean;
  soft_delete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}


// Order Summary Types
export interface OrderSummaryItem {
  product?: string;
  course?: string;
  quantity: number;
  price: number;
}

export interface ValidCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
}

export interface InvalidCoupon {
  code: string;
  reason: string;
}

export interface CouponInfo {
  validCoupons: ValidCoupon[];
  invalidCoupons: InvalidCoupon[];
  totalDiscount: number;
}

export interface OrderSummaryResponse {
  products: OrderSummaryItem[];
  total: number;
  tax: number;
  totalAmount: number;
  couponInfo: CouponInfo;
}