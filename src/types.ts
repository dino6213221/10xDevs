import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types.ts";

// Command Models (Request payloads)

// 1. SignupCommand - Based on TablesInsert<'users'> with password addition
export type SignupCommand = Pick<TablesInsert<"users">, "email"> & {
  password: string;
};

// 2. LoginCommand - Similar to signup
export type LoginCommand = SignupCommand;

// 3. UpdatePasswordCommand - No direct DB connection, custom for security
export interface UpdatePasswordCommand {
  currentPassword: string;
  newPassword: string;
}

// 4. DeleteUserCommand - No payload, type for consistency (can be void-like)
export type DeleteUserCommand = Record<string, never>;

// 5. CreateFlashcardCommand - Derived from TablesInsert<'flashcards'>, omitting auto-fields
export type CreateFlashcardCommand = Pick<TablesInsert<"flashcards">, "front" | "back" | "source" | "status">;

// 6. GetFlashcardsQuery - Query parameters for listing
export interface GetFlashcardsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// 7. UpdateFlashcardCommand - From TablesUpdate, only editable fields
export type UpdateFlashcardCommand = Pick<TablesUpdate<"flashcards">, "front" | "back" | "status">;

// 8. DeleteFlashcardCommand - No payload
export type DeleteFlashcardCommand = Record<string, never>;

// 9. GenerateFlashcardCommand - Custom for AI, options extendable
export interface GenerateFlashcardCommand {
  sourceText: string;
  options: Record<string, any>;
}

// 10. AcceptCandidateCommand - Resembles edited flashcard data
export type AcceptCandidateCommand = Pick<TablesInsert<"flashcards">, "front" | "back">;

// 11. EditCandidateCommand - Same fields as accept
export type EditCandidateCommand = AcceptCandidateCommand;

// 12. DiscardCandidateCommand - No payload
export type DiscardCandidateCommand = Record<string, never>;

// 13. RetryGenerateCommand - No payload (uses stored context)
export type RetryGenerateCommand = Record<string, never>;

// DTOs (Response payloads)

// 14. SignupResponseDTO - UserId from Tables<'users'>, message added
export interface SignupResponseDTO {
  userId: Tables<"users">["id"];
  message: string;
}

// 15. LoginResponseDTO - Includes JWT token (not in DB)
export interface LoginResponseDTO {
  token: string;
  userId: Tables<"users">["id"];
  message: string;
}

// 16. GenericMessageResponseDTO - Reused for logout, delete, etc.
export interface MessageResponseDTO {
  message: string;
}

// 17. CreateFlashcardResponseDTO - Id from Tables<'flashcards'>
export interface CreateFlashcardResponseDTO {
  flashcardId: Tables<"flashcards">["id"];
  message: string;
}

// 18. FlashcardDTO - For single card, includes timestamps
export type FlashcardDTO = Pick<
  Tables<"flashcards">,
  "id" | "front" | "back" | "created_at" | "updated_at" | "source" | "status"
>;

// 19. FlashcardListDTO - Array of simplified cards
export type FlashcardListDTO = Pick<Tables<"flashcards">, "id" | "front" | "back" | "created_at" | "status">;

// 20. FlashcardsResponseDTO - Includes pagination
export interface FlashcardsResponseDTO {
  flashcards: FlashcardListDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// 21. GenerateResponseDTO - Candidate uses flashcard-like structure
export interface GenerateResponseDTO {
  candidate: Pick<TablesInsert<"flashcards">, "front" | "back">;
  generationDurationMs: number;
}

// 22. FlashcardCandidateDTO - Temporary ID, transient
export interface FlashcardCandidateDTO {
  id: string; // temp ID like 'temp-1'
  front: string;
  back: string;
}

// 23. CandidatesResponseDTO - List of candidates (session-based, not DB)
export interface CandidatesResponseDTO {
  candidates: FlashcardCandidateDTO[];
}

// 24. AcceptCandidateResponseDTO - Similar to create
export type AcceptCandidateResponseDTO = CreateFlashcardResponseDTO;
