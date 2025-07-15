"use client"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import dynamic from "next/dynamic"

const SurgicalEstimator = dynamic(
  () => import("@/components/surgical-estimator"),
  {
    ssr: false,
  }
)

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            Loading...
          </div>
        }
      >
        <SurgicalEstimator />
      </Suspense>
      <Toaster />
    </main>
  )
}
