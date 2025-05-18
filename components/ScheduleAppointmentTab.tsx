"use client"

import type React from "react"
import { useState } from "react"
import { FaCalendarAlt } from "react-icons/fa"
import { toast } from "react-hot-toast"

interface ScheduleAppointmentTabProps {
  selectedHospital: any
  userProfile: any
}

export default function ScheduleAppointmentTab({ selectedHospital, userProfile }: ScheduleAppointmentTabProps) {
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [appointmentSummary, setAppointmentSummary] = useState("")
  const [appointmentBooked, setAppointmentBooked] = useState(false)

  if (!selectedHospital) {
    return (
      <div className="text-center">
        <p>Please select a hospital on the map or from the search dropdown to schedule an appointment.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate booking appointment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store in localStorage for demo
      const appointment = {
        id: Date.now(),
        patientName: userProfile.firstName + " " + userProfile.lastName,
        patientId: userProfile.id,
        hospitalId: selectedHospital.id,
        appointmentDate,
        appointmentTime,
        status: "scheduled",
        summary: appointmentSummary,
      }
      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      localStorage.setItem("appointments", JSON.stringify([...existingAppointments, appointment]))

      setAppointmentBooked(true)
      toast.success("Appointment booked successfully!", {
        description: `Your appointment is scheduled for ${appointmentDate} at ${appointmentTime}.`,
      })
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.")
    }
  }

  if (appointmentBooked) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Appointment Booked</h2>
        <p>Your appointment has been scheduled at {selectedHospital.name}</p>
        <p>Date: {appointmentDate}</p>
        <p>Time: {appointmentTime}</p>
        <p>Summary: {appointmentSummary}</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Schedule Appointment</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Selected Hospital</h3>
        <p>{selectedHospital.name}</p>
        <p>Specialties: {selectedHospital.specialties.join(", ")}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="appointmentSummary" className="block text-sm font-medium mb-2">
            Appointment Summary
          </label>
          <textarea
            id="appointmentSummary"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={appointmentSummary}
            onChange={(e) => setAppointmentSummary(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="appointmentDate" className="block text-sm font-medium mb-2">
            Preferred Date
          </label>
          <input
            type="date"
            id="appointmentDate"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="appointmentTime" className="block text-sm font-medium mb-2">
            Preferred Time
          </label>
          <input
            type="time"
            id="appointmentTime"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"
        >
          <FaCalendarAlt className="mr-2" />
          Book Appointment
        </button>
      </form>
    </div>
  )
}
