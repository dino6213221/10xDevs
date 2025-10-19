import { type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types.ts";
import type {
  GetFlashcardsQuery,
  FlashcardsResponseDTO,
  FlashcardListDTO,
  FlashcardDTO,
  CreateFlashcardCommand,
  CreateFlashcardResponseDTO,
  UpdateFlashcardCommand,
} from "@/types.ts";
import { userService } from "./userService.ts";

interface FlashcardsService {
  getUserFlashcards(
    supabase: SupabaseClient<Database>,
    userId: string,
    params: GetFlashcardsQuery
  ): Promise<FlashcardsResponseDTO>;
  getFlashcardById(
    supabase: SupabaseClient<Database>,
    userId: string,
    flashcardId: number
  ): Promise<FlashcardDTO | null>;
  createFlashcard(
    supabase: SupabaseClient<Database>,
    userId: string,
    command: CreateFlashcardCommand
  ): Promise<CreateFlashcardResponseDTO>;
  updateFlashcard(
    supabase: SupabaseClient<Database>,
    userId: string,
    flashcardId: number,
    command: UpdateFlashcardCommand
  ): Promise<{ message: string }>;
  approveFlashcard(
    supabase: SupabaseClient<Database>,
    userId: string,
    flashcardId: number
  ): Promise<{ message: string }>;
  rejectFlashcard(
    supabase: SupabaseClient<Database>,
    userId: string,
    flashcardId: number
  ): Promise<{ message: string }>;
  deleteFlashcard(
    supabase: SupabaseClient<Database>,
    userId: string,
    flashcardId: number
  ): Promise<{ message: string }>;
}

class FlashcardsServiceImpl implements FlashcardsService {
  async getUserFlashcards(
    supabase: SupabaseClient<Database>,
    authUserId: string,
    params: GetFlashcardsQuery
  ): Promise<FlashcardsResponseDTO> {
    // Convert auth user ID to application user ID
    const userId = await userService.getOrCreateUserId(supabase, authUserId);

    // Set defaults for pagination
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const sort = params.sort ?? "created_at";
    const order = params.order ?? "desc";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("flashcards")
      .select("id, front, back, created_at, status", { count: "exact" })
      .eq("user_id", userId);

    // Apply sorting
    if (order === "desc") {
      query = query.order(sort, { ascending: false });
    } else {
      query = query.order(sort, { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: flashcards, error, count } = await query;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Transform data to match DTO
    const flashcardsList: FlashcardListDTO[] =
      flashcards?.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        created_at: card.created_at,
        status: card.status,
      })) ?? [];

    // Calculate total for pagination
    const total = count ?? 0;

    return {
      flashcards: flashcardsList,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getFlashcardById(
    supabase: SupabaseClient<Database>,
    authUserId: string,
    flashcardId: number
  ): Promise<FlashcardDTO | null> {
    // Convert auth user ID to application user ID
    const userId = await userService.getOrCreateUserId(supabase, authUserId);

    // Get single flashcard, ensuring it belongs to the user

    console.log(userId, flashcardId);

    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .select("id, front, source, back, created_at, updated_at, status")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw new Error(`Database query failed: ${error.message}`);
    }

    if (!flashcard) {
      return null;
    }

    // Transform data to match DTO
    return {
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      status: flashcard.status,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    };
  }

  async createFlashcard(
    supabase: SupabaseClient<Database>,
    authUserId: string,
    command: CreateFlashcardCommand
  ): Promise<CreateFlashcardResponseDTO> {
    // Convert auth user ID to application user ID
    const userId = await userService.getOrCreateUserId(supabase, authUserId);

    // Insert new flashcard with status (default to 'proposal' for new flashcards)
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        front: command.front,
        back: command.back,
        source: command.source,
        status: command.status ?? "proposal",
        user_id: userId,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create flashcard: no data returned");
    }

    return {
      flashcardId: data.id,
      message: "Flashcard created successfully",
    };
  }

  async updateFlashcard(
    supabase: SupabaseClient<Database>,
    authUserId: string,
    flashcardId: number,
    command: UpdateFlashcardCommand
  ): Promise<{ message: string }> {
    // Convert auth user ID to application user ID
    const userId = await userService.getOrCreateUserId(supabase, authUserId);

    // Update flashcard, ensuring it belongs to the user
    const { error } = await supabase
      .from("flashcards")
      .update({
        front: command.front,
        back: command.back,
      })
      .eq("id", flashcardId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to update flashcard: ${error.message}`);
    }

    return {
      message: "Flashcard updated successfully",
    };
  }

  async approveFlashcard(
    supabase: SupabaseClient<Database>,
    authUserId: string,
    flashcardId: number
  ): Promise<{ message: string }> {
    // Convert auth user ID to application user ID
    const userId = await userService.getOrCreateUserId(supabase, authUserId);

    // Approve flashcard (change status to 'approved'), ensuring it belongs to the user
    const { error } = await supabase
      .from("flashcards")
      .update({
        status: "approved",
      })
      .eq("id", flashcardId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to approve flashcard: ${error.message}`);
    }

    return {
      message: "Flashcard approved successfully",
    };
  }

  async rejectFlashcard(
    supabase: SupabaseClient<Database>,
    authUserId: string,
    flashcardId: number
  ): Promise<{ message: string }> {
    // Convert auth user ID to application user ID
    const userId = await userService.getOrCreateUserId(supabase, authUserId);

    // Reject flashcard (delete it), ensuring it belongs to the user
    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to reject flashcard: ${error.message}`);
    }

    return {
      message: "Flashcard rejected and deleted",
    };
  }

  async deleteFlashcard(
    supabase: SupabaseClient<Database>,
    authUserId: string,
    flashcardId: number
  ): Promise<{ message: string }> {
    // Convert auth user ID to application user ID
    const userId = await userService.getOrCreateUserId(supabase, authUserId);

    // Delete flashcard, ensuring it belongs to the user
    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete flashcard: ${error.message}`);
    }

    return {
      message: "Flashcard deleted successfully",
    };
  }
}

export const flashcardsService = new FlashcardsServiceImpl();
