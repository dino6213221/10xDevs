import { z } from "zod";

import type { APIRoute } from "astro";
import type { UpdateFlashcardCommand, FlashcardDTO } from "@/types.ts";
import { flashcardsService } from "@/lib/services/flashcardsService.ts";
import { createSupabaseServerInstance } from "@/db/supabase.client.ts";

export const prerender = false;

// Zod validation schema for updating flashcards
const updateFlashcardSchema = z.object({
  front: z.string().min(1, "Front cannot be empty").max(1000, "Front is too long").optional(),
  back: z.string().min(1, "Back cannot be empty").max(1000, "Back is too long").optional(),
});

export const GET: APIRoute = async (context) => {
  try {
    // Extract user from authenticated context (set by middleware)
    const user = context.locals.user;
    if (!user || !user.id) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const userId = user.id;

    // Create Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies: context.cookies,
      headers: context.request.headers,
    });

    // Get flashcard ID from URL params
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate flashcard ID
    const idValidation = z.coerce.number().int().positive().safeParse(id);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get flashcard using the service
    const response = await flashcardsService.getFlashcardById(supabase, userId, idValidation.data);

    if (!response) {
      return new Response(
        JSON.stringify({
          error: "Flashcard not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error retrieving flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    // Extract user from authenticated context (set by middleware)
    const user = context.locals.user;
    if (!user || !user.id) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const userId = user.id;

    // Create Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies: context.cookies,
      headers: context.request.headers,
    });

    // Get flashcard ID from URL params
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate flashcard ID
    const idValidation = z.coerce.number().int().positive().safeParse(id);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await context.request.json();
    const bodyValidation = updateFlashcardSchema.safeParse(body);

    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: bodyValidation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ensure at least one field is provided for update
    if (!bodyValidation.data.front && !bodyValidation.data.back) {
      return new Response(
        JSON.stringify({
          error: "At least one field (front or back) must be provided for update",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedCommand: UpdateFlashcardCommand = bodyValidation.data;

    // Update flashcard using the service
    const response = await flashcardsService.updateFlashcard(
      supabase,
      userId,
      idValidation.data,
      validatedCommand
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    // Extract user from authenticated context (set by middleware)
    const user = context.locals.user;
    if (!user || !user.id) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const userId = user.id;

    // Create Supabase instance
    const supabase = createSupabaseServerInstance({
      cookies: context.cookies,
      headers: context.request.headers,
    });

    // Get flashcard ID from URL params
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate flashcard ID
    const idValidation = z.coerce.number().int().positive().safeParse(id);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete flashcard using the service
    const response = await flashcardsService.deleteFlashcard(supabase, userId, idValidation.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
