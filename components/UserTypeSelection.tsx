"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaHospital, FaAmbulance, FaUser } from "react-icons/fa"

const userTypes = [
  { id: "hospital", name: "Hospital", icon: FaHospital },
  { id: "med_transport", name: "Medical Transport", icon: FaAmbulance },
  { id: "patient", name: "Patient", icon: FaUser },
]

export default function UserTypeSelection() {
  const [selectedType, setSelectedType] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedType) {
      router.push(`/register/${selectedType}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="grid grid-cols-1 gap-4 mb-4">
        {userTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`flex items-center justify-center p-4 border rounded-md ${
              selectedType === type.id ? "bg-green-600 border-green-500" : "bg-gray-800 border-gray-700 hover:bg-gray-700"
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <type.icon className="mr-2" />
            {type.name}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        disabled={!selectedType}
      >
        Continue
      </button>
    </form>
  )
}
