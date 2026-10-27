"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MdOutlinePerson } from "react-icons/md";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import type { AuthUser } from "@/types/auth";
import { authRequest } from "./auth-client";
import { useAuth } from "./AuthProvider";

interface UpdateProfileFormProps {
  onClose: () => void;
}

interface FormErrors {
  name?: string;
}

export function UpdateProfileForm({ onClose }: UpdateProfileFormProps) {
  const { user, updateAuthenticatedUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrors({ name: "Name is required." });
      return;
    }

    if (trimmedName.length < 2) {
      setErrors({ name: "Name must be at least 2 characters." });
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const updatedUser = await authRequest<AuthUser>(
        "/api/auth/update-profile",
        {
          method: "PATCH",
          body: JSON.stringify({ name: trimmedName }),
        },
      );

      showSuccessAlert("Your profile is updated successfully.");
      updateAuthenticatedUser(updatedUser);
      onClose();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to update your profile. Please try again.",
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
          label="Name"
          type="text"
          name="name"
          id="update-profile-name"
          required
          maxLength={150}
          icon={<MdOutlinePerson className="h-5 w-5" />}
          error={errors.name}
          placeholder="Enter your name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) {
              setErrors((current) => ({ ...current, name: undefined }));
            }
            if (apiError) setApiError("");
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
