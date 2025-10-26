import { z } from "zod";

import type { APIRoute } from "astro";
import type { LoginCommand } from "@/types.ts";
import { createSupabaseServerInstance } from "@/db/supabase.client.ts";

export const prerender = false;

// Zod validation schema for login request
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

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

    const validatedCommand: LoginCommand = validation.data;

    // Create Supabase instance for authentication
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedCommand.email,
      password: validatedCommand.password,
    });

    if (error) {
      // Return generic error message to avoid revealing sensitive information
      return new Response(
        JSON.stringify({
          error: "Invalid email or password. Please check your credentials and try again.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ user: data.user }), {
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
