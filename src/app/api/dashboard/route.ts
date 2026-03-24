import { NextResponse } from "next/server";

import { dashboardPayloadToJson } from "@/app/(app)/lib/dashboard-json";
import { getDashboardPayload } from "@/app/(app)/lib/home-dashboard-data";

export async function GET() {
  const payload = await getDashboardPayload();
  return NextResponse.json(dashboardPayloadToJson(payload));
}
