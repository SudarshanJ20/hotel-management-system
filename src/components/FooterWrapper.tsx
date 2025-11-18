// src/components/FooterWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import React from "react";

export default function FooterWrapper() {
  const pathname = usePathname();

  const showFooterOn =
    pathname === "/" ||
    pathname.startsWith("/rooms") ||
    pathname === "/login" ||
    pathname === "/register";

  return showFooterOn ? <Footer /> : null;
}
