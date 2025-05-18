"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FaSearch, FaAmbulance, FaHospital, FaCalendarAlt } from "react-icons/fa"
import Map from "@/components/Map"
import EmergencyTab from "@/components/EmergencyTab"
import JoinQueueTab from "@/components/JoinQueueTab"
import ScheduleAppointmentTab from "@/components/ScheduleAppointmentTab"
import HospitalDropdown from "@/components/HospitalDropdown"

const tabs = [
  { id: "emergency", label: "Emergency", icon: FaAmbulance },
  { id: "joinQueue", label: "Join Queue", icon: FaHospital },
  { id: "scheduleAppointment", label: "Schedule Appointment", icon: FaCalendarAlt },
]

// Dummy data for hospitals
const dummyHospitals = [
  {
    id: 1,
    name: "City Hospital",
    lat: 40.7128,
    lng: -74.006,
    specialties: ["Cardiology", "Neurology"],
    averageResponseTime: 30,
    peopleInQueue: 5,
  },
  {
    id: 2,
    name: "Central Clinic",
    lat: 40.7282,
    lng: -73.9942,
    specialties: ["Pediatrics", "Orthopedics"],
    averageResponseTime: 45,
    peopleInQueue: 8,
  },
  // ... more hospitals
]

export default function PatientHome() {
  const [activeTab, setActiveTab] = useState("emergency")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [hospitals, setHospitals] = useState(dummyHospitals)
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHospitals, setFilteredHospitals] = useState(dummyHospitals)

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile")
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile))
    }
  }, [])

  const handleHospitalSelect = (hospital: any) => {
    setSelectedHospital(hospital)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(term) ||
        hospital.specialties.some((specialty: string) => specialty.toLowerCase().includes(term)),
    )
    setFilteredHospitals(filtered)
  }

  return (
    <div className="flex h-screen">
      <div className="w-2/3 p-4">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center px-4 py-2 rounded-md ${
                  activeTab === tab.id ? "bg-primary-600" : "bg-gray-800"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search hospitals"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && <HospitalDropdown hospitals={filteredHospitals} onSelect={handleHospitalSelect} />}
          </div>
        </div>
        <Map hospitals={filteredHospitals} onHospitalSelect={handleHospitalSelect} userProfile={userProfile} />
      </div>
      <div className="w-1/3 p-4 bg-gray-900">
        {activeTab === "emergency" && <EmergencyTab userProfile={userProfile} selectedHospital={selectedHospital} />}
        {activeTab === "joinQueue" && <JoinQueueTab selectedHospital={selectedHospital} />}
        {activeTab === "scheduleAppointment" && <ScheduleAppointmentTab selectedHospital={selectedHospital} />}
      </div>
    </div>
  )
}
