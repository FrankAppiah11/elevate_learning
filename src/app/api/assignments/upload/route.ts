import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const assignmentId = formData.get("assignment_id") as string | null;

  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 10 * 1024 * 1024)
    return NextResponse.json(
      { error: "File must be under 10 MB" },
      { status: 400 }
    );

  const supabase = getServiceClient();
  const ext = file.name.split(".").pop() || "bin";
  const path = `completed/${assignmentId || "general"}/${uuidv4()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("assignments")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = supabase.storage.from("assignments").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl, name: file.name });
}
