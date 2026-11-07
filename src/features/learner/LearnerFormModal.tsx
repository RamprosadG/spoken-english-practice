"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CiLock } from "react-icons/ci";
import Button from "@/components/ui/buttons/Button";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Input from "@/components/ui/inputs/Input";
import Modal from "@/components/ui/modals/Modal";
import type { LearnerItem, LearnerRole } from "@/types/learner";
import { LEARNER_ROLE_OPTIONS } from "@/types/learner";
import { learnerRequest } from "./learner-client";

interface LearnerFormModalProps {
  learner: LearnerItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function LearnerFormModal({
  learner,
  onClose,
  onSaved,
}: LearnerFormModalProps) {
  const isEditing = Boolean(learner);
  const [name, setName] = useState(learner?.name ?? "");
  const [email, setEmail] = useState(learner?.email ?? "");
  const [role, setRole] = useState<LearnerRole>(learner?.role ?? "public");
  // Never prefilled: an edit that leaves both fields blank keeps the stored
  // hash, which is what lets a Google account stay a Google account.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (apiError) setApiError("");
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    // On an edit both fields stay blank to keep the stored password, so the
    // rules below only apply once the admin starts typing.
    if (password || confirmPassword) {
      if (!password) {
        nextErrors.password = "Type the new password in both fields.";
      } else if (password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters.";
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    } else if (!isEditing) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await learnerRequest<LearnerItem>(
        isEditing ? `/api/learners/${learner?.id}` : "/api/learners",
        {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            role,
            password,
            confirmPassword,
          }),
        },
      );

      onSaved(
        isEditing
          ? "Learner updated successfully."
          : "Learner created successfully.",
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to save the learner. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  const passwordHint = isEditing
    ? "Leave blank to keep the current password"
    : "Enter password";

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={isEditing ? "Edit learner" : "New learner"}
      className="max-w-2xl"
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            type="text"
            name="name"
            id="learner-name"
            required
            error={errors.name}
            placeholder="Mina Rahman"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            id="learner-email"
            required
            error={errors.email}
            placeholder="mina@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
          />
        </div>

        <Dropdown
          label="Role"
          id="learner-role"
          name="role"
          options={LEARNER_ROLE_OPTIONS}
          value={role}
          onChange={(value) => {
            setRole(value === "admin" ? "admin" : "public");
            if (apiError) setApiError("");
          }}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            name="password"
            id="learner-password"
            required={!isEditing}
            icon={<CiLock className="h-5 w-5" />}
            error={errors.password}
            placeholder={passwordHint}
            autoComplete="new-password"
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
            id="learner-confirm-password"
            required={!isEditing}
            icon={<CiLock className="h-5 w-5" />}
            error={errors.confirmPassword}
            placeholder={passwordHint}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError("confirmPassword");
            }}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            {isEditing ? "Save changes" : "Create learner"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
