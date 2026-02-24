import { currentUser } from "@clerk/nextjs/server";
import { getServiceClient } from "./supabase";

export async function ensureProfile(clerkUserId: string) {
  const supabase = getServiceClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkUserId)
    .single();

  if (existing) return existing;

  const user = await currentUser();
  if (!user) return null;

  const email =
    user.emailAddresses?.[0]?.emailAddress || "unknown@example.com";
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || email;
  const role =
    (user.publicMetadata?.role as string) || "student";

  const { data: created, error } = await supabase
    .from("profiles")
    .upsert(
      {
        clerk_id: clerkUserId,
        email,
        full_name: fullName,
        role,
        avatar_url: user.imageUrl || null,
      },
      { onConflict: "clerk_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to create profile:", error);
    return null;
  }

  return created;
}
