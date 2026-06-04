/**
 * Core Order domain entity.
 */
export type PaymentMethod = 'cod' | 'momo' | 'visa' | 'apple';
export type OrderStatus = 'pending' | 'completed' | 'canceled';

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  quantity: number;
  price: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  shippingInfo: ShippingInfo;
  status: OrderStatus;
  createdAt: string;
}
