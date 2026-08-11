import { db } from './firebase.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { products as demoProducts } from '../utils/data.js';

// Fetch all products with smart demo fallback
export async function fetchProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const realProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // IF REAL PRODUCTS EXIST IN FIRESTORE -> SHOW ONLY REAL PRODUCTS
    if (realProducts.length > 0) {
      return realProducts;
    }

    // IF DATABASE IS EMPTY -> SHOW DEMO PRODUCTS
    return demoProducts;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    return demoProducts;
  }
}

// Fetch single product by ID
export async function getProductById(id) {
  if (id.startsWith('demo-')) {
    return demoProducts.find(p => p.id === id) || null;
  }

  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
  }

  return demoProducts.find(p => p.id === id) || null;
}