import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("feedback_reports")
    .select("*")
    .eq("assignment_id", id)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}
