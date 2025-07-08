"use client"

import { useState, useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function EmailVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isOtpVisible, setIsOtpVisible] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const { toast } = useToast()

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      organizationName: Yup.string().required("Organization name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: () => {},
  })

  useEffect(() => {
    if (isOtpVisible) {
      toast({
        title: "Verification code sent",
        description: "We've sent a 6-digit code to your email address.",
      })
    }
  }, [isOtpVisible, toast])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1)
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").trim()
    if (!/^\d{6}$/.test(pasted)) return
    setOtp(pasted.split(""))
  }

  const sendOTP = async () => {
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formik.values.email }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to send OTP")

      setIsOtpVisible(true)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
        variant: "destructive",
      })
    }
  }

  const verifyOTP = async () => {
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter all 6 digits of the verification code.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formik.values.email, otp: otpValue }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to verify OTP")

      toast({
        title: "Verification successful",
        description: "Your email has been verified.",
      })

      setIsGeneratingReport(true)

      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formik.values,
          source: "Surgical Calculator",
          encoded: localStorage.getItem("encoded"),
        }),
      })

      setIsVerified(true)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to verify verification code",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 rounded-lg mb-6 text-center form-intro-card">
        <h2 className="text-2xl font-bold text-gray-900">
          Get Your Customized Report
        </h2>
        <p className="text-gray-700 mt-4">
          Enter your email to receive a detailed breakdown of your department’s
          performance potential, including key areas of improvement:{" "}
          <strong>Planning Accuracy</strong>,{" "}
          <strong>Resource Smoothing</strong>, and{" "}
          <strong>Duration Prediction</strong>. or{" "}
          <a
            href="https://share.hsforms.com/2ILISPQpWSP6DHAWdHo54qgebhsr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline font-medium"
          >
            contact us for a demo
          </a>
          .
        </p>
      </div>

      <Card className="p-6 shadow-sm border rounded-lg mx-auto text-center">
        {isGeneratingReport ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-600 text-sm font-medium">
              Please wait while your report is being generated. <br /> Do not
              close or refresh this tab.
            </p>
          </div>
        ) : isVerified ? (
          <>
            <p className="text-xl font-semibold text-primary mb-2">
              Thanks for verifying your email!
            </p>
            <p className="text-gray-700">
              Your report will be shared with you soon.
            </p>
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="form-labelling">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  className="bg-blue-50"
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.firstName}
                  </p>
                )}
              </div>
              <div className="form-labelling">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  className="bg-blue-50"
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="form-labelling">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                name="organizationName"
                value={formik.values.organizationName}
                onChange={formik.handleChange}
                className="bg-blue-50"
              />
              {formik.touched.organizationName &&
                formik.errors.organizationName && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.organizationName}
                  </p>
                )}
            </div>

            <div className="form-labelling">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="bg-blue-50"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {!isOtpVisible ? (
              <div className="flex justify-center pt-4">
                <Button
                  type="button"
                  className="bg-primary text-white px-6 py-2 rounded-md"
                  onClick={async () => {
                    const errors = await formik.validateForm()
                    if (Object.keys(errors).length === 0) {
                      sendOTP()
                    } else {
                      formik.setTouched({
                        firstName: true,
                        lastName: true,
                        organizationName: true,
                        email: true,
                      })
                    }
                  }}
                >
                  Send OTP
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label>Enter the 6-digit code</Label>
                  <div className="flex justify-center gap-2 mt-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-lg"
                        autoFocus={index === 0}
                        disabled={isGeneratingReport}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={verifyOTP}
                    className="bg-primary text-white px-6 py-2"
                    disabled={isGeneratingReport}
                  >
                    Verify OTP
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendOTP}
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                    disabled={isGeneratingReport}
                  >
                    Resend Code
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </Card>
    </motion.div>
  )
}
