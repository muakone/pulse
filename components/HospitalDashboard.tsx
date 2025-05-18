"use client"

import { useState, useEffect } from "react"
import { FaAmbulance, FaUserClock, FaCalendarAlt, FaHospital } from "react-icons/fa"
import type { IEmergencyRequest, IQueueRequest, IAppointment, IHospital } from "@/types"
import { dummyEmergencyRequests, dummyQueueRequests, dummyAppointments } from "@/data/dummy"
import HospitalProfile from "./HospitalProfile"

const tabs = [
  { id: "emergencies", label: "Emergencies", icon: FaAmbulance },
  { id: "queues", label: "Queues", icon: FaUserClock },
  { id: "appointments", label: "Appointments", icon: FaCalendarAlt },
  { id: "profile", label: "Profile", icon: FaHospital },
]

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("emergencies")
  const [hospitalProfile, setHospitalProfile] = useState<IHospital | null>(null)
  const [emergencies, setEmergencies] = useState<IEmergencyRequest[]>([])
  const [queues, setQueues] = useState<IQueueRequest[]>([])
  const [appointments, setAppointments] = useState<IAppointment[]>([])

  useEffect(() => {
    // Load hospital profile from localStorage
    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setHospitalProfile(JSON.parse(storedProfile))
    }

    // Load requests from localStorage or use dummy data
    const storedEmergencies = localStorage.getItem("emergencyRequests")
    setEmergencies(storedEmergencies ? JSON.parse(storedEmergencies) : dummyEmergencyRequests)

    const storedQueues = localStorage.getItem("queueRequests")
    setQueues(storedQueues ? JSON.parse(storedQueues) : dummyQueueRequests)

    const storedAppointments = localStorage.getItem("appointments")
    setAppointments(storedAppointments ? JSON.parse(storedAppointments) : dummyAppointments)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "emergencies":
        return (
          <div className="grid gap-4">
            {emergencies.map((emergency) => (
              <div key={emergency.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-2">
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
                <p className="text-sm text-gray-400">Transport: {emergency.transportName}</p>
                <p className="text-sm text-gray-400">Requested: {new Date(emergency.requestTime).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )

      case "queues":
        return (
          <div className="grid gap-4">
            {queues.map((queue) => (
              <div key={queue.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{queue.patientName}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      queue.status === "waiting"
                        ? "bg-yellow-600"
                        : queue.status === "in_progress"
                          ? "bg-primary-600"
                          : "bg-gray-600"
                    }`}
                  >
                    {queue.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{queue.description}</p>
                <p className="text-sm text-gray-400">
                  Estimated Time: {new Date(queue.estimatedTime).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )

      case "appointments":
        return (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{appointment.patientName}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      appointment.status === "scheduled"
                        ? "bg-primary-600"
                        : appointment.status === "completed"
                          ? "bg-gray-600"
                          : "bg-red-600"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{appointment.summary}</p>
                <p className="text-sm text-gray-400">
                  Date: {appointment.appointmentDate} at {appointment.appointmentTime}
                </p>
              </div>
            ))}
          </div>
        )

      case "profile":
        return <HospitalProfile profile={hospitalProfile} onUpdate={setHospitalProfile} />

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-900 p-4">
        <h1 className="text-xl font-bold mb-8">Hospital Dashboard</h1>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center w-full px-4 py-2 rounded-md ${
                activeTab === tab.id ? "bg-primary-600" : "hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
        {renderContent()}
      </div>
    </div>
  )
}
