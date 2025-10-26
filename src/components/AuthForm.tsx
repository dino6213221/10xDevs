import { useState } from "react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import type { SignupCommand, LoginCommand } from "@/types";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (data: SignupCommand | LoginCommand) => Promise<void>;
  isLoading: boolean;
  error?: string;
  successMessage?: string;
}

export function AuthForm({ mode, onSubmit, isLoading, error, successMessage }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (mode === "signup") {
      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
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
      const data = mode === "signup" ? { email: email.trim(), password } : { email: email.trim(), password };

      await onSubmit(data);
    } catch {
      // Error handling is done by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate data-testid="auth-form">
      <div>
        <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="auth-email-input"
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

      <div>
        <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id={passwordId}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="auth-password-input"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.password ? "border-red-500" : "border-gray-300"
          }`}
          aria-describedby={validationErrors.password ? `${passwordId}-error` : undefined}
          aria-invalid={!!validationErrors.password}
          disabled={isLoading}
          required
        />
        {validationErrors.password && (
          <p id={`${passwordId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {validationErrors.password}
          </p>
        )}
      </div>

      {mode === "signup" && (
        <div>
          <label htmlFor={confirmPasswordId} className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id={confirmPasswordId}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            aria-describedby={validationErrors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
            aria-invalid={!!validationErrors.confirmPassword}
            disabled={isLoading}
            required
          />
          {validationErrors.confirmPassword && (
            <p id={`${confirmPasswordId}-error`} className="mt-1 text-sm text-red-600" role="alert">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>
      )}

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

      <Button type="submit" disabled={isLoading} className="w-full" data-testid="auth-submit-button">
        {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
      </Button>

      {mode === "login" && (
        <div className="text-center">
          <a href="/auth/reset-password" className="text-sm text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </div>
      )}
    </form>
  );
}
