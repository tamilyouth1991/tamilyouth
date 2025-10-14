// Simple in-memory store for demo purposes. In production, use a database.
const orders = [];

export function saveOrder(order) {
  orders.unshift({ ...order, createdAt: new Date().toISOString(), status: 'pending' });
}

export function getOrders() {
  return orders;
}

export function getOrderById(orderId) {
  return orders.find(o => o.orderId === orderId);
}

export function updateOrder(orderId, updates) {
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    return orders[index];
  }
  return null;
}

export function deleteOrder(orderId) {
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    return orders.splice(index, 1)[0];
  }
  return null;
}

export function getOrdersByPostalCode(postalCode) {
  return orders.filter(o => {
    const address = o.delivery?.address || '';
    return address.includes(postalCode);
  });
}

export function getOrderStats() {
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveryOrders = orders.filter((o) => o.delivery?.enabled).length;
  const pickupOrders = totalOrders - deliveryOrders;
  const itemsSold = orders.reduce((sum, o) => sum + (o.items || []).reduce((s, it) => s + (it.quantity || 0), 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  
  // Item breakdown
  const itemBreakdown = {
    'Vegi Kotthurotti': 0,
    'Kotthurotti': 0,
    'Cola Dose': 0,
    'Eistee Dose': 0
  };
  
  orders.forEach(order => {
    if (order.items) {
      order.items.forEach(item => {
        if (itemBreakdown.hasOwnProperty(item.name)) {
          itemBreakdown[item.name] += item.quantity || 0;
        }
      });
    }
  });
  
  return { 
    totalOrders, 
    revenue, 
    deliveryOrders, 
    pickupOrders, 
    itemsSold,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    itemBreakdown
  };
}

export function getOrdersGroupedByPostalCode() {
  const postalGroups = {};
  
  orders.forEach(order => {
    if (order.delivery?.enabled && order.delivery?.address) {
      // Extract postal code from address (assuming Swiss format: 4 digits)
      const postalMatch = order.delivery.address.match(/\b\d{4}\b/);
      if (postalMatch) {
        const postalCode = postalMatch[0];
        if (!postalGroups[postalCode]) {
          postalGroups[postalCode] = [];
        }
        postalGroups[postalCode].push(order);
      }
    }
  });
  
  return postalGroups;
}


