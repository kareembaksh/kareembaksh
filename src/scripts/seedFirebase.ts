import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, writeBatch } from "firebase/firestore";
import { products as staticProducts } from "../lib/products";

const firebaseConfig = {
  apiKey: "AIzaSyDtm8utWbAqtqZDi11RBTGthH9YsZAvtT0",
  authDomain: "kareembaksh-eafeb.firebaseapp.com",
  projectId: "kareembaksh-eafeb",
  storageBucket: "kareembaksh-eafeb.firebasestorage.app",
  messagingSenderId: "601000524378",
  appId: "1:601000524378:web:3bc8849dbaae8040763663",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SEED_ORDERS = [
  { id:"KB-2025-0001", date:"2025-05-10T09:23:00Z", customer:{name:"Sarah Johnson",email:"sarah.j@gmail.com",phone:"212-555-0192",address:"45 Maple Ave",city:"Albany",state:"NY",zip:"12201"}, items:[{productId:2,name:"Glossy Patent Leather Top Handle Bag",price:22.50,qty:1,image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80"},{productId:29,name:"Multi Pearl Beaded Bracelet Set",price:31.66,qty:2,image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80"}], total:85.82, status:"Delivered", tracking:"9400111899223197854392" },
  { id:"KB-2025-0002", date:"2025-05-11T14:10:00Z", customer:{name:"Emily Rodriguez",email:"emily.r@outlook.com",phone:"518-555-0341",address:"112 Pine Street",city:"Troy",state:"NY",zip:"12180"}, items:[{productId:8,name:"Graffiti Print Faux Leather Crossbody Bag",price:33.96,qty:1,image:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80"}], total:33.96, status:"Shipped", tracking:"9400111899223197821044" },
];

const SEED_REVIEWS = [
  { id:"REV-001", date:"2025-05-08T10:12:00Z", productId:2, productName:"Glossy Patent Leather Top Handle Bag", author:"Sarah Johnson", email:"sarah.j@gmail.com", rating:5, title:"Absolutely love it!", body:"This bag is even more beautiful in person. The leather feels premium and the top handle is very sturdy.", status:"Approved" },
  { id:"REV-002", date:"2025-05-09T14:30:00Z", productId:8, productName:"Graffiti Print Faux Leather Crossbody Bag", author:"Emily Rodriguez", email:"emily.r@outlook.com", rating:5, title:"Super unique and great quality", body:"I was looking for something fun and different. This bag delivers! The print is vibrant.", status:"Approved" },
];

async function seed() {
  console.log("Starting Firebase Seeding...");

  // 1. Seed Admin State (Product Overrides & Added Products)
  const adminStateRef = doc(db, "kb_admin_data", "state");
  await setDoc(adminStateRef, {
    overrides: {},
    added: staticProducts, // Initial upload of static products into cloud added list
    deleted: [],
    hidden: []
  });
  console.log("✓ Admin Product State uploaded");

  // 2. Seed Orders
  for (const order of SEED_ORDERS) {
    await setDoc(doc(db, "kb_orders", order.id), order);
  }
  console.log("✓ Orders uploaded");

  // 3. Seed Reviews
  for (const review of SEED_REVIEWS) {
    await setDoc(doc(db, "kb_reviews", review.id), review);
  }
  console.log("✓ Reviews uploaded");

  console.log("🎉 Seeding completed successfully!");
}

seed().catch(console.error);
