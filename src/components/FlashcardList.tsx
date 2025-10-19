import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardListDTO } from "@/types";

interface FlashcardListProps {
  flashcards: FlashcardListDTO[];
  isLoading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onCreateNew: () => void;
}

export function FlashcardList({
  flashcards,
  isLoading = false,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onCreateNew,
}: FlashcardListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = useCallback(
    async (id: number) => {
      if (deletingId) return; // Prevent multiple simultaneous deletions

      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, onDelete]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards yet</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first flashcard.</p>
        <Button onClick={onCreateNew}>Create Your First Flashcard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Flashcards</h2>
        <Button onClick={onCreateNew}>Create New Flashcard</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <article
            key={flashcard.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-3">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{flashcard.front}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{flashcard.back}</p>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
              <time dateTime={flashcard.created_at}>{new Date(flashcard.created_at).toLocaleDateString()}</time>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  flashcard.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {flashcard.status === "approved" ? "Approved" : "Proposal"}
              </span>
            </div>

            <div className="flex gap-2">
              {flashcard.status === "proposal" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(flashcard.id)}
                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(flashcard.id)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => onEdit(flashcard.id)} className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(flashcard.id)}
                    disabled={deletingId === flashcard.id}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === flashcard.id ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
