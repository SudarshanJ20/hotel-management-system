// src/components/OnceParamClear.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

type Props = {
  keyName: string;
};

export default function OnceParamClear({ keyName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const clearedRef = useRef(false);

  useEffect(() => {
    // Guard: run only once per mount and only on client
    if (clearedRef.current) return;
    if (!sp) return;

    const hasKey = !!sp.get(keyName);
    if (!hasKey) return;

    // Mark as handled to avoid loops
    clearedRef.current = true;

    // Build next URLSearchParams without the key
    const next = new URLSearchParams(sp.toString());
    next.delete(keyName);

    // Compute URL (preserve pathname and other params)
    const query = next.toString();
    const target = query ? `${pathname}?${query}` : pathname;

    // Use a microtask to avoid interfering with initial paint
    const id = queueMicrotask
      ? queueMicrotask(() => router.replace(target, { scroll: false }))
      : setTimeout(() => router.replace(target, { scroll: false }), 0);

    // Cleanup for the setTimeout branch
    return () => {
      if (typeof id === "number") clearTimeout(id);
    };
  }, [sp, pathname, router, keyName]);

  return null;
}
