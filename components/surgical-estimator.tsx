"use client"

import { useState } from "react"
import { SurgicalForm } from "@/components/surgical-form"
import { PerformanceImpact } from "@/components/performance-impact"
// import { DetailedReport } from "@/components/detailed-report"
import { AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function SurgicalEstimator() {
  const { toast } = useToast()
  const [showResults, setShowResults] = useState(false)
  const [performanceData, setPerformanceData] = useState({
    totalBlocks: 0,
    potentialReduction: 0,
    projectedCases: 0,
    financialImpact: 0,
    caseVolumeIncrease: 0,
    currentCases: 0,
  })
  const [departmentDetails, setDepartmentDetails] = useState<any>({})

  interface Service {
    serviceName: string
    caseVolume: number
  }

  interface RequestBody {
    parameters: {
      hospitalType: string
      blockDuration: number
      costRate: number
      quartileInit: string
      quartileTarget: string
      services: Service[]
    }
  }

  const handleCalculate = async (data: RequestBody) => {
    try {
      setShowResults(false)

      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("API request failed")

      const responseData = await response.json()
      const apiData = responseData.data

      const totalBlocks = Object.values(apiData).reduce(
        (sum: number, service: any) => sum + service.blocks,
        0
      )
      const potentialReduction = Object.values(apiData).reduce(
        (sum: number, service: any) =>
          sum + (service.blocks - service.potentialBlocks),
        0
      )
      const caseVolumeIncrease = Object.values(apiData).reduce(
        (sum: number, service: any) =>
          sum + (service.potentialCaseVolume - service.caseVolume),
        0
      )
      const financialImpact = Object.values(apiData).reduce(
        (sum: number, service: any) => sum + service.potentialCostSaved,
        0
      )
      const currentCases = Object.values(apiData).reduce(
        (sum: number, service: any) => sum + service.caseVolume,
        0
      )
      const projectedCases = Object.values(apiData).reduce(
        (sum: number, service: any) => sum + service.potentialCaseVolume,
        0
      )

      setPerformanceData({
        totalBlocks,
        potentialReduction,
        caseVolumeIncrease,
        financialImpact,
        currentCases,
        projectedCases,
      })

      setDepartmentDetails(apiData)
      setShowResults(true)
    } catch (error) {
      console.error("Error calling API:", error)
      toast({
        title: "Error",
        description: "There was a problem fetching the data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <div className="space-y-8">
        <SurgicalForm onCalculate={handleCalculate} />
        <AnimatePresence mode="wait">
          {showResults && <PerformanceImpact data={performanceData} />}
        </AnimatePresence>

        {/* <AnimatePresence mode="wait">
          {showDetailedReport && (
            <DetailedReport departmentDetails={departmentDetails} />
          )}
        </AnimatePresence> */}
      </div>
    </div>
  )
}
