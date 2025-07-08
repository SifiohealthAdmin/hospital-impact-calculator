"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { EmailVerification } from "./email-verification"

type PerformanceData = {
  totalBlocks: number
  potentialReduction: number
  projectedCases: number
  financialImpact: number
  currentCases?: number
}

type PerformanceImpactProps = Readonly<{
  data: PerformanceData
}>

export function PerformanceImpact({ data }: PerformanceImpactProps) {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num)

  const formatRoundedNumber = (num: number): number => {
    return Math.round(num / 100) * 100
  }

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num)

  const formatRoundedCurrency = (num: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.round(num / 100) * 100)

  const InfoBox = ({
    value,
    unit,
    title,
    subtitle,
    isCurrency = false,
  }: {
    value: number
    unit?: string
    title: string
    subtitle: React.ReactNode
    isCurrency?: boolean
  }) => (
    <div
      className="flex items-center p-4 rounded-lg border border-transparent"
      style={{ borderBottom: "1px solid #B5CBBF38" }}
    >
      <div
        className="flex items-center justify-center result-chip px-4 py-4 rounded-lg mr-4 min-w-[25%]"
        style={{
          borderRadius: "22px",
          boxShadow: "0px 4px 4px 0px #2C615017",

        }}
      >
        <span className="text-3xl font-bold leading-tight d-block text-center">
          {isCurrency ? formatRoundedCurrency(value) : formatNumber(value)}
        </span>
        {unit && <span className="text-sm ml-1 d-block text-center">{unit}</span>}
      </div>
      <div>
        <h3 className="font-semibold text-base text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>
    </div>
  )

  const projectedSubtitle = data.currentCases ? (
    <>
      Efficiency gains could enable your department to perform an{" "}
      <strong>
        additional {formatNumber(data.projectedCases - data.currentCases)} cases
        annually,
      </strong>{" "}
      increasing total volume from{" "}
      <strong>{formatNumber(data.currentCases)}</strong> to{" "}
      <strong>{formatNumber(data.projectedCases)} cases.</strong>
    </>
  ) : (
    <>
      Efficiency gains could enable your department to perform an additional{" "}
      <strong>{formatNumber(data.projectedCases)} cases annually.</strong>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 shadow-sm border rounded-lg result-parent-wrap">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Surgery Department’s Performance Impact
          </h2>
          <p className="text-gray-600 mt-1">
            Based on the information provided, here is the estimated performance
            impact for your surgical department:
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <InfoBox
            value={formatRoundedNumber(data.totalBlocks)}
            unit="blocks"
            title="Total Surgical Blocks Estimate"
            subtitle={
              <>
                Your department is estimated to require{" "}
                <strong>
                  {formatRoundedNumber(data.totalBlocks)} surgical blocks
                </strong>{" "}
                annually based on current services and case volume.
              </>
            }
          />
          <InfoBox
            value={data.potentialReduction}
            unit="blocks"
            title="Potential Block Reduction"
            subtitle={
              <>
                Improved efficiency could reduce block usage by approximately{" "}
                <strong>
                  {formatNumber(data.potentialReduction)} blocks per year{" "}
                </strong>
                , freeing up valuable OR time.
              </>
            }
          />
          <InfoBox
            value={data.projectedCases - (data.currentCases ?? 0)}
            unit="cases"
            title="Projected Case Volume Increase"
            subtitle={projectedSubtitle}
          />
          <InfoBox
            value={data.financialImpact}
            title="Financial Impact (Cost Savings or Revenue Uplift)"
            subtitle={
              <>
                Enhanced performance could generate an estimated{" "}
                <strong>
                  {formatRoundedCurrency(data.financialImpact)} in annual
                  financial impact,
                </strong>{" "}
                through cost savings or increased surgical revenue.
              </>
            }
            isCurrency
          />
        </div>

        <EmailVerification />
      </Card>
    </motion.div>
  )
}
