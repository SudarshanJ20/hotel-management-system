"use client";

import { memo } from "react";

type FloatingToastProps = {
  message?: string | null;
};

/**
 * Lightweight toast used across auth pages.
 * Memoized to avoid unnecessary re-renders while keeping the inline animation.
 */
const FloatingToast = memo(function FloatingToast({ message }: FloatingToastProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
      <div className="animate-[fade-in_0.2s_ease-out] rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
        {message}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
});

export default FloatingToast;
