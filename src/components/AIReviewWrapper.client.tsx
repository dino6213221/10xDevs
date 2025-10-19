import { useState, useEffect } from "react";
import { AICandidateCard } from "./AICandidateCard";
import type { FlashcardCandidateDTO, AcceptCandidateCommand, EditCandidateCommand } from "../types";
import { Button } from "./ui/button";

export default function AIReviewWrapper() {
  const [candidates, setCandidates] = useState<FlashcardCandidateDTO[]>([]);

  useEffect(() => {
    // Load candidates from sessionStorage
    const stored = sessionStorage.getItem('aiGeneratedCandidate');
    if (stored) {
      try {
        const candidate = JSON.parse(stored);
        setCandidates([candidate]);
        // Clear it so we don't show it again on refresh
        sessionStorage.removeItem('aiGeneratedCandidate');
      } catch (error) {
        console.error('Failed to parse stored candidate:', error);
      }
    }
  }, []);

  const handleAccept = async (id: string, data: AcceptCandidateCommand): Promise<void> => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          front: data.front,
          back: data.back,
          source: 'AI Generated',
          status: 'approved'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create flashcard');
      }

      console.log("Flashcard created successfully");
      alert('Flashcard created successfully!');
      setCandidates([]); // Remove from review
    } catch (error) {
      console.error('Error accepting flashcard:', error);
      alert('Failed to create flashcard: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEdit = async (id: string, data: EditCandidateCommand): Promise<void> => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          front: data.front,
          back: data.back,
          source: 'AI Generated (Edited)',
          status: 'approved'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create flashcard');
      }

      console.log("Flashcard created successfully after edit");
      alert('Flashcard created successfully after editing!');
      setCandidates([]); // Remove from review
    } catch (error) {
      console.error('Error accepting edited flashcard:', error);
      alert('Failed to create flashcard: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDiscard = async (id: string): Promise<void> => {
    console.log("Discard candidate:", id);
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const handleRetry = async (): Promise<void> => {
    console.log("Retry generation");
    window.location.href = '/ai/generate';
  };

  return (
    <>
      <div className="space-y-6">
        {candidates.map((candidate) => (
          <AICandidateCard
            key={candidate.id}
            candidate={candidate}
            onAccept={handleAccept}
            onEdit={handleEdit}
            onDiscard={handleDiscard}
            onRetry={handleRetry}
            isLoading={false}
          />
        ))}
      </div>

      {candidates.length === 0 && (
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
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards to review</h3>
          <p className="text-gray-500 mb-6">Generate some flashcards with AI to get started.</p>
          <Button asChild>
            <a href="/ai/generate">Generate Flashcards</a>
          </Button>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Review Progress</h3>
              <p className="text-sm text-blue-700 mt-1">
                Review all candidates before proceeding. You can accept, edit, or discard each one.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{candidates.length}</div>
              <div className="text-sm text-blue-700">remaining</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
