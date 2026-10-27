"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CiLock } from "react-icons/ci";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import { authRequest } from "./auth-client";

interface UpdatePasswordFormProps {
  onClose: () => void;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function UpdatePasswordForm({ onClose }: UpdatePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function clearError(field: keyof FormErrors) {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (apiError) setApiError("");
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
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
      await authRequest<null>("/api/auth/update-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      showSuccessAlert("Your password is updated successfully.");
      onClose();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to update your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Current Password"
          type="password"
          name="currentPassword"
          id="update-password-current"
          required
          maxLength={128}
          autoComplete="current-password"
          icon={<CiLock className="h-5 w-5" />}
          error={errors.currentPassword}
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            clearError("currentPassword");
          }}
        />

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          id="update-password-new"
          required
          maxLength={128}
          autoComplete="new-password"
          icon={<CiLock className="h-5 w-5" />}
          error={errors.newPassword}
          placeholder="Enter new password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            clearError("newPassword");
          }}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          id="update-password-confirm"
          required
          maxLength={128}
          autoComplete="new-password"
          icon={<CiLock className="h-5 w-5" />}
          error={errors.confirmPassword}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearError("confirmPassword");
          }}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}
