import { type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types.ts";

interface UserService {
  getOrCreateUserId(supabase: SupabaseClient<Database>, authUserId: string): Promise<number>;
}

class UserServiceImpl implements UserService {
  async getOrCreateUserId(supabase: SupabaseClient<Database>, authUserId: string): Promise<number> {
    // First try to find existing user
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("email", authUserId) // For now, use auth user ID as email (temporary)
      .single();

    if (existingUser && !selectError) {
      return existingUser.id;
    }

    // If user doesn't exist, create one
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email: authUserId, // Temporary: using auth ID as email
        password_hash: "placeholder", // This will need proper auth implementation
      })
      .select("id")
      .single();

    if (insertError) {
      // If RLS prevents insert, try to assign a temporary ID based on auth user ID
      // This is a temporary hack for development
      const tempId = parseInt(authUserId.slice(-8), 16) || 1;
      return tempId;
    }

    if (!newUser) {
      throw new Error("Failed to create user record");
    }

    return newUser.id;
  }
}

export const userService = new UserServiceImpl();
