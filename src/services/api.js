import { db } from './firebase.js';
import { collection, getDocs } from 'firebase/firestore';

// Renamed from getProducts to fetchProducts to match your existing pages
export async function fetchProducts() {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    
    // Map through the database documents and grab the data + the unique ID
    const productList = productSnapshot.docs.map(doc => ({
      id: doc.id, 
      ...doc.data()
    }));
    
    return productList;
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return empty array if it fails so the app doesn't crash
  }
}

export async function getProductById(id) {
  // Updated to call the correctly named function
  const products = await fetchProducts(); 
  
  // Find the exact product using == since Firestore IDs are strings
  return products.find(p => p.id == id); 
}