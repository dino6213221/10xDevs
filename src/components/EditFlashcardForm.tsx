import { useState, useEffect, useCallback } from "react";
import { FlashcardForm } from "./FlashcardForm";
import { NotificationContainer } from "./Notification";
import type { UpdateFlashcardCommand, FlashcardDTO } from "@/types";

interface NotificationItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
}

interface EditFlashcardFormProps {
  flashcardId: number;
}

export function EditFlashcardForm({ flashcardId }: EditFlashcardFormProps) {
  const [flashcard, setFlashcard] = useState<FlashcardDTO | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationItem, "id">) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const fetchFlashcard = useCallback(async () => {
    try {
      setIsLoadingData(true);

      const response = await fetch(`/api/flashcards/${flashcardId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch flashcard");
      }

      const data = await response.json();
      setFlashcard(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load flashcard";
      addNotification({
        type: "error",
        title: "Failed to load flashcard",
        message: errorMessage,
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [flashcardId, addNotification]);

  const handleSubmit = useCallback(
    async (data: UpdateFlashcardCommand) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const response = await fetch(`/api/flashcards/${flashcardId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update flashcard");
        }

        const result = await response.json();

        addNotification({
          type: "success",
          title: "Flashcard Updated!",
          message: "Your flashcard has been successfully updated.",
        });

        // Redirect to flashcards list after a short delay
        setTimeout(() => {
          window.location.href = "/flashcards";
        }, 1500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while updating the flashcard";
        setError(errorMessage);
        addNotification({
          type: "error",
          title: "Failed to update flashcard",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [flashcardId, addNotification]
  );

  const handleCancel = useCallback(() => {
    window.history.back();
  }, []);

  useEffect(() => {
    fetchFlashcard();
  }, [fetchFlashcard]);

  if (isLoadingData) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!flashcard) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Flashcard not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <FlashcardForm
          mode="edit"
          flashcard={flashcard}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <NotificationContainer notifications={notifications} onRemove={removeNotification} position="top-right" />
    </>
  );
}
