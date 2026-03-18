import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  🔥 FIREBASE INTEGRATION LAYER
//  ─────────────────────────────────────────────────────────────────────────────
//  DEMO MODE: All data lives in memory so you can preview everything now.
//  TO DEPLOY WITH REAL FIREBASE:
//
//  1. npm install firebase
//  2. Replace each FB.* function body with the real Firebase call shown in comments
//  3. Fill in your firebaseConfig below
//
//  const firebaseConfig = {
//    apiKey: "YOUR_API_KEY",
//    authDomain: "YOUR_PROJECT.firebaseapp.com",
//    projectId: "YOUR_PROJECT_ID",
//    storageBucket: "YOUR_PROJECT.appspot.com",
//    messagingSenderId: "XXXXXXXXX",
//    appId: "YOUR_APP_ID"
//  };
//  import { initializeApp } from 'firebase/app';
//  import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
//  import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
//  import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
//  const app   = initializeApp(firebaseConfig);
//  const auth  = getAuth(app);
//  const db    = getFirestore(app);
//  const store = getStorage(app);
// ══════════════════════════════════════════════════════════════════════════════

const ADMIN_EMAIL    = "admin@fashionstyle.pk";  // ← change to your email
const ADMIN_PASSWORD = "admin123";               // ← change in Firebase Auth console
const WHATSAPP_NO    = "923001234567";           // ← shop owner WhatsApp (no + or spaces)

// ─── In-Memory Firebase Mock ──────────────────────────────────────────────────
let _session  = null;
let _products = null;

const FB = {
  // Real: const cred = await signInWithEmailAndPassword(auth, email, password); return cred.user;
  login: async (email, pw) => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL && pw === ADMIN_PASSWORD)
      return (_session = { email, uid: "admin-uid-001" });
    throw new Error("Invalid email or password. Try admin@fashionstyle.pk / admin123");
  },
  // Real: await signOut(auth);
  logout: async () => { _session = null; },
  currentUser: () => _session,

  // Real: const snap = await getDocs(query(collection(db,'products'), orderBy('createdAt','desc')));
  //       return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  getProducts: async () => _products ? [..._products] : null,
  initProducts: (seed) => { if (!_products) _products = [...seed]; },

  // Real: const ref = await addDoc(collection(db,'products'), {...data, createdAt: serverTimestamp()});
  //       return { id: ref.id, ...data };
  addProduct: async (data) => {
    const p = { ...data, id: String(Date.now()), rating: 0, reviews: 0 };
    _products = [p, ...(_products || [])];
    return p;
  },
  // Real: await updateDoc(doc(db,'products', id), data);
  updateProduct: async (id, data) => {
    _products = (_products||[]).map(p => p.id===id||p.id===Number(id) ? {...p,...data} : p);
  },
  // Real: await deleteDoc(doc(db,'products', id));
  deleteProduct: async (id) => {
    _products = (_products||[]).filter(p => p.id!==id && p.id!==Number(id));
  },
  // Real: const imgRef = ref(store, `products/${Date.now()}_${file.name}`);
  //       await uploadBytes(imgRef, file);
  //       return await getDownloadURL(imgRef);
  uploadImage: (file) => new Promise((res,rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = () => rej(new Error("Image read failed"));
    r.readAsDataURL(file);
  }),
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

const COLORS_MAP = {
  Black: { hex:"#1a1a1a", images:["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80","https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"] },
  White: { hex:"#f5f5f0", images:["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80","https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80"] },
  Red:   { hex:"#c0392b", images:["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80","https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"] },
  Blue:  { hex:"#2c3e7a", images:["https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=600&q=80","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80","https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80"] },
  Grey:  { hex:"#6b7280", images:["https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&q=80","https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"] },
  Navy:  { hex:"#1e2d5a", images:["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80","https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"] },
};

const INITIAL_PRODUCTS = [
  { id:1, name:"Signature Hoodie",        brand:"Fashion Style", price:80000,  category:"Hoodies",     rating:4.8, reviews:124, description:"Premium heavyweight cotton blend with a relaxed silhouette. Brushed fleece interior for ultimate comfort.",         colors:["Black","White","Red","Blue","Grey"], sizes:["S","M","L","XL"], tag:"BESTSELLER" },
  { id:2, name:"Classic Oxford Shirt",    brand:"Fashion Style", price:45000,  category:"Shirts",      rating:4.6, reviews:89,  description:"Timeless Oxford weave shirt crafted from 100% Egyptian cotton. Perfect for any occasion.",                          colors:["White","Blue","Grey","Navy"],        sizes:["S","M","L","XL"], tag:"NEW" },
  { id:3, name:"Tailored Slim Chinos",    brand:"Fashion Style", price:62000,  category:"Pants",       rating:4.5, reviews:67,  description:"Precision-cut chinos in stretch twill fabric. Modern tapered fit for the contemporary gentleman.",                  colors:["Black","Grey","Navy"],               sizes:["S","M","L","XL"], tag:"" },
  { id:4, name:"Leather Biker Jacket",    brand:"Fashion Style", price:185000, category:"Jackets",     rating:4.9, reviews:203, description:"Full-grain leather jacket with asymmetric zip. A wardrobe staple built to last decades.",                           colors:["Black","Red","Navy"],                sizes:["S","M","L","XL"], tag:"LUXURY" },
  { id:5, name:"Premium Runner Sneakers", brand:"Fashion Style", price:95000,  category:"Shoes",       rating:4.7, reviews:156, description:"Performance-inspired silhouette with memory foam insole. Street-ready aesthetic meets athletic function.",           colors:["White","Black","Grey"],              sizes:["S","M","L","XL"], tag:"HOT" },
  { id:6, name:"Cashmere Blend Scarf",    brand:"Fashion Style", price:28000,  category:"Accessories", rating:4.4, reviews:45,  description:"Ultra-soft cashmere-wool blend. Generous proportions for effortless draping and styling.",                         colors:["Black","White","Red","Grey"],        sizes:["S","M","L","XL"], tag:"" },
  { id:7, name:"Oversized Puffer Jacket", brand:"Fashion Style", price:135000, category:"Jackets",     rating:4.6, reviews:78,  description:"Water-resistant quilted puffer with down-alternative fill. Statement volume for cold-weather style.",               colors:["Black","White","Navy"],              sizes:["S","M","L","XL"], tag:"NEW" },
  { id:8, name:"Essential Cargo Pants",   brand:"Fashion Style", price:55000,  category:"Pants",       rating:4.3, reviews:92,  description:"Utility-inspired cargo pants in ripstop fabric. Multiple pockets with a contemporary relaxed fit.",                colors:["Black","Grey","Navy"],               sizes:["S","M","L","XL"], tag:"" },
];

const CATEGORIES = [
  { name:"Shirts",      icon:"👔", count:48, image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80" },
  { name:"Pants",       icon:"👖", count:35, image:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80" },
  { name:"Jackets",     icon:"🧥", count:29, image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80" },
  { name:"Hoodies",     icon:"🧣", count:42, image:"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80" },
  { name:"Shoes",       icon:"👟", count:61, image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { name:"Accessories", icon:"⌚", count:87, image:"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80" },
];

const REVIEWS_DATA = [
  { name:"Ahmed K.",  rating:5, date:"Feb 2025", text:"Absolutely stunning quality. The stitching is immaculate and the fit is perfect. Worth every rupee." },
  { name:"Sara M.",   rating:5, date:"Jan 2025", text:"Fashion Style never disappoints. This hoodie is incredibly soft and the color is exactly as shown." },
  { name:"Usman T.",  rating:4, date:"Jan 2025", text:"Great product overall. Delivery was fast and packaging was premium. Slight delay but worth the wait." },
  { name:"Ayesha N.", rating:5, date:"Dec 2024", text:"I've ordered 5 times now and the quality is consistently excellent. My go-to fashion brand." },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatPrice = (p) => `PKR ${Number(p).toLocaleString()}`;

const Stars = ({ rating }) => (
  <div style={{ display:"flex", gap:2 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color:i<=Math.round(rating)?"#c9a84c":"#e8e8e4", fontSize:12 }}>★</span>)}
  </div>
);

const getProductImg = (product, color) => {
  if (product.images?.length) return product.images[0];
  return COLORS_MAP[color]?.images[0] || COLORS_MAP[product.colors?.[0]]?.images[0] || "";
};

const WaIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width:20, height:20, fill:"currentColor" }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Jost:wght@200;300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold-light:#e8d5a3;--gold-dark:#9a7a2e;
  --black:#0a0a0a;--white:#fafaf8;--grey-100:#f4f4f2;--grey-200:#e8e8e4;
  --grey-400:#9a9a94;--grey-600:#5a5a54;
  --serif:'Cormorant Garamond',Georgia,serif;--sans:'Jost',sans-serif;
  --shadow:0 4px 24px rgba(0,0,0,.08);--shadow-lg:0 16px 48px rgba(0,0,0,.15);
  --transition:all .35s cubic-bezier(.4,0,.2,1);
  --green:#25D366;
}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--white);color:var(--black);font-weight:300;line-height:1.7;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--grey-100)}::-webkit-scrollbar-thumb{background:var(--gold)}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes waPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.8);opacity:0}}

/* ── HEADER ── */
.hdr{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(250,250,248,.96);backdrop-filter:blur(20px);border-bottom:1px solid var(--grey-200);transition:var(--transition)}
.hdr.scrolled{box-shadow:0 2px 20px rgba(0,0,0,.06)}
.hdr-inner{max-width:1400px;margin:0 auto;padding:0 32px;height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.logo{display:flex;align-items:center;gap:12px;cursor:pointer}
.logo-mark{width:36px;height:36px;background:var(--black);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.logo-mark span{color:var(--gold);font-family:var(--serif);font-size:18px;font-weight:700}
.logo-text{font-family:var(--serif);font-size:20px;font-weight:600;letter-spacing:.08em;color:var(--black);line-height:1.1}
.logo-sub{font-size:9px;letter-spacing:.25em;color:var(--gold);text-transform:uppercase;font-weight:500;display:block;margin-top:2px}
.nav{display:flex;align-items:center;gap:2px}
.nav-link{font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding:8px 14px;color:var(--grey-600);cursor:pointer;transition:var(--transition);border-bottom:2px solid transparent;background:none;border-top:none;border-left:none;border-right:none;font-family:var(--sans)}
.nav-link:hover{color:var(--black)}
.nav-link.active{color:var(--black);border-bottom-color:var(--gold)}
.hdr-actions{display:flex;align-items:center;gap:8px}
.icon-btn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none;position:relative;color:var(--black);transition:var(--transition);border-radius:50%;font-size:18px}
.icon-btn:hover{background:var(--grey-100)}
.badge{position:absolute;top:4px;right:4px;width:16px;height:16px;background:var(--gold);border-radius:50%;font-size:9px;font-weight:600;color:var(--black);display:flex;align-items:center;justify-content:center}

/* ── BUTTONS ── */
.btn-primary{background:var(--black);color:var(--white);font-family:var(--sans);font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;padding:16px 40px;border:2px solid var(--black);cursor:pointer;transition:var(--transition)}
.btn-primary:hover{background:var(--gold);border-color:var(--gold);color:var(--black)}
.btn-secondary{background:transparent;color:var(--black);font-family:var(--sans);font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;padding:16px 40px;border:2px solid var(--grey-200);cursor:pointer;transition:var(--transition)}
.btn-secondary:hover{border-color:var(--black)}
.btn-gold{background:var(--gold);color:var(--black);font-family:var(--sans);font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:600;padding:12px 28px;border:none;cursor:pointer;transition:var(--transition)}
.btn-gold:hover{background:var(--gold-dark);color:var(--white)}
.btn-whatsapp{display:flex;align-items:center;justify-content:center;gap:10px;background:var(--green);color:#fff;font-family:var(--sans);font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding:16px 28px;border:none;cursor:pointer;transition:var(--transition);text-decoration:none}
.btn-whatsapp:hover{background:#1da851;transform:translateY(-1px);box-shadow:0 8px 24px rgba(37,211,102,.3)}

/* ── HERO ── */
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;padding-top:72px}
.hero-left{padding:80px;display:flex;flex-direction:column;justify-content:center;background:var(--white)}
.hero-eyebrow{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);font-weight:500;margin-bottom:24px;display:flex;align-items:center;gap:12px}
.hero-eyebrow::before{content:'';width:40px;height:1px;background:var(--gold);display:block}
.hero-title{font-family:var(--serif);font-size:clamp(48px,5.5vw,84px);line-height:1.0;font-weight:600;color:var(--black);margin-bottom:28px}
.hero-title em{font-style:italic;color:var(--gold)}
.hero-desc{font-size:15px;color:var(--grey-600);max-width:380px;margin-bottom:48px;font-weight:300;line-height:1.8}
.hero-ctas{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.hero-right{position:relative;background:var(--grey-100);overflow:hidden}
.hero-img{width:100%;height:100%;object-fit:cover}
.hero-badge{position:absolute;bottom:48px;left:0;background:var(--black);color:var(--white);padding:20px 28px}
.hero-badge-num{font-family:var(--serif);font-size:36px;color:var(--gold);line-height:1}
.hero-badge-txt{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--grey-400);margin-top:4px}

/* ── SECTIONS ── */
.section{padding:100px 0}
.section-inner{max-width:1400px;margin:0 auto;padding:0 32px}
.section-header{text-align:center;margin-bottom:64px}
.section-eyebrow{font-size:10px;letter-spacing:.35em;text-transform:uppercase;color:var(--gold);font-weight:500;margin-bottom:16px}
.section-title{font-family:var(--serif);font-size:clamp(36px,4vw,56px);font-weight:600;color:var(--black);line-height:1.15}
.section-title em{font-style:italic;color:var(--gold)}
.section-divider{width:60px;height:2px;background:linear-gradient(to right,var(--gold),transparent);margin:20px auto 0}

/* ── PRODUCT GRID ── */
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:32px}
.product-card{cursor:pointer}
.product-img-wrap{position:relative;background:var(--grey-100);overflow:hidden;aspect-ratio:3/4}
.product-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.4,0,.2,1)}
.product-card:hover .product-img-wrap img{transform:scale(1.06)}
.product-tag{position:absolute;top:16px;left:16px;background:var(--gold);color:var(--black);font-size:9px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;padding:5px 10px}
.product-actions{position:absolute;bottom:0;left:0;right:0;padding:16px;display:flex;gap:8px;transform:translateY(100%);transition:var(--transition);background:linear-gradient(transparent,rgba(0,0,0,.5))}
.product-card:hover .product-actions{transform:translateY(0)}
.product-action-btn{flex:1;background:var(--white);color:var(--black);border:none;font-family:var(--sans);font-size:10px;letter-spacing:.15em;text-transform:uppercase;font-weight:500;padding:10px;cursor:pointer;transition:var(--transition)}
.product-action-btn:hover{background:var(--gold)}
.product-wishlist{width:38px;height:38px;background:var(--white);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:var(--transition);flex-shrink:0;font-size:16px}
.product-wishlist:hover{background:var(--gold)}
.product-info{padding:16px 4px}
.product-brand{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);font-weight:500;margin-bottom:6px}
.product-name{font-family:var(--serif);font-size:20px;font-weight:500;color:var(--black);margin-bottom:8px;line-height:1.3}
.product-price{font-size:15px;font-weight:500;color:var(--black);margin-bottom:8px}
.review-count{font-size:11px;color:var(--grey-400);margin-left:6px}

/* ── CATEGORIES ── */
.cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.cat-card{position:relative;aspect-ratio:1;overflow:hidden;cursor:pointer}
.cat-card img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease,filter .6s ease;filter:brightness(.65)}
.cat-card:hover img{transform:scale(1.08);filter:brightness(.45)}
.cat-overlay{position:absolute;
