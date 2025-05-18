"use client"

import type React from "react"

import { useState } from "react"
import type { IHospital } from "@/types"
import { toast } from "sonner"

interface HospitalProfileProps {
  profile: IHospital | null
  onUpdate: (profile: IHospital) => void
}

export default function HospitalProfile({ profile, onUpdate }: HospitalProfileProps) {
  const [formData, setFormData] = useState(profile || {})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "specialties" ? value.split(",").map((s) => s.trim()) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local storage
      localStorage.setItem("userProfile", JSON.stringify(formData))
      onUpdate(formData as IHospital)

      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Hospital Name</label>
          <input
            type="text"
            name="hospitalName"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
            value={formData.name || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Specialties (comma-separated)</label>
          <input
            type="text"
            name="specialties"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
            value={Array.isArray(formData.specialties) ? formData.specialties.join(", ") : ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Available Beds</label>
            <input
              type="number"
              name="beds"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
              value={formData.beds || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Available Doctors</label>
            <input
              type="number"
              name="doctors"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
              value={formData.doctors || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Average Response Time (mins)</label>
            <input
              type="number"
              name="averageResponseTime"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
              value={formData.averageResponseTime || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Average Consultancy Price</label>
            <input
              type="number"
              name="averageConsultancyPrice"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
              value={formData.averageConsultancyPrice || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  )
}
