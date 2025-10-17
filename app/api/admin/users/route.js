import { NextResponse } from 'next/server';
import { getFirebaseDb } from '@/app/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET() {
  try {
    const db = getFirebaseDb();
    
    // Lade nur Firestore Profile (da listUsers nicht im Client verfügbar ist)
    const profilesRef = collection(db, "profiles");
    const profilesQuery = query(profilesRef, orderBy("email"));
    const profilesSnap = await getDocs(profilesQuery);
    const profilesList = profilesSnap.docs.map((d) => ({ 
      id: d.id, 
      ...d.data(),
      source: "profile"
    }));
    
    return NextResponse.json({ 
      success: true, 
      users: profilesList,
      count: profilesList.length 
    });
  } catch (error) {
    console.error('Error loading users:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
