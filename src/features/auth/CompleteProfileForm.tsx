"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CiLock } from "react-icons/ci";
import { MdOutlinePerson } from "react-icons/md";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import type { AuthUser } from "@/types/auth";
import { authRequest } from "./auth-client";
import { useAuth } from "./AuthProvider";

interface FormErrors {
  name?: string;
  password?: string;
  confirmPassword?: string;
}

export function CompleteProfileForm() {
  const { user, setAuthenticatedUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      const updatedUser = await authRequest<AuthUser>(
        "/api/auth/complete-profile",
        {
          method: "PATCH",
          body: JSON.stringify({ name, password, confirmPassword }),
        },
      );

      showSuccessAlert("Your profile is completed successfully.");
      setAuthenticatedUser(updatedUser);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to complete your profile. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function clearError(field: keyof FormErrors) {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (apiError) setApiError("");
  }

  const initial = (name.trim().charAt(0) || user.name.charAt(0) || "U")
    .toUpperCase();

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user.email}
          </p>
          <p className="text-xs text-slate-500">
            Set a name and password to finish your account.
          </p>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          type="text"
          name="name"
          id="complete-profile-name"
          required
          icon={<MdOutlinePerson className="h-5 w-5" />}
          error={errors.name}
          placeholder="Enter your full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            clearError("name");
          }}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            label="Password"
            type="password"
            name="password"
            id="complete-profile-password"
            required
            icon={<CiLock className="h-5 w-5" />}
            error={errors.password}
            placeholder="Create a password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError("password");
            }}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            id="complete-profile-confirm-password"
            required
            icon={<CiLock className="h-5 w-5" />}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError("confirmPassword");
            }}
          />
        </div>

        <Button
          type="submit"
          className="mt-1 w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Complete Profile
        </Button>
      </form>
    </div>
  );
}
