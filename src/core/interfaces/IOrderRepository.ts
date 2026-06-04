import type { Order, OrderStatus } from '@/core/entities';

/**
 * Repository interface for Order operations.
 */
export interface IOrderRepository {
  getAll(): Order[];
  create(order: Order): Order;
  delete(orderId: string): Order[];
  updateStatus(orderId: string, status: OrderStatus): Order[];
}
