"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaHeartbeat } from "react-icons/fa"
import { ClipLoader } from "react-spinners"
import { dummyHospitals } from "@/data/dummy"
import { toast } from "react-toastify"

type FormField = {
  name: string
  label: string
  type: string
}

const formFields: Record<string, FormField[]> = {
  hospital: [
    { name: "hospitalName", label: "Hospital Name", type: "text" },
    { name: "beds", label: "Available Beds", type: "number" },
    { name: "doctors", label: "Available Doctors", type: "number" },
    { name: "specialties", label: "Specialties", type: "text" },
    { name: "averageResponseTime", label: "Average Response Time (mins)", type: "number" },
    { name: "averageConsultancyPrice", label: "Average Consultancy Price (₦)", type: "number" },
  ],
  med_transport: [
    { name: "transportType", label: "Transport Type", type: "select" },
    { name: "hospitalId", label: "Associated Hospital", type: "hospital_select" },
  ],
  patient: [
    { name: "firstName", label: "First Name", type: "text" },
    { name: "lastName", label: "Last Name", type: "text" },
    { name: "pastHealthSummary", label: "Past Health Summary", type: "textarea" },
    { name: "knownAilments", label: "Known Ailments", type: "textarea" },
  ],
}

export default function DynamicRegistrationForm({ userType }: { userType: string }) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Store dummy profile data locally
      localStorage.setItem("userProfile", JSON.stringify({ ...formData, userType }))

      // Route based on user type
      switch (userType) {
        case "hospital":
          router.push("/hospital")
          break
        case "med_transport":
          router.push("/med-transport")
          break
        default:
          router.push("/home")
      }

      toast.success("Registration successful!")
    } catch (error) {
      toast.error("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      {formFields[userType].map((field) => (
        <div key={field.name} className="mb-4">
          <label htmlFor={field.name} className="block text-sm font-medium mb-2">
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData[field.name] || ""}
              onChange={handleChange}
              required
            />
          ) : field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData[field.name] || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select {field.label}</option>
              <option value="private_ambulance">Private Ambulance</option>
              <option value="hospital_ambulance">Hospital Ambulance</option>
              <option value="private_vehicle">Private Vehicle</option>
            </select>
          ) : field.type === "hospital_select" ? (
            <select
              id={field.name}
              name={field.name}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData[field.name] || ""}
              onChange={handleChange}
              required={formData.transportType === "hospital_ambulance"}
              disabled={formData.transportType !== "hospital_ambulance"}
            >
              <option value="">Select Hospital</option>
              {dummyHospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData[field.name] || ""}
              onChange={handleChange}
              required
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <ClipLoader color="#ffffff" size={20} />
        ) : (
          <>
            <FaHeartbeat className="mr-2" />
            Get Started
          </>
        )}
      </button>
    </form>
  )
}
