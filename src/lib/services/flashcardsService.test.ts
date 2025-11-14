import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";
import type { GetFlashcardsQuery, FlashcardsResponseDTO, FlashcardListDTO } from "@/types";

// Import the service and dependencies
import { flashcardsService } from "./flashcardsService";
import { userService } from "./userService";

// Mock userServices
vi.mock("./userService", () => ({
  userService: {
    getOrCreateUserId: vi.fn(),
  },
}));

// Create a mock query builder that chains properly
const createMockQueryBuilder = () => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  };
  return builder;
};

let mockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => mockQueryBuilder),
  })),
}));

beforeAll(() => {
  // Initialize mock query builder
  mockQueryBuilder = createMockQueryBuilder();
});

describe("FlashcardsService.getUserFlashcards", () => {
  let mockSupabaseClient: SupabaseClient<Database> = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY
  ) as SupabaseClient<Database>;

  const mockAuthUserId = "auth-user-123";
  const mockAppUserId = 42;

  // Initialize at describe level to satisfy TypeScript
  mockSupabaseClient = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY
  ) as SupabaseClient<Database>;

  beforeEach(() => {
    // Reset mock query builder for each test
    mockQueryBuilder.select.mockClear();
    mockQueryBuilder.eq.mockClear();
    mockQueryBuilder.order.mockClear();
    mockQueryBuilder.range.mockClear();

    // Mock userService to return app user ID
    vi.mocked(userService.getOrCreateUserId).mockResolvedValue(mockAppUserId);

    // Make sure range returns a promise that resolves to the database response for each test
    mockQueryBuilder.range.mockResolvedValue(mockSupabaseResponse);
  });

  // Test data fixtures
  const mockFlashcards: FlashcardListDTO[] = [
    {
      id: 1,
      front: "What is React?",
      back: "A JavaScript library for building user interfaces",
      created_at: "2025-01-01T10:00:00Z",
      status: "proposal",
    },
    {
      id: 2,
      front: "What is TypeScript?",
      back: "A typed superset of JavaScript",
      created_at: "2025-01-02T11:00:00Z",
      status: "approved",
    },
  ];

  const mockSupabaseResponse = {
    data: mockFlashcards.map((card) => ({
      ...card,
      source: "test-source", // Full row includes source and updated_at
      updated_at: card.created_at,
    })),
    error: null,
    count: mockFlashcards.length,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Default parameters handling", () => {
    it("should use defaults when no parameters provided", async () => {
      const params: GetFlashcardsQuery = {};

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      // Verify userService was called to convert auth user ID
      expect(userService.getOrCreateUserId).toHaveBeenCalledWith(mockSupabaseClient, mockAuthUserId);

      // Verify query building
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("flashcards");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("id, front, back, created_at, status", { count: "exact" });
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", mockAppUserId);

      // Verify default sorting (created_at desc)
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });

      // Verify default pagination (page 1, limit 10, offset 0)
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9); // offset 0, limit 10 - 1

      // Verify response structure
      expect(result).toEqual({
        flashcards: mockFlashcards,
        pagination: {
          page: 1,
          limit: 10,
          total: mockFlashcards.length,
        },
      });
    });

    it("should apply custom parameters over defaults", async () => {
      const params: GetFlashcardsQuery = {
        page: 2,
        limit: 5,
        sort: "front",
        order: "asc",
      };

      // Update range to return custom response for this test
      mockQueryBuilder.range.mockResolvedValueOnce({
        ...mockSupabaseResponse,
        count: 15, // More items for pagination
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.order).toHaveBeenCalledWith("front", {
        ascending: true,
      });
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(5, 9); // (2-1)*5 = 5, +4 = 9

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
      });
    });
  });

  describe("User ID conversion", () => {
    it("should convert auth user ID to app user ID via userService", async () => {
      const params: GetFlashcardsQuery = {};

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(userService.getOrCreateUserId).toHaveBeenCalledWith(mockSupabaseClient, mockAuthUserId);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", mockAppUserId);
    });

    it("should propagate userService errors", async () => {
      const params: GetFlashcardsQuery = {};
      const userServiceError = new Error("User not found");

      vi.mocked(userService.getOrCreateUserId).mockRejectedValue(userServiceError);

      await expect(flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("Pagination logic", () => {
    it("should calculate correct offset for page 1", async () => {
      const params: GetFlashcardsQuery = { page: 1, limit: 10 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
    });

    it("should calculate correct offset for page 2", async () => {
      const params: GetFlashcardsQuery = { page: 2, limit: 5 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(5, 9);
    });

    it("should handle negative page values gracefully", async () => {
      const params: GetFlashcardsQuery = { page: -1, limit: 10 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(-20, -11); // (page-1)*limit = (-1-1)*10 = -20, + limit - 1 = -11
    });

    it("should handle zero page value", async () => {
      const params: GetFlashcardsQuery = { page: 0, limit: 10 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(-10, -1); // Invalid range
    });

    it("should handle large page numbers", async () => {
      const params: GetFlashcardsQuery = { page: 1000, limit: 10 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(9990, 9999);
    });
  });

  describe("Sorting functionality", () => {
    it("should sort by created_at descending by default", async () => {
      const params: GetFlashcardsQuery = {};

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("should sort by front in ascending order", async () => {
      const params: GetFlashcardsQuery = { sort: "front", order: "asc" };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.order).toHaveBeenCalledWith("front", {
        ascending: true,
      });
    });

    it("should sort by status in descending order", async () => {
      const params: GetFlashcardsQuery = {
        sort: "status",
        order: "desc",
      };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.order).toHaveBeenCalledWith("status", {
        ascending: false,
      });
    });

    it("should handle invalid sort fields gracefully", async () => {
      const params: GetFlashcardsQuery = {
        sort: "invalid_field",
        order: "asc",
      };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      // Should still try to sort by the invalid field (Supabase will handle validation)
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("invalid_field", {
        ascending: true,
      });
    });
  });

  describe("Data transformation", () => {
    it("should transform full database rows to FlashcardListDTO format", async () => {
      const mockFullData = [
        {
          id: 1,
          front: "Test Front",
          back: "Test Back",
          created_at: "2025-01-01T00:00:00Z",
          status: "approved",
          source: "test source",
          updated_at: "2025-01-01T00:01:00Z",
        },
      ];

      const expectedTransformed: FlashcardListDTO[] = [
        {
          id: 1,
          front: "Test Front",
          back: "Test Back",
          created_at: "2025-01-01T00:00:00Z",
          status: "approved",
        },
      ];

      mockQueryBuilder.range.mockResolvedValueOnce({
        data: mockFullData,
        error: null,
        count: 1,
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {});

      expect(result.flashcards).toEqual(expectedTransformed);
    });

    it("should handle null data gracefully", async () => {
      mockQueryBuilder.range.mockResolvedValueOnce({
        data: null,
        error: null,
        count: null,
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {});

      expect(result.flashcards).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should handle undefined data", async () => {
      mockQueryBuilder.range.mockResolvedValueOnce({
        data: undefined,
        error: null,
        count: null,
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {});

      expect(result.flashcards).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should handle empty array data", async () => {
      mockQueryBuilder.range.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {});

      expect(result.flashcards).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should handle null total count", async () => {
      mockQueryBuilder.range.mockResolvedValueOnce({
        data: mockSupabaseResponse.data,
        error: null,
        count: null,
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {});

      expect(result.pagination.total).toBe(0);
    });

    it("should handle undefined total count", async () => {
      mockQueryBuilder.range.mockResolvedValueOnce({
        data: mockSupabaseResponse.data,
        error: null,
        count: undefined,
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {});

      expect(result.pagination.total).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("should throw error when database query fails", async () => {
      const dbError = new Error("Database connection failed");
      mockQueryBuilder.range.mockResolvedValueOnce({
        data: null,
        error: dbError,
        count: null,
      });

      await expect(flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {})).rejects.toThrow(
        "Database query failed: Database connection failed"
      );
    });

    it("should propagate Supabase error details", async () => {
      const supabaseError = { message: "Table does not exist", code: "42P01" };
      mockQueryBuilder.range.mockResolvedValueOnce({
        data: null,
        error: supabaseError,
        count: null,
      });

      await expect(flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {})).rejects.toThrow(
        "Database query failed: Table does not exist"
      );
    });

    it("should handle network errors", async () => {
      mockQueryBuilder.range.mockRejectedValueOnce(new Error("Network timeout"));

      await expect(flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, {})).rejects.toThrow(
        "Network timeout"
      );
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("should handle malformed query parameters", async () => {
      const params: GetFlashcardsQuery = {
        page: NaN,
        limit: Infinity,
        sort: "",
        order: "desc",
      };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      // Should still work despite invalid parameters
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(NaN, NaN);
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("", {
        ascending: false,
      });
    });

    it("should handle extreme limit values", async () => {
      const params: GetFlashcardsQuery = { page: 1, limit: 10000 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9999);
    });

    it("should handle zero limit", async () => {
      const params: GetFlashcardsQuery = { page: 1, limit: 0 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, -1);
    });

    it("should handle negative limit", async () => {
      const params: GetFlashcardsQuery = { page: 1, limit: -5 };

      await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(-0, -6); // -0 is same as 0
    });

    it("should handle empty auth user ID", async () => {
      const emptyAuthUserId = "";

      // This might work or fail depending on userService implementation
      await flashcardsService.getUserFlashcards(mockSupabaseClient, emptyAuthUserId, {});

      expect(userService.getOrCreateUserId).toHaveBeenCalledWith(mockSupabaseClient, "");
    });
  });

  describe("Type safety", () => {
    it("should work with proper Supabase Database types", async () => {
      const result: FlashcardsResponseDTO = await flashcardsService.getUserFlashcards(
        mockSupabaseClient,
        mockAuthUserId,
        { page: 1, limit: 10, sort: "created_at", order: "desc" }
      );

      // Type assertions to ensure proper typing
      const flashcards: FlashcardListDTO[] = result.flashcards;
      expect(Array.isArray(flashcards)).toBe(true);

      if (flashcards.length > 0) {
        const firstCard: FlashcardListDTO = flashcards[0];
        expect(typeof firstCard.id).toBe("number");
        expect(typeof firstCard.front).toBe("string");
        expect(typeof firstCard.back).toBe("string");
        expect(typeof firstCard.created_at).toBe("string");
        expect(["proposal", "approved", "rejected"]).toContain(firstCard.status);
      }
    });

    it("should handle query parameters with proper typing", async () => {
      const params: GetFlashcardsQuery = {
        page: 1,
        limit: 20,
        sort: "created_at",
        order: "asc",
      };

      mockQueryBuilder.range.mockResolvedValueOnce({
        ...mockSupabaseResponse,
        count: 100,
      });

      const result = await flashcardsService.getUserFlashcards(mockSupabaseClient, mockAuthUserId, params);

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 100, // This matches the mock override with count: 100
      });
    });
  });
});
