import { z } from "zod";

import type { APIRoute } from "astro";
import type { SignupCommand } from "@/types.ts";
import { createSupabaseServerInstance } from "@/db/supabase.client.ts";

export const prerender = false;

// Zod validation schema for signup request
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedCommand: SignupCommand = validation.data;

    // Create Supabase instance for authentication
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.signUp({
      email: validatedCommand.email,
      password: validatedCommand.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Automatically log in the user after successful registration
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: validatedCommand.email,
      password: validatedCommand.password,
    });

    if (loginError) {
      return new Response(
        JSON.stringify({
          error: `Registration successful, but login failed: ${loginError.message}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ user: loginData.user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
