import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSnapshot());
}
