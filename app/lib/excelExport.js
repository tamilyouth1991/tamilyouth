// Utility functions for Excel export functionality

export function exportOrdersToExcel(orders, filename = 'bestellungen') {
  // Create CSV content (Excel can open CSV files)
  const headers = [
    'Bestellnummer',
    'Datum',
    'Zeit',
    'Status',
    'Kunde',
    'Telefon',
    'E-Mail',
    'Lieferung',
    'Adresse',
    'Artikel',
    'Menge',
    'Einzelpreis',
    'Zwischensumme',
    'Liefergebühr',
    'Gesamtbetrag'
  ];

  const csvContent = [
    headers.join(','),
    ...orders.map(order => {
      const created = new Date(order.createdAt || Date.now());
      const date = created.toLocaleDateString('de-CH');
      const time = created.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
      
      // Flatten items for CSV
      const orderRows = [];
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          const row = [
            index === 0 ? order.orderId : '', // Only show order ID in first row
            index === 0 ? date : '',
            index === 0 ? time : '',
            index === 0 ? (order.status || 'pending') : '',
            index === 0 ? (order.customer?.name || '') : '',
            index === 0 ? (order.customer?.phone || '') : '',
            index === 0 ? (order.customer?.email || '') : '',
            index === 0 ? (order.delivery?.enabled ? 'Ja' : 'Nein') : '',
            index === 0 ? (order.delivery?.address || '') : '',
            item.name || '',
            item.quantity || 0,
            item.price || 0,
            index === 0 ? (order.subtotal || 0) : '',
            index === 0 ? (order.deliveryFee || 0) : '',
            index === 0 ? (order.total || 0) : ''
          ];
          orderRows.push(row.map(field => `"${field}"`).join(','));
        });
      } else {
        // Order without items
        const row = [
          order.orderId,
          date,
          time,
          order.status || 'pending',
          order.customer?.name || '',
          order.customer?.phone || '',
          order.customer?.email || '',
          order.delivery?.enabled ? 'Ja' : 'Nein',
          order.delivery?.address || '',
          '',
          '',
          '',
          order.subtotal || 0,
          order.deliveryFee || 0,
          order.total || 0
        ];
        orderRows.push(row.map(field => `"${field}"`).join(','));
      }
      return orderRows;
    }).flat()
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOrdersByPostalCode(postalGroups) {
  Object.entries(postalGroups).forEach(([postalCode, orders]) => {
    if (orders.length > 0) {
      exportOrdersToExcel(orders, `bestellungen_plz_${postalCode}`);
    }
  });
}

export function getOrderSummary(orders) {
  const summary = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
    totalItems: orders.reduce((sum, order) => 
      sum + (order.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0),
    deliveryOrders: orders.filter(order => order.delivery?.enabled).length,
    pickupOrders: orders.filter(order => !order.delivery?.enabled).length,
    statusCounts: {
      pending: orders.filter(order => order.status === 'pending').length,
      completed: orders.filter(order => order.status === 'completed').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length
    }
  };
  
  return summary;
}
