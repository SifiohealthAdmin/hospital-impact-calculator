"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { encodePayload } from "@/lib/pdfUtils"

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

export function SurgicalForm({
  onCalculate,
}: {
  onCalculate: (data: RequestBody) => void
}) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [caseVolumes, setCaseVolumes] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(false)

  const serviceCategories = [
    { id: "Cardiac", name: "Cardiac" },
    { id: "General", name: "General" },
    { id: "Gynaecologic", name: "Gynaecology" },
    { id: "Neurosurgery", name: "Neurosurgery" },
    { id: "Ophthalmic", name: "Ophthalmology" },
    { id: "Orthopaedic", name: "Orthopaedic" },
    {
      id: "Oral_and_Maxillofacial_and_Dentistry",
      name: "Oral and Maxillofacial and Dentistry",
    },
    { id: "Otolaryngic_ENT", name: "Otolaryngic ENT" },
    { id: "Urologic", name: "Urologic" },
    { id: "Vascular", name: "Vascular" },
    { id: "Plastic_and_Reconstructive", name: "Plastic and Reconstructive" },
  ]

  const performanceLevels = {
    Q3: "Poor (Bottom 25%)",
    Q2: "Average (Top 50%)",
    Q1: "Good (Top 25%)",
    Best: "Best-in-Class (Top 5%)",
  }

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
      const newCaseVolumes = { ...caseVolumes }
      delete newCaseVolumes[serviceId]
      setCaseVolumes(newCaseVolumes)
    } else {
      setSelectedServices([...selectedServices, serviceId])
      setCaseVolumes({ ...caseVolumes, [serviceId]: 1000 })
    }
  }

  const handleCaseVolumeChange = (serviceId: string, volume: number) => {
    setCaseVolumes({ ...caseVolumes, [serviceId]: volume })
  }

  const formik = useFormik({
    initialValues: {
      departmentType: "Community",
      blockDuration: "420",
      costRate: "40",
      currentPerformance: "Q2",
      comparisonLevel: "Q1",
      servicesError: "",
    },
    validationSchema: Yup.object({
      departmentType: Yup.string().required("Department type is required"),
      blockDuration: Yup.string().required("Block duration is required"),
      costRate: Yup.string().required("Cost rate is required"),
      currentPerformance: Yup.string().required(
        "Current performance is required"
      ),
      comparisonLevel: Yup.string().required("Comparison level is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true)

      if (selectedServices.length === 0) {
        formik.setFieldError(
          "servicesError",
          "Please select at least one service."
        )
        setLoading(false)
        return
      }

      let invalidVolume = false
      selectedServices.forEach((id) => {
        const volume = caseVolumes[id]
        if (!volume || volume <= 0) invalidVolume = true
      })

      if (invalidVolume) {
        formik.setFieldError(
          "servicesError",
          "Please enter a valid positive case volume for each selected service."
        )
        setLoading(false)
        return
      }

      const services: Service[] = selectedServices.map((id) => {
        const service = serviceCategories.find((s) => s.id === id)
        return {
          serviceName: id ?? service?.name,
          caseVolume: caseVolumes[id],
        }
      })

      const parameters = {
        hospitalType: values.departmentType,
        blockDuration: parseInt(values.blockDuration, 10),
        costRate: parseFloat(values.costRate),
        quartileInit: values.currentPerformance,
        quartileTarget: values.comparisonLevel,
        services,
      }

      localStorage.setItem("encoded", encodePayload(parameters))
      await onCalculate({ parameters })
      setLoading(false)
    },
  })

  const getFilteredComparisonLevels = () => {
    const levels = Object.keys(performanceLevels)
    const currentIndex = levels.indexOf(formik.values.currentPerformance)
    return levels.slice(currentIndex + 1)
  }

  return (
    <Card className="p-6 shadow-sm border rounded-lg">
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="font-bold text-lg">1. Type of Surgical Department</p>
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <Label className="text-sm text-gray-700">
                Select the type of healthcare facility where surgeries are
                performed:
              </Label>
              <div>
                <Select
                  value={formik.values.departmentType}
                  onValueChange={(value) =>
                    formik.setFieldValue("departmentType", value)
                  }
                >
                  <SelectTrigger id="departmentType" className="w-full">
                    <SelectValue placeholder="Select department type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.departmentType &&
                  formik.errors.departmentType && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.departmentType}
                    </p>
                  )}
              </div>
            </div>
          </div>

          <p className="font-bold text-lg">
            2. Standard Surgical Block Duration
          </p>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <Label className="text-sm text-gray-700">
              Select the typical scheduled time for a full OR block in minutes:
            </Label>
            <div>
              <Select
                value={formik.values.blockDuration}
                onValueChange={(value) =>
                  formik.setFieldValue("blockDuration", value)
                }
              >
                <SelectTrigger id="blockDuration">
                  <SelectValue placeholder="Select block duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="420">420 minutes (7 hours)</SelectItem>
                  <SelectItem value="480">480 minutes (8 hours)</SelectItem>
                  <SelectItem value="600">600 minutes (10 hours)</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.blockDuration && formik.errors.blockDuration && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.blockDuration}
                </p>
              )}
            </div>
          </div>

          <p className="font-bold text-lg">3. Surgical Services Offered</p>
          <div>
            <Label className="text-sm text-gray-700">
              Select all surgical specialties supported by the department:
            </Label>
            <div className="flex flex-wrap gap-2">
              {serviceCategories.map((cat) => {
                const isSelected = selectedServices.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleService(cat.id)}
                    className={`px-4 py-2 border rounded-md ${
                      isSelected
                        ? "bg-magnet-faint text-primary"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
            {formik.errors.servicesError && (
              <p className="text-red-500 text-sm mt-2">
                {formik.errors.servicesError}
              </p>
            )}
          </div>

          {selectedServices.length > 0 && (
            <div className="space-y-4">
              <p className="font-bold text-lg">
                4. Annual Surgical Case Volume
              </p>
              {selectedServices.map((id) => {
                const service =
                  serviceCategories.find((s) => s.id === id)?.name || id
                return (
                  <>
                    <div
                      key={id}
                      className="grid md:grid-cols-2 gap-6 items-start"
                    >
                      <Label className="text-sm text-gray-700">
                        Enter the total number of surgical cases performed per
                        year for {service} :
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={caseVolumes[id]}
                        onChange={(e) =>
                          handleCaseVolumeChange(
                            id,
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        placeholder="Enter number of cases"
                      />
                    </div>{" "}
                  </>
                )
              })}
            </div>
          )}
          <p className="font-bold text-lg">
            5. Financial Value per OR Block Minute
          </p>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <Label className="text-sm text-gray-700">
              Select the average cost savings or revenue generated per minute of
              OR time:
            </Label>
            <div>
              <Select
                value={formik.values.costRate}
                onValueChange={(value) =>
                  formik.setFieldValue("costRate", value)
                }
              >
                <SelectTrigger id="costRate">
                  <SelectValue placeholder="Select cost rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">$20/min</SelectItem>
                  <SelectItem value="40">$40/min</SelectItem>
                  <SelectItem value="60">$60/min</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.costRate && formik.errors.costRate && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.costRate}
                </p>
              )}
            </div>
          </div>

          <p className="font-bold text-lg">
            6. Current and Targeted Department Performance
          </p>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <Label className="text-sm text-gray-700">
              How does the department currently perform?
            </Label>
            <div>
              <Select
                value={formik.values.currentPerformance}
                onValueChange={(value) => {
                  formik.setFieldValue("currentPerformance", value)
                  formik.setFieldValue("comparisonLevel", "")
                }}
              >
                <SelectTrigger id="currentPerformance">
                  <SelectValue placeholder="Select current performance" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(performanceLevels)
                    .filter(([label]) => label !== "Best")
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formik.touched.currentPerformance &&
                formik.errors.currentPerformance && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.currentPerformance}
                  </p>
                )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <Label className="text-sm text-gray-700">
              What benchmark would you like to compare it to?
            </Label>
            <div>
              <Select
                value={formik.values.comparisonLevel}
                onValueChange={(value) =>
                  formik.setFieldValue("comparisonLevel", value)
                }
              >
                <SelectTrigger id="comparisonLevel">
                  <SelectValue placeholder="Select target performance" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredComparisonLevels().map((level) => (
                    <SelectItem key={level} value={level}>
                      {
                        performanceLevels[
                          level as keyof typeof performanceLevels
                        ]
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.comparisonLevel &&
                formik.errors.comparisonLevel && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.comparisonLevel}
                  </p>
                )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="text-magnet border-magnet hover:bg-magnet hover:text-white px-8"
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <span className="animate-pulse">Calculating...</span>
              ) : (
                <strong>CALCULATE IMPACT</strong>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
