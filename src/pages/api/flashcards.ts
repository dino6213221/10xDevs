import { z } from "zod";

import type { APIRoute } from "astro";
import type { GetFlashcardsQuery, CreateFlashcardCommand } from "@/types.ts";
import { flashcardsService } from "@/lib/services/flashcardsService.ts";
import { createSupabaseServerInstance } from "@/db/supabase.client.ts";

export const prerender = false;

// Zod validation schema for query parameters
const getFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["created_at", "front"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Zod validation schema for creating flashcards
const createFlashcardSchema = z.object({
  front: z.string().min(1, "Front cannot be empty").max(1000, "Front is too long"),
  back: z.string().min(1, "Back cannot be empty").max(1000, "Back is too long"),
  source: z.string().max(500, "Source is too long").optional(),
  status: z.enum(["proposal", "approved"]).optional(),
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

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams: Record<string, string> = {};

    // Only include parameters that are actually provided (not null)
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");
    const sort = url.searchParams.get("sort");
    const order = url.searchParams.get("order");

    if (page !== null) queryParams.page = page;
    if (limit !== null) queryParams.limit = limit;
    if (sort !== null) queryParams.sort = sort;
    if (order !== null) queryParams.order = order;

    const validation = getFlashcardsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedParams: GetFlashcardsQuery = validation.data;

    // Get flashcards using the service
    const response = await flashcardsService.getUserFlashcards(supabase, userId, validatedParams);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
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

    const url = new URL(context.request.url);
    const flashcardId = parseInt(url.searchParams.get("id") || "0");

    if (!flashcardId || flashcardId <= 0) {
      return new Response(
        JSON.stringify({
          error: "Valid flashcard ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await context.request.json();
    const action = body.action;

    if (!action || !["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({
          error: "Valid action (approve or reject) is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let result;
    if (action === "approve") {
      result = await flashcardsService.approveFlashcard(supabase, userId, flashcardId);
    } else {
      result = await flashcardsService.rejectFlashcard(supabase, userId, flashcardId);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
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

export const POST: APIRoute = async (context) => {
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

    // Parse and validate request body
    const body = await context.request.json();
    const validation = createFlashcardSchema.safeParse(body);

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

    const validatedCommand: CreateFlashcardCommand = validation.data;

    // Create flashcard using the service
    const response = await flashcardsService.createFlashcard(supabase, userId, validatedCommand);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
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
