"use client"

import { useState, useEffect } from "react"
import { FaAmbulance } from "react-icons/fa"
import type { IEmergencyRequest } from "@/types"
import { dummyEmergencyRequests } from "@/data/dummy"
import Map from "@/components/Map"

export default function MedTransportDashboard() {
  const [emergencies, setEmergencies] = useState<IEmergencyRequest[]>([])
  const [selectedEmergency, setSelectedEmergency] = useState<IEmergencyRequest | null>(null)
  const [transportProfile, setTransportProfile] = useState<any>(null)

  useEffect(() => {
    // Load transport profile from localStorage
    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setTransportProfile(JSON.parse(storedProfile))
    }

    // Load emergencies from localStorage or use dummy data
    const storedEmergencies = localStorage.getItem("emergencyRequests")
    setEmergencies(storedEmergencies ? JSON.parse(storedEmergencies) : dummyEmergencyRequests)
  }, [])

  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-gray-900 p-4 overflow-auto">
        <h1 className="text-xl font-bold mb-6">Emergency Requests</h1>
        <div className="space-y-4">
          {emergencies.map((emergency) => (
            <button
              key={emergency.id}
              className={`w-full p-4 text-left rounded-lg border ${
                selectedEmergency?.id === emergency.id
                  ? "bg-primary-600 border-primary-500"
                  : "bg-gray-800 border-gray-700 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedEmergency(emergency)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{emergency.patientName}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    emergency.status === "pending"
                      ? "bg-yellow-600"
                      : emergency.status === "in_progress"
                        ? "bg-primary-600"
                        : "bg-gray-600"
                  }`}
                >
                  {emergency.status}
                </span>
              </div>
              <p className="text-sm text-gray-400">{emergency.description}</p>
              <p className="text-sm text-gray-400">Hospital: {emergency.hospitalName}</p>
              <p className="text-sm text-gray-400">Requested: {new Date(emergency.requestTime).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        {selectedEmergency ? (
          <Map
            hospitals={[
              { id: selectedEmergency.hospitalId, name: selectedEmergency.hospitalName, lat: 40.7128, lng: -74.006 },
            ]}
            showDirections={true}
            destination={selectedEmergency.patientLocation}
            onHospitalSelect={() => {}}
            userProfile={transportProfile}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FaAmbulance className="mx-auto text-6xl mb-4 text-gray-600" />
              <p className="text-gray-400">Select an emergency request to view directions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
