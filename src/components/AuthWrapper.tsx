import { useState } from "react";
import { AuthForm } from "./AuthForm";
import { PasswordRecoveryForm } from "./PasswordRecoveryForm";
import type { SignupCommand, LoginCommand } from "../types";

interface AuthWrapperProps {
  mode: "login" | "signup" | "recover";
}

export function AuthWrapper({ mode }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);

  const handleLogin = async (data: LoginCommand) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.href = "/flashcards";
      } else {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred during login");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupCommand) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.href = "/flashcards";
      } else {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred during signup");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async (data: { email: string }) => {
    setIsLoading(true);
    setError(undefined);
    setSuccessMessage(undefined);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const successData = await response.json();
        setSuccessMessage(successData.message || "Password reset email sent successfully.");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred while sending reset email");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === "recover") {
    return (
      <PasswordRecoveryForm
        onSubmit={handlePasswordRecovery}
        isLoading={isLoading}
        error={error}
        successMessage={successMessage}
      />
    );
  }

  return (
    <AuthForm
      mode={mode}
      onSubmit={mode === "login" ? handleLogin : handleSignup}
      isLoading={isLoading}
      error={error}
      successMessage={successMessage}
    />
  );
}
