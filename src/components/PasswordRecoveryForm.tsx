import { useState } from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";

interface PasswordRecoveryFormProps {
  onSubmit: (data: { email: string }) => Promise<void>;
  isLoading: boolean;
  error?: string;
  successMessage?: string;
}

export function PasswordRecoveryForm({ onSubmit, isLoading, error, successMessage }: PasswordRecoveryFormProps) {
  const [email, setEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const emailId = useId();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({ email: email.trim() });
    } catch {
      // Error handling is done by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.email ? "border-red-500" : "border-gray-300"
          }`}
          aria-describedby={validationErrors.email ? `${emailId}-error` : undefined}
          aria-invalid={!!validationErrors.email}
          disabled={isLoading}
          required
        />
        {validationErrors.email && (
          <p id={`${emailId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {validationErrors.email}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Sending..." : "Send Reset Instructions"}
      </Button>
    </form>
  );
}
