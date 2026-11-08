"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import Button from "@/components/ui/buttons/Button";

interface CopyTextButtonProps {
  text: string;
  /** Names what is copied, eg "presentation text". */
  subject: string;
}

export function CopyTextButton({ text, subject }: CopyTextButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    timeoutRef.current = window.setTimeout(() => setStatus("idle"), 2000);
  };

  const isCopied = status === "copied";
  const icon = isCopied ? (
    <FiCheck className="h-4 w-4" />
  ) : (
    <FiCopy className="h-4 w-4" />
  );

  return (
    <Button
      type="button"
      size="sm"
      variant={status === "failed" ? "danger" : "secondary"}
      onClick={handleCopy}
      disabled={!text.trim()}
      aria-label={`Copy ${subject} To Clipboard`}
      icon={icon}
      className="w-full shrink-0 sm:w-auto"
    >
      {isCopied ? "Copied" : status === "failed" ? "Couldn't Copy" : "Copy"}
    </Button>
  );
}
