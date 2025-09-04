"use client";
import { Suspense } from "react";
import ThanhCongPage from "../thanh-cong/page";

export const dynamic = "force-dynamic";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-8 sm:py-10 lg:py-16"><div className="card">Loading...</div></div>}>
      <ThanhCongPage />
    </Suspense>
  );
}



