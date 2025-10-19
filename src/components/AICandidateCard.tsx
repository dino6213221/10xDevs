import { useState, useCallback } from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardCandidateDTO, AcceptCandidateCommand, EditCandidateCommand } from "@/types";

interface AICandidateCardProps {
  candidate: FlashcardCandidateDTO;
  onAccept: (id: string, data: AcceptCandidateCommand) => Promise<void>;
  onEdit: (id: string, data: EditCandidateCommand) => Promise<void>;
  onDiscard: (id: string) => Promise<void>;
  onRetry?: () => Promise<void>;
  isLoading?: boolean;
}

export function AICandidateCard({
  candidate,
  onAccept,
  onEdit,
  onDiscard,
  onRetry,
  isLoading = false,
}: AICandidateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(candidate.front);
  const [editBack, setEditBack] = useState(candidate.back);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const frontId = useId();
  const backId = useId();

  const validateEdit = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!editFront.trim()) {
      errors.front = "Front text is required";
    }
    if (!editBack.trim()) {
      errors.back = "Back text is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editFront, editBack]);

  const handleAccept = useCallback(async () => {
    if (actionLoading) return;

    setActionLoading("accept");
    try {
      await onAccept(candidate.id, { front: candidate.front, back: candidate.back });
    } finally {
      setActionLoading(null);
    }
  }, [candidate, onAccept, actionLoading]);

  const handleEditAccept = useCallback(async () => {
    if (!validateEdit()) return;
    if (actionLoading) return;

    setActionLoading("edit-accept");
    try {
      await onEdit(candidate.id, { front: editFront.trim(), back: editBack.trim() });
      setIsEditing(false);
    } finally {
      setActionLoading(null);
    }
  }, [candidate.id, editFront, editBack, onEdit, validateEdit, actionLoading]);

  const handleDiscard = useCallback(async () => {
    if (actionLoading) return;

    setActionLoading("discard");
    try {
      await onDiscard(candidate.id);
    } finally {
      setActionLoading(null);
    }
  }, [candidate.id, onDiscard, actionLoading]);

  const handleRetry = useCallback(async () => {
    if (actionLoading || !onRetry) return;

    setActionLoading("retry");
    try {
      await onRetry();
    } finally {
      setActionLoading(null);
    }
  }, [onRetry, actionLoading]);

  const startEditing = () => {
    setIsEditing(true);
    setEditFront(candidate.front);
    setEditBack(candidate.back);
    setValidationErrors({});
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditFront(candidate.front);
    setEditBack(candidate.back);
    setValidationErrors({});
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Generated Flashcard</h3>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={frontId} className="block text-sm font-medium text-gray-700 mb-1">
                Front Text *
              </label>
              <textarea
                id={frontId}
                value={editFront}
                onChange={(e) => setEditFront(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[80px] ${
                  validationErrors.front ? "border-red-500" : "border-gray-300"
                }`}
                aria-describedby={validationErrors.front ? `${frontId}-error` : undefined}
                aria-invalid={!!validationErrors.front}
                disabled={isLoading}
              />
              {validationErrors.front && (
                <p id={`${frontId}-error`} className="mt-1 text-sm text-red-600" role="alert">
                  {validationErrors.front}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={backId} className="block text-sm font-medium text-gray-700 mb-1">
                Back Text *
              </label>
              <textarea
                id={backId}
                value={editBack}
                onChange={(e) => setEditBack(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[100px] ${
                  validationErrors.back ? "border-red-500" : "border-gray-300"
                }`}
                aria-describedby={validationErrors.back ? `${backId}-error` : undefined}
                aria-invalid={!!validationErrors.back}
                disabled={isLoading}
              />
              {validationErrors.back && (
                <p id={`${backId}-error`} className="mt-1 text-sm text-red-600" role="alert">
                  {validationErrors.back}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Front:</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md min-h-[60px]">{candidate.front}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Back:</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md min-h-[80px]">{candidate.back}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        {isEditing ? (
          <>
            <Button
              onClick={handleEditAccept}
              disabled={isLoading || actionLoading === "edit-accept"}
              size="sm"
              className="flex-1 min-w-[120px]"
            >
              {actionLoading === "edit-accept" ? "Saving..." : "Save & Accept"}
            </Button>
            <Button
              onClick={cancelEditing}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1 min-w-[100px]"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleAccept}
              disabled={isLoading || actionLoading === "accept"}
              size="sm"
              className="flex-1 min-w-[100px]"
            >
              {actionLoading === "accept" ? "Accepting..." : "Accept"}
            </Button>
            <Button
              onClick={startEditing}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1 min-w-[100px]"
            >
              Edit & Accept
            </Button>
            <Button
              onClick={handleDiscard}
              variant="outline"
              size="sm"
              disabled={isLoading || actionLoading === "discard"}
              className="flex-1 min-w-[100px] text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {actionLoading === "discard" ? "Discarding..." : "Discard"}
            </Button>
            {onRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                disabled={isLoading || actionLoading === "retry"}
                className="flex-1 min-w-[100px]"
              >
                {actionLoading === "retry" ? "Retrying..." : "Retry"}
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
