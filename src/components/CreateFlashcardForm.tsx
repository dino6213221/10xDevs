import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FlashcardForm } from "./FlashcardForm";
import { NotificationContainer } from "./Notification";
import { AIModal } from "./AIModal";
import type { CreateFlashcardCommand, UpdateFlashcardCommand } from "@/types";

interface NotificationItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
}

export function CreateFlashcardForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<
    Partial<Pick<CreateFlashcardCommand, "front" | "back" | "source">>
  >({});

  const addNotification = useCallback((notification: Omit<NotificationItem, "id">) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleSubmit = useCallback(
    async (data: CreateFlashcardCommand | UpdateFlashcardCommand) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create flashcard");
        }

        const result = await response.json();

        addNotification({
          type: "success",
          title: "Flashcard Created!",
          message: "Your flashcard has been successfully added to your collection.",
        });

        // Redirect to flashcards list after a short delay
        setTimeout(() => {
          window.location.href = "/flashcards";
        }, 1500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the flashcard";
        setError(errorMessage);
        addNotification({
          type: "error",
          title: "Failed to create flashcard",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification]
  );

  const handleCancel = useCallback(() => {
    window.history.back();
  }, []);

  const handleUseAI = useCallback(() => {
    setIsAIModalOpen(true);
  }, []);

  const handleAIModalClose = useCallback(() => {
    setIsAIModalOpen(false);
  }, []);

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <Button onClick={handleUseAI} variant="outline" className="w-full" disabled={isLoading}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Use AI to Generate Flashcard
          </Button>
        </div>

        <FlashcardForm
          mode="create"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <AIModal isOpen={isAIModalOpen} onClose={handleAIModalClose} onGenerate={handleSubmit} isLoading={isLoading} />

      <NotificationContainer notifications={notifications} onRemove={removeNotification} position="top-right" />
    </>
  );
}
