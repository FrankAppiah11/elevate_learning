import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensure-profile";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await req.json();
  if (!role || !["student", "instructor"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const profile = await ensureProfile(userId);
  if (!profile)
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );

  const supabase = getServiceClient();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role, onboarded: true })
    .eq("clerk_id", userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role, onboarded: true },
  });

  return NextResponse.json({
    success: true,
    role,
    redirect:
      role === "instructor"
        ? "/dashboard/instructor"
        : "/dashboard/student",
  });
}
