import { getServiceClient } from "./supabase";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function generateUniqueClassCode(): Promise<string> {
  const supabase = getServiceClient();
  let code = randomCode();
  let attempts = 0;

  while (attempts < 10) {
    const { data } = await supabase
      .from("modules")
      .select("id")
      .eq("class_code", code)
      .single();

    if (!data) return code;
    code = randomCode();
    attempts++;
  }

  return `${randomCode()}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
}
