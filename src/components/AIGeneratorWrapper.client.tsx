import { useState } from "react";
import { AIGenerator } from "./AIGenerator";
import type { GenerateFlashcardCommand } from "../types";

export default function AIGeneratorWrapper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleGenerate = async (data: GenerateFlashcardCommand): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/ai/generate-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText: data.sourceText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate flashcard");
      }

      const result = await response.json();

      // Store the result temporarily for the review page
      sessionStorage.setItem(
        "aiGeneratedCandidate",
        JSON.stringify({
          id: "temp-" + Date.now(), // Generate temp ID
          front: result.front,
          back: result.back,
        })
      );

      // Redirect to review page
      window.location.href = "/ai/review";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return <AIGenerator onGenerate={handleGenerate} isLoading={isLoading} error={error} />;
}
