"use client"

import { useState, useEffect } from "react"
import { FaAmbulance, FaCar } from "react-icons/fa"
import { toast } from "sonner"
import type { IMedTransport } from "@/types"
import { dummyMedTransports } from "@/data/dummy"

interface EmergencyTabProps {
  userProfile: any
  selectedHospital: any
}

export default function EmergencyTab({ userProfile, selectedHospital }: EmergencyTabProps) {
  const [selectedTransport, setSelectedTransport] = useState<IMedTransport | null>(null)
  const [nearbyTransports, setNearbyTransports] = useState<IMedTransport[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedHospital) {
      // Filter available transports
      const availableTransports = dummyMedTransports.filter(
        (transport) =>
          transport.status === "available" && (!transport.hospitalId || transport.hospitalId === selectedHospital.id),
      )
      setNearbyTransports(availableTransports)
    }
  }, [selectedHospital])

  if (!selectedHospital) {
    return (
      <div className="text-center">
        <p>Please select a hospital on the map or from the search dropdown to proceed with emergency services.</p>
      </div>
    )
  }

  const handleRequestEmergency = async () => {
    if (selectedTransport) {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Create emergency request
        const emergencyRequest = {
          patientName: userProfile.firstName + " " + userProfile.lastName,
          patientId: userProfile.id,
          hospitalId: selectedHospital.id,
          hospitalName: selectedHospital.name,
          transportId: selectedTransport.id,
          transportName: selectedTransport.name,
          status: "pending",
          requestTime: new Date().toISOString(),
          patientLocation: {
            lat: 40.7289,
            lng: -73.9965,
          },
          description: userProfile.knownAilments,
        }

        // Store in localStorage for demo
        const existingRequests = JSON.parse(localStorage.getItem("emergencyRequests") || "[]")
        localStorage.setItem("emergencyRequests", JSON.stringify([...existingRequests, emergencyRequest]))

        toast.success("Emergency service requested successfully!", {
          description: `${selectedTransport.name} is on the way to your location.`,
        })
      } catch (error) {
        toast.error("Failed to request emergency service", {
          description: "Please try again or contact support if the problem persists.",
        })
      } finally {
        setLoading(false)
      }
    } else {
      toast.error("Please select a transport option")
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Emergency Services</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Selected Hospital</h3>
        <p>{selectedHospital.name}</p>
        <p>Specialties: {selectedHospital.specialties.join(", ")}</p>
        <p>Average Response Time: {selectedHospital.averageResponseTime} minutes</p>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Your Health Information</h3>
        <p>Past Health Summary: {userProfile?.pastHealthSummary || "Not available"}</p>
        <p>Known Ailments: {userProfile?.knownAilments || "Not available"}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Select Transport</h3>
        <div className="grid grid-cols-1 gap-2">
          {nearbyTransports.map((transport) => (
            <button
              key={transport.id}
              className={`flex items-center justify-between p-2 border rounded-md ${
                selectedTransport?.id === transport.id
                  ? "bg-primary-600 border-primary-500"
                  : "bg-gray-800 border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedTransport(transport)}
            >
              <div className="flex items-center">
                {transport.type === "private_vehicle" ? <FaCar className="mr-2" /> : <FaAmbulance className="mr-2" />}
                <span>{transport.name}</span>
              </div>
              <span>ETA: {Math.floor(Math.random() * 10) + 5} min</span>
            </button>
          ))}
        </div>
      </div>
      <button
        className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
        onClick={handleRequestEmergency}
        disabled={loading || !selectedTransport}
      >
        {loading ? "Requesting..." : "Request Emergency Service"}
      </button>
    </div>
  )
}
