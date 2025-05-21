"use client"

import type React from "react"

import { useState } from "react"
import type { IHospital } from "@/types"
import { FaHospital } from "react-icons/fa"
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
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Profile Header Card */}
    <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl shadow-sm flex items-start justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">
          {profile?.name || "Your Hospital Name"}
        </h2>
        <p className="text-sm text-gray-600">Hospital Profile Overview</p>
      </div>
      <div className="p-3 bg-purple-100 rounded-full">
        <FaHospital className="text-purple-600 text-xl" />
      </div>
    </div>

    {/* Editable Form */}
    <form onSubmit={handleSubmit} className="bg-white border text-gray-600 border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
          <input
            type="text"
            name="hospitalName"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            value={formData.name || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma-separated)</label>
          <input
            type="text"
            name="specialties"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            value={Array.isArray(formData.specialties) ? formData.specialties.join(", ") : ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Beds</label>
            <input
              type="number"
              name="beds"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={formData.beds || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Doctors</label>
            <input
              type="number"
              name="doctors"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={formData.doctors || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Average Response Time (mins)</label>
            <input
              type="number"
              name="averageResponseTime"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={formData.averageResponseTime || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Average Consultancy Price</label>
            <input
              type="number"
              name="averageConsultancyPrice"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={formData.averageConsultancyPrice || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition"
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  </div>
);

}
