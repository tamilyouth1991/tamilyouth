// Simple in-memory store for demo purposes. In production, use a database.
const orders = [];

export function saveOrder(order) {
  orders.unshift({ ...order, createdAt: new Date().toISOString() });
}

export function getOrders() {
  return orders;
}

export function getOrderStats() {
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveryOrders = orders.filter((o) => o.delivery?.enabled).length;
  const pickupOrders = totalOrders - deliveryOrders;
  const itemsSold = orders.reduce((sum, o) => sum + (o.items || []).reduce((s, it) => s + (it.quantity || 0), 0), 0);
  return { totalOrders, revenue, deliveryOrders, pickupOrders, itemsSold };
}


