import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, doc, collection, onSnapshot, setDoc, addDoc, updateDoc,
  deleteDoc, getDocs, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth, signInAnonymously, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";
import { defaultData } from "./defaults.js";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const profileRef = doc(db, "site", "profile");
const productsRef = collection(db, "products");
const experiencesRef = collection(db, "experiences");
const schedulesRef = collection(db, "schedules");

export function isFirebaseConfigured() {
  return !String(firebaseConfig.apiKey || "").includes("여기에_");
}

export function loginAdmin() {
  return signInAnonymously(auth);
}

export function logoutAdmin() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function watchProfile(callback, onError) {
  return onSnapshot(profileRef, snap => {
    callback(snap.exists() ? snap.data() : defaultData.profile);
  }, onError);
}

export function watchProducts(callback, onError) {
  const q = query(productsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
  }, onError);
}

export function watchExperiences(callback, onError) {
  const q = query(experiencesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
  }, onError);
}

export function watchSchedules(callback, onError) {
  const q = query(schedulesRef, orderBy("date", "asc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
  }, onError);
}

export function saveProfile(profile) {
  return setDoc(profileRef, { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

export function addProduct(product) {
  return addDoc(productsRef, { ...product, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function updateProduct(id, product) {
  return updateDoc(doc(db, "products", id), { ...product, updatedAt: serverTimestamp() });
}

export function deleteProductDoc(id) {
  return deleteDoc(doc(db, "products", id));
}

export function addExperience(experience) {
  return addDoc(experiencesRef, { ...experience, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function updateExperience(id, experience) {
  return updateDoc(doc(db, "experiences", id), { ...experience, updatedAt: serverTimestamp() });
}

export function deleteExperienceDoc(id) {
  return deleteDoc(doc(db, "experiences", id));
}

export function addSchedule(schedule) {
  return addDoc(schedulesRef, { ...schedule, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function deleteScheduleDoc(id) {
  return deleteDoc(doc(db, "schedules", id));
}


export async function seedDefaultData() {
  await saveProfile(defaultData.profile);

  const productSnapshot = await getDocs(productsRef);
  if (productSnapshot.empty) {
    for (const product of defaultData.products) {
      await addProduct(product);
    }
  }

  const experienceSnapshot = await getDocs(experiencesRef);
  if (experienceSnapshot.empty) {
    for (const experience of defaultData.experiences) {
      await addExperience(experience);
    }
  }

  const scheduleSnapshot = await getDocs(schedulesRef);
  if (scheduleSnapshot.empty) {
    for (const schedule of defaultData.schedules) {
      await addSchedule(schedule);
    }
  }
}

export async function resetDefaultData() {
  const productSnapshot = await getDocs(productsRef);
  for (const item of productSnapshot.docs) {
    await deleteDoc(item.ref);
  }

  const experienceSnapshot = await getDocs(experiencesRef);
  for (const item of experienceSnapshot.docs) {
    await deleteDoc(item.ref);
  }

  const scheduleSnapshot = await getDocs(schedulesRef);
  for (const item of scheduleSnapshot.docs) {
    await deleteDoc(item.ref);
  }

  await saveProfile(defaultData.profile);
  for (const product of defaultData.products) await addProduct(product);
  for (const experience of defaultData.experiences) await addExperience(experience);
  for (const schedule of defaultData.schedules) await addSchedule(schedule);
}
