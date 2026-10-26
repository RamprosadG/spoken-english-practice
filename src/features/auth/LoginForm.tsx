"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CiLock } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import type { AuthUser } from "@/types/auth";
import { authRequest } from "./auth-client";
import { useAuth } from "./AuthProvider";
import { GoogleLoginButton } from "./GoogleLoginButton";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const { openRegister, setAuthenticatedUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
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
      const user = await authRequest<AuthUser>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      showSuccessAlert("You are logged in successfully.");
      setAuthenticatedUser(user);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to login. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSuccess(accessToken: string) {
    setIsGoogleLoading(true);
    setApiError("");

    try {
      const user = await authRequest<AuthUser>("/api/auth/login-google", {
        method: "POST",
        body: JSON.stringify({ googleAccessToken: accessToken }),
      });

      showSuccessAlert("You are logged in successfully.");
      setAuthenticatedUser(user);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to login. Please try again.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handleGoogleError(message: string) {
    setIsGoogleLoading(false);
    setApiError(message);
  }

  return (
    <div className="w-full">
      <p className="mb-5 text-sm text-slate-500">
        Enter your email and password to continue.
      </p>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          id="login-email"
          required
          icon={<MdOutlineEmail className="h-5 w-5" />}
          error={errors.email}
          placeholder="Enter email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email) {
              setErrors((current) => ({ ...current, email: undefined }));
            }
            if (apiError) setApiError("");
          }}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          id="login-password"
          required
          icon={<CiLock className="h-5 w-5" />}
          error={errors.password}
          placeholder="Enter password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }));
            }
            if (apiError) setApiError("");
          }}
        />

        <Button
          type="submit"
          className="mt-1 w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Login
        </Button>
      </form>

      <div className="my-5 flex items-center">
        <div className="grow border-t border-slate-200" />
        <span className="mx-4 text-xs font-semibold text-slate-500">OR</span>
        <div className="grow border-t border-slate-200" />
      </div>

      {googleClientId ? (
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          isLoading={isGoogleLoading}
        />
      ) : (
        <>
          <Button
            type="button"
            variant="secondary"
            icon={<FaGoogle />}
            disabled
            className="w-full"
          >
            Continue with Google
          </Button>
          <p className="mt-2 text-center text-xs text-slate-500">
            Google sign-in is not configured yet. Set{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5">
              NEXT_PUBLIC_GOOGLE_CLIENT_ID
            </code>{" "}
            to enable it.
          </p>
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={openRegister}
          className="cursor-pointer font-semibold text-indigo-600 underline hover:text-indigo-700"
        >
          Register
        </button>
      </p>
    </div>
  );
}
