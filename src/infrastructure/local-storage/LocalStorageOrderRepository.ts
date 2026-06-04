import type { IOrderRepository } from '@/core/interfaces';
import type { Order, OrderStatus } from '@/core/entities';

const ORDERS_KEY = 'lumina_orders';

/**
 * LocalStorage implementation of IOrderRepository.
 */
export class LocalStorageOrderRepository implements IOrderRepository {
  getAll(): Order[] {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) {
      try { return JSON.parse(stored) as Order[]; } catch { /* ignore */ }
    }
    return this.seedOrders();
  }

  create(order: Order): Order {
    const orders = this.getAll();
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
    return order;
  }

  delete(orderId: string): Order[] {
    const updated = this.getAll().filter((o) => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return updated;
  }

  updateStatus(orderId: string, status: OrderStatus): Order[] {
    const updated = this.getAll().map((o) => o.id === orderId ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return updated;
  }

  private seedOrders(): Order[] {
    const products = [
      { id: 'p1', name: 'La Roche-Posay Hyalu B5 Serum', category: 'Serum', price: 390000, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80' },
      { id: 'p2', name: 'CeraVe Moisturising Cream', category: 'Moisturizer', price: 490000, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80' },
      { id: 'p3', name: "Paula's Choice 2% BHA Liquid Exfoliant", category: 'Toner', price: 590000, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80' },
      { id: 'p4', name: 'Cetaphil Gentle Skin Cleanser', category: 'Cleanser', price: 290000, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80' },
    ];
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah', 'David', 'Jessica', 'Daniel'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
    const paymentMethods = ['cod', 'momo', 'visa', 'apple'] as const;
    const statuses = ['completed', 'completed', 'completed', 'pending', 'canceled'] as const;

    const orders: Order[] = Array.from({ length: 24 }, () => {
      const prod = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      return {
        id: `BG-${Math.floor(100000 + Math.random() * 900000)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.image,
        productCategory: prod.category,
        quantity,
        price: prod.price,
        totalPrice: prod.price * quantity,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingInfo: {
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
          address: `${Math.floor(Math.random() * 150) + 1} Main St, ${cities[Math.floor(Math.random() * cities.length)]}`,
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 8) * 24 * 3600 * 1000).toISOString(),
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return orders;
  }
}
