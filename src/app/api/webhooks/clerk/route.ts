import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const eventType = payload.type;
  const supabase = getServiceClient();

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = payload.data;
    const email = email_addresses?.[0]?.email_address;
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || email;
    const role = (public_metadata?.role as string) || "student";

    const { error } = await supabase.from("profiles").upsert(
      {
        clerk_id: id,
        email,
        full_name: fullName,
        role,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id" }
    );

    if (error) {
      console.error("Webhook profile sync error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
