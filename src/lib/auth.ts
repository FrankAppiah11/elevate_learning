import { currentUser } from "@clerk/nextjs/server";
import { getServiceClient } from "./supabase";
import { UserProfile } from "@/types";

export async function getOrCreateProfile(): Promise<UserProfile | null> {
  const user = await currentUser();
  if (!user) return null;

  const supabase = getServiceClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", user.id)
    .single();

  if (existing) return existing as UserProfile;

  const role = (user.publicMetadata?.role as string) || "student";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.emailAddresses[0]?.emailAddress || "User";

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      clerk_id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      full_name: fullName,
      role,
      avatar_url: user.imageUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create profile:", error);
    return null;
  }

  return created as UserProfile;
}
