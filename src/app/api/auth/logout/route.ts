// app/api/auth/logout/route.ts
import { clearSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
