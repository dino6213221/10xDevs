export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export type FlashcardDifficulty = "easy" | "medium" | "hard" | "expert";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: FlashcardDifficulty;
  status: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
}

export interface CreateFlashcardCommand {
  front: string;
  back: string;
  source?: string;
  difficulty?: FlashcardDifficulty;
  tags?: string[];
}

export interface UpdateFlashcardCommand extends Partial<CreateFlashcardCommand> {} // eslint-disable-line

export interface FlashcardDTO {
  id: string;
  front: string;
  back: string;
  difficulty: FlashcardDifficulty;
  status: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
}

export interface FlashcardListDTO {
  id: number;
  front: string;
  back: string;
  status: string;
  created_at: string;
}

export interface GetFlashcardsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface FlashcardsResponseDTO {
  flashcards: FlashcardListDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateFlashcardResponseDTO {
  success: boolean;
  flashcard: FlashcardDTO;
}

export interface AIGenerateRequest {
  topic: string;
  difficulty: FlashcardDifficulty;
  count: number;
  existingFlashcards?: FlashcardDTO[];
}

export interface AIGenerateResponse {
  flashcards: Omit<FlashcardDTO, "id" | "user_id" | "created_at" | "updated_at">[];
}

export interface AIReviewRequest {
  front: string;
  back: string;
  flashcardId?: string;
}

export interface AIReviewResponse {
  suggestions: string[];
  score: number;
}

// Flashcard API DTOs
export interface UpdateFlashcardRequestDTO {
  front?: string;
  back?: string;
  difficulty?: FlashcardDifficulty;
  tags?: string[];
  status?: string;
}

export interface PaginationDTO {
  offset: number;
  limit: number;
}

export interface SortDTO {
  field: string;
  order: "asc" | "desc";
}

export interface FlashcardFiltersDTO {
  difficulty?: FlashcardDifficulty;
  status?: string;
  tags?: string[];
}

export interface FlashcardCollectionFiltersDTO {
  difficulty?: FlashcardDifficulty[];
  status?: string[];
  tags?: string[];
  text?: string;
}

export interface AuthUser {
  id?: string;
  email?: string;
}

export interface GenerateFlashcardCommand {
  sourceText: string;
  options?: Record<string, unknown>;
}

export interface FlashcardCandidateDTO {
  id: string;
  front: string;
  back: string;
}

export interface AcceptCandidateCommand {
  front: string;
  back: string;
}

export interface EditCandidateCommand {
  front: string;
  back: string;
}
