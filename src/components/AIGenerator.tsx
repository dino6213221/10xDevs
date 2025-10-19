import { useState, useCallback } from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import type { GenerateFlashcardCommand } from "@/types";

interface AIGeneratorProps {
  onGenerate: (data: GenerateFlashcardCommand) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

const MAX_SOURCE_LENGTH = 10000; // Reasonable limit for AI input

export function AIGenerator({ onGenerate, isLoading, error }: AIGeneratorProps) {
  const [sourceText, setSourceText] = useState("");
  const [validationError, setValidationError] = useState<string>("");

  const sourceId = useId();

  const validateInput = useCallback((text: string): string => {
    if (!text.trim()) {
      return "Source text is required to generate flashcards";
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
    setValidationError(validateInput(text));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateInput(sourceText);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await onGenerate({ sourceText: sourceText.trim(), options: {} });
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const getCharacterCountColor = (current: number, max: number) => {
    if (current > max) return "text-red-600";
    if (current > max * 0.9) return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Flashcards with AI</h2>
        <p className="text-gray-600">
          Paste your study material below and our AI will create flashcards for you. The more detailed your source text,
          the better the results.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={sourceId} className="block text-sm font-medium text-gray-700 mb-2">
            Source Text *
          </label>
          <textarea
            id={sourceId}
            value={sourceText}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[200px] text-base ${
              validationError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Paste your study material here... (e.g., textbook excerpt, lecture notes, article content)"
            aria-describedby={`${sourceId}-count ${validationError ? `${sourceId}-error` : ""}`}
            aria-invalid={!!validationError}
            disabled={isLoading}
            required
          />
          <div className="flex justify-between items-center mt-2">
            {validationError && (
              <p id={`${sourceId}-error`} className="text-sm text-red-600" role="alert">
                {validationError}
              </p>
            )}
            <div className={`text-xs ml-auto ${getCharacterCountColor(sourceText.length, MAX_SOURCE_LENGTH)}`}>
              <span id={`${sourceId}-count`}>
                {sourceText.length}/{MAX_SOURCE_LENGTH}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || !!validationError || !sourceText.trim()}
            className="flex-1 py-3 text-base"
          >
            {isLoading ? (
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
                Generating Flashcards...
              </span>
            ) : (
              "Generate Flashcards"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for better results:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include clear concepts and definitions</li>
          <li>• Add examples and explanations</li>
          <li>• Use structured content (headings, lists, etc.)</li>
          <li>• Keep the text focused on a single topic</li>
        </ul>
      </div>
    </div>
  );
}
