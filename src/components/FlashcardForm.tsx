import { useState, useEffect, useCallback } from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import type { CreateFlashcardCommand, UpdateFlashcardCommand, FlashcardDTO } from "@/types";

interface FlashcardFormProps {
  mode: "create" | "edit";
  flashcard?: FlashcardDTO;
  initialValues?: Partial<Pick<CreateFlashcardCommand, "front" | "back" | "source">>;
  onSubmit: (data: CreateFlashcardCommand | UpdateFlashcardCommand) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;
const MAX_SOURCE_LENGTH = 200;

export function FlashcardForm({
  mode,
  flashcard,
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
  error,
}: FlashcardFormProps) {
  const [front, setFront] = useState(flashcard?.front || initialValues?.front || "");
  const [back, setBack] = useState(flashcard?.back || initialValues?.back || "");
  const [source, setSource] = useState(flashcard?.source || initialValues?.source || "");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const frontId = useId();
  const backId = useId();
  const sourceId = useId();

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!front.trim()) {
      errors.front = "Front text is required";
    } else if (front.length > MAX_FRONT_LENGTH) {
      errors.front = `Front text must be ${MAX_FRONT_LENGTH} characters or less`;
    }

    if (!back.trim()) {
      errors.back = "Back text is required";
    } else if (back.length > MAX_BACK_LENGTH) {
      errors.back = `Back text must be ${MAX_BACK_LENGTH} characters or less`;
    }

    if (source.length > MAX_SOURCE_LENGTH) {
      errors.source = `Source must be ${MAX_SOURCE_LENGTH} characters or less`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [front, back, source]);

  // Validate on change to provide immediate feedback
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data =
        mode === "create"
          ? { front: front.trim(), back: back.trim(), source: source.trim() || undefined }
          : { front: front.trim(), back: back.trim() };

      await onSubmit(data);
    } catch {
      // Error handling is done by parent component
    }
  };

  const getCharacterCountColor = (current: number, max: number) => {
    if (current > max) return "text-red-600";
    if (current > max * 0.9) return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor={frontId} className="block text-sm font-medium text-gray-700 mb-1">
          Front Text *
        </label>
        <textarea
          id={frontId}
          value={front}
          onChange={(e) => setFront(e.target.value)}
          data-testid="flashcard-front-input"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[100px] ${
            validationErrors.front ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter the question or prompt for this flashcard..."
          aria-describedby={`${frontId}-count ${validationErrors.front ? `${frontId}-error` : ""}`}
          aria-invalid={!!validationErrors.front}
          disabled={isLoading}
          required
        />
        <div className="flex justify-between items-center mt-1">
          {validationErrors.front && (
            <p id={`${frontId}-error`} className="text-sm text-red-600" role="alert">
              {validationErrors.front}
            </p>
          )}
          <div className={`text-xs ml-auto ${getCharacterCountColor(front.length, MAX_FRONT_LENGTH)}`}>
            <span id={`${frontId}-count`}>
              {front.length}/{MAX_FRONT_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={backId} className="block text-sm font-medium text-gray-700 mb-1">
          Back Text *
        </label>
        <textarea
          id={backId}
          value={back}
          onChange={(e) => setBack(e.target.value)}
          data-testid="flashcard-back-input"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[120px] ${
            validationErrors.back ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter the answer or explanation for this flashcard..."
          aria-describedby={`${backId}-count ${validationErrors.back ? `${backId}-error` : ""}`}
          aria-invalid={!!validationErrors.back}
          disabled={isLoading}
          required
        />
        <div className="flex justify-between items-center mt-1">
          {validationErrors.back && (
            <p id={`${backId}-error`} className="text-sm text-red-600" role="alert">
              {validationErrors.back}
            </p>
          )}
          <div className={`text-xs ml-auto ${getCharacterCountColor(back.length, MAX_BACK_LENGTH)}`}>
            <span id={`${backId}-count`}>
              {back.length}/{MAX_BACK_LENGTH}
            </span>
          </div>
        </div>
      </div>

      {mode === "create" && (
        <div>
          <label htmlFor={sourceId} className="block text-sm font-medium text-gray-700 mb-1">
            Source (Optional)
          </label>
          <input
            id={sourceId}
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.source ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Book title, website, or personal notes..."
            aria-describedby={`${sourceId}-count ${validationErrors.source ? `${sourceId}-error` : ""}`}
            aria-invalid={!!validationErrors.source}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-1">
            {validationErrors.source && (
              <p id={`${sourceId}-error`} className="text-sm text-red-600" role="alert">
                {validationErrors.source}
              </p>
            )}
            <div className={`text-xs ml-auto ${getCharacterCountColor(source.length, MAX_SOURCE_LENGTH)}`}>
              <span id={`${sourceId}-count`}>
                {source.length}/{MAX_SOURCE_LENGTH}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="flashcard-cancel-button"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || Object.keys(validationErrors).length > 0}
          data-testid="flashcard-submit-button"
          className="flex-1"
        >
          {isLoading ? "Saving..." : mode === "create" ? "Create Flashcard" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
