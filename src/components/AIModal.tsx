import { useState, useCallback, useRef, useEffect } from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "./Modal";
import type { CreateFlashcardCommand } from "@/types";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: CreateFlashcardCommand) => Promise<void>;
  isLoading: boolean;
}

const MAX_SOURCE_LENGTH = 10000;

export function AIModal({ isOpen, onClose, onGenerate, isLoading }: AIModalProps) {
  const [validationError, setValidationError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [characterCount, setCharacterCount] = useState(0);

  const sourceId = useId();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Use setTimeout to ensure focus happens after modal's focus management
      const timeoutId = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const validateInput = useCallback((text: string): string => {
    if (!text.trim()) {
      return "Source text is required to generate a flashcard";
    }
    if (text.length > MAX_SOURCE_LENGTH) {
      return `Source text must be ${MAX_SOURCE_LENGTH} characters or less`;
    }
    if (text.trim().length < 10) {
      return "Please provide at least 10 characters of source text";
    }
    return "";
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;

    setSourceText(text);
    setCharacterCount(text.length);

    if (validationError) {
      setValidationError("");
    }
  };

  const handleGenerate = async () => {
    const error = validateInput(sourceText);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      setIsGenerating(true);
      setValidationError("");

      const response = await fetch("/api/ai/generate-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceText: sourceText.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate flashcard");
      }

      const result = await response.json();

      // Populate the form with generated content
      await onGenerate({
        front: result.front,
        back: result.back,
        source: `AI Generated from: ${sourceText.slice(0, 50)}${sourceText.length > 50 ? "..." : ""}`,
      });

      // Close modal after successful generation
      onClose();
      setSourceText("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate flashcard";
      setValidationError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setSourceText("");
      setCharacterCount(0);
      setValidationError("");
      onClose();
    }
  };

  const getCharacterCountColor = (current: number, max: number) => {
    if (current > max) return "text-red-600";
    if (current > max * 0.9) return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate Flashcard with AI">
      <div className="space-y-4">
        <div>
          <label htmlFor={sourceId} className="block text-sm font-medium text-gray-700 mb-2">
            Source Text *
          </label>
          <textarea
            ref={textareaRef}
            id={sourceId}
            value={sourceText}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[200px] text-base ${
              validationError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Paste your study material here... (e.g., textbook excerpt, lecture notes, article content)"
            aria-describedby={`${sourceId}-count ${validationError ? `${sourceId}-error` : ""}`}
            aria-invalid={!!validationError}
            disabled={isGenerating}
            required
          />
          <div className="flex justify-between items-center mt-2">
            {validationError && (
              <p id={`${sourceId}-error`} className="text-sm text-red-600" role="alert">
                {validationError}
              </p>
            )}
            <div className={`text-xs ml-auto ${getCharacterCountColor(characterCount, MAX_SOURCE_LENGTH)}`}>
              <span id={`${sourceId}-count`}>
                {characterCount}/{MAX_SOURCE_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isGenerating} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !sourceText.trim()} className="flex-1">
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Flashcard"
            )}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Tips for better results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include clear concepts and definitions</li>
            <li>• Add examples and explanations</li>
            <li>• Keep the text focused on a single topic</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
