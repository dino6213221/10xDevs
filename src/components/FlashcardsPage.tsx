import { useState, useEffect, useCallback } from "react";
import { FlashcardList } from "./FlashcardList";
import { ConfirmationModal } from "./Modal";
import { NotificationContainer } from "./Notification";
import type { FlashcardListDTO } from "@/types";

interface NotificationItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
}

export function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<FlashcardListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    flashcardId: number | null;
    flashcardTitle: string;
  }>({
    isOpen: false,
    flashcardId: null,
    flashcardTitle: "",
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationItem, "id">) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/flashcards");
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data = await response.json();
      setFlashcards(data.flashcards || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      addNotification({
        type: "error",
        title: "Failed to load flashcards",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);  // eslint-disable-line

  const handleDelete = useCallback(
    async (id: number) => {
      const flashcard = flashcards.find((f) => f.id === id);
      if (flashcard) {
        setDeleteModal({
          isOpen: true,
          flashcardId: id,
          flashcardTitle: flashcard.front,
        });
      }
    },
    [flashcards]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteModal.flashcardId) return;

    try {
      const response = await fetch(`/api/flashcards/${deleteModal.flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      // Remove from local state
      setFlashcards((prev) => prev.filter((f) => f.id !== deleteModal.flashcardId));

      addNotification({
        type: "success",
        message: "Flashcard deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete flashcard";
      addNotification({
        type: "error",
        title: "Delete failed",
        message: errorMessage,
      });
    } finally {
      setDeleteModal({ isOpen: false, flashcardId: null, flashcardTitle: "" });
    }
  }, [deleteModal.flashcardId, addNotification]);

  const handleEdit = useCallback((id: number) => {
    // Navigate to edit page
    window.location.href = `/flashcards/${id}/edit`;
  }, []);

  const handleApprove = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "approved" }),
        });

        if (!response.ok) {
          throw new Error("Failed to approve flashcard");
        }

        // Update local state
        setFlashcards((prev) => prev.map((f) => (f.id === id ? { ...f, status: "approved" } : f)));

        addNotification({
          type: "success",
          message: "Flashcard approved successfully",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to approve flashcard";
        addNotification({
          type: "error",
          title: "Approval failed",
          message: errorMessage,
        });
      }
    },
    [addNotification]
  );

  const handleReject = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/flashcards?id=${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "reject" }),
        });

        if (!response.ok) {
          throw new Error("Failed to reject flashcard");
        }

        // Remove from local state (rejected flashcards are deleted)
        setFlashcards((prev) => prev.filter((f) => f.id !== id));

        addNotification({
          type: "success",
          message: "Flashcard rejected and deleted",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to reject flashcard";
        addNotification({
          type: "error",
          title: "Rejection failed",
          message: errorMessage,
        });
      }
    },
    [addNotification]
  );

  const handleCreateNew = useCallback(() => {
    // Navigate to create page
    window.location.href = "/flashcards/new";
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return (
    <>
      <FlashcardList
        flashcards={flashcards}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onReject={handleReject}
        onCreateNew={handleCreateNew}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, flashcardId: null, flashcardTitle: "" })}
        onConfirm={confirmDelete}
        title="Delete Flashcard"
        message={`Are you sure you want to delete the flashcard "${deleteModal.flashcardTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <NotificationContainer notifications={notifications} onRemove={removeNotification} position="top-right" />
    </>
  );
}
