import { NextResponse } from "next/server";
import { getFirebaseDb } from "@/app/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";

export async function GET() {
  try {
    const db = getFirebaseDb();
    const usersRef = collection(db, "profiles");
    const q = query(usersRef, orderBy("email"));
    const snapshot = await getDocs(q);
    
    const users = [];
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json({ ok: false, error: "User ID and role are required" }, { status: 400 });
    }

    const validRoles = ["admin", "management", "user"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
    }

    const db = getFirebaseDb();
    const userRef = doc(db, "profiles", userId);
    await updateDoc(userRef, { role });

    return NextResponse.json({ ok: true, message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: "User ID is required" }, { status: 400 });
    }

    const db = getFirebaseDb();
    const userRef = doc(db, "profiles", userId);
    await deleteDoc(userRef);

    return NextResponse.json({ ok: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
