"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface ErrorToastProps {
  error?: string | null;
}

export function ErrorToast({ error }: ErrorToastProps) {
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return null;
}
