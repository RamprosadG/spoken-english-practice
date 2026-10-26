"use client";

import { useGoogleLogin, useGoogleOAuth } from "@react-oauth/google";
import type { NonOAuthError } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";
import Button from "@/components/ui/buttons/Button";

const NON_OAUTH_ERROR_MESSAGES: Record<NonOAuthError["type"], string> = {
  popup_failed_to_open:
    "Your browser blocked the Google sign-in popup. Allow popups for this site and try again.",
  popup_closed: "Google sign-in was cancelled.",
  unknown: "Google sign-in could not be started. Please try again.",
};

interface GoogleLoginButtonProps {
  onSuccess: (accessToken: string) => void;
  onError: (message: string) => void;
  isLoading: boolean;
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  isLoading,
}: GoogleLoginButtonProps) {
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: (tokenResponse) => onSuccess(tokenResponse.access_token),
    onError: (errorResponse) => {
      onError(
        errorResponse.error === "access_denied"
          ? "Google sign-in was cancelled."
          : errorResponse.error_description ||
              errorResponse.error ||
              "Google sign-in failed. Please try again.",
      );
    },
    onNonOAuthError: (nonOAuthError) =>
      onError(NON_OAUTH_ERROR_MESSAGES[nonOAuthError.type]),
  });

  return (
    <Button
      type="button"
      variant="secondary"
      icon={<FaGoogle />}
      onClick={() => login()}
      isLoading={isLoading}
      disabled={isLoading || !scriptLoadedSuccessfully}
      className="w-full"
    >
      Continue with Google
    </Button>
  );
}
