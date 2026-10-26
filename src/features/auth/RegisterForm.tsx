"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CiLock } from "react-icons/ci";
import { MdOutlineEmail, MdOutlinePerson } from "react-icons/md";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import type { AuthUser } from "@/types/auth";
import { authRequest } from "./auth-client";
import { useAuth } from "./AuthProvider";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterForm() {
  const { openLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      await authRequest<AuthUser>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      showSuccessAlert("You are registered successfully. Please login.");
      openLogin();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to register. Please try again.",
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

  return (
    <div className="w-full">
      <p className="mb-5 text-sm text-slate-500">
        Create an account to save your practice progress.
      </p>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            label="Name"
            type="text"
            name="name"
            id="register-name"
            required
            icon={<MdOutlinePerson className="h-5 w-5" />}
            error={errors.name}
            placeholder="Enter name"
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
            id="register-email"
            required
            icon={<MdOutlineEmail className="h-5 w-5" />}
            error={errors.email}
            placeholder="Enter email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            label="Password"
            type="password"
            name="password"
            id="register-password"
            required
            icon={<CiLock className="h-5 w-5" />}
            error={errors.password}
            placeholder="Enter password"
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
            id="register-confirm-password"
            required
            icon={<CiLock className="h-5 w-5" />}
            error={errors.confirmPassword}
            placeholder="Confirm password"
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
          Register
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={openLogin}
          className="cursor-pointer font-semibold text-indigo-600 underline hover:text-indigo-700"
        >
          Login
        </button>
      </p>
    </div>
  );
}
