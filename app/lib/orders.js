import { getFirebaseDb } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp 
} from "firebase/firestore";

const COLLECTION_NAME = "orders";

export async function saveOrder(order) {
  try {
    const db = getFirebaseDb();
    const orderData = {
      ...order,
      createdAt: serverTimestamp(),
      status: order.status || 'pending'
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), orderData);
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error saving order:", error);
    throw error;
  }
}

export async function getOrders() {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

export async function getOrderById(orderId) {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting order by ID:", error);
    return null;
  }
}

export async function updateOrder(orderId, updates) {
  try {
    const db = getFirebaseDb();
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(orderRef, updateData);
    
    // Return updated order
    const updatedOrder = await getOrderById(orderId);
    return updatedOrder;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

export async function deleteOrder(orderId) {
  try {
    const db = getFirebaseDb();
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    
    // Get order before deleting for return value
    const orderToDelete = await getOrderById(orderId);
    
    await deleteDoc(orderRef);
    return orderToDelete;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

export async function getOrdersByPostalCode(postalCode) {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTION_NAME),
      where("delivery.address", ">=", postalCode),
      where("delivery.address", "<=", postalCode + "\uf8ff")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error getting orders by postal code:", error);
    return [];
  }
}

export async function getOrderStats() {
  try {
    const orders = await getOrders();
    
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
  } catch (error) {
    console.error("Error getting order stats:", error);
    return {
      totalOrders: 0,
      revenue: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      itemsSold: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      itemBreakdown: {
        'Kotthurotti': 0,
        'Cola Dose': 0,
        'Eistee Dose': 0
      }
    };
  }
}

export async function getOrdersGroupedByPostalCode() {
  try {
    const orders = await getOrders();
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
  } catch (error) {
    console.error("Error getting orders grouped by postal code:", error);
    return {};
  }
}


