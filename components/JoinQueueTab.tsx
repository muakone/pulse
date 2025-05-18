"use client"

import { useState, useEffect } from "react"
import { FaClock, FaUserPlus } from "react-icons/fa"
import { toast } from "react-hot-toast"

interface JoinQueueTabProps {
  selectedHospital: any
  userProfile: any
}

export default function JoinQueueTab({ selectedHospital, userProfile }: JoinQueueTabProps) {
  const [joinedQueue, setJoinedQueue] = useState(false)
  const [nextAvailableTime, setNextAvailableTime] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedHospital) {
      // Calculate next available time based on average wait time and people in queue
      const totalWaitTime = selectedHospital.averageResponseTime * selectedHospital.peopleInQueue
      const nextTime = new Date(Date.now() + totalWaitTime * 60000)
      setNextAvailableTime(nextTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
  }, [selectedHospital])

  if (!selectedHospital) {
    return (
      <div className="text-center">
        <p>Please select a hospital on the map or from the search dropdown to join the queue.</p>
      </div>
    )
  }

  const handleJoinQueue = async () => {
    // Simulate joining the queue
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setJoinedQueue(true)

      // Store in localStorage for demo
      const queueRequest = {
        id: Date.now(),
        patientName: userProfile.firstName + " " + userProfile.lastName,
        patientId: userProfile.id,
        hospitalId: selectedHospital.id,
        requestTime: new Date().toISOString(),
        estimatedTime: nextAvailableTime,
        status: "waiting",
        description: "General consultation",
      }
      const existingQueues = JSON.parse(localStorage.getItem("queueRequests") || "[]")
      localStorage.setItem("queueRequests", JSON.stringify([...existingQueues, queueRequest]))

      toast.success("Successfully joined the queue!", {
        description: `Your estimated appointment time is ${nextAvailableTime}.`,
      })
    } catch (error) {
      toast.error("Failed to join queue. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Join Queue</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Selected Hospital</h3>
        <p>{selectedHospital.name}</p>
        <p>Specialties: {selectedHospital.specialties.join(", ")}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Queue Information</h3>
        <div className="flex items-center mb-2">
          <FaClock className="mr-2" />
          <p>Average Response Time: {selectedHospital.averageResponseTime} minutes</p>
        </div>
        <div className="flex items-center mb-2">
          <FaUserPlus className="mr-2" />
          <p>People in Queue: {selectedHospital.peopleInQueue}</p>
        </div>
        <div className="flex items-center">
          <FaClock className="mr-2" />
          <p>Next Available Time: {nextAvailableTime}</p>
        </div>
      </div>
      {!joinedQueue ? (
        <button
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md"
          onClick={handleJoinQueue}
          disabled={loading}
        >
          {loading ? "Joining..." : "Reserve Spot in Queue"}
        </button>
      ) : (
        <div className="text-center text-primary-500 font-bold">
          You are in the queue. Your estimated appointment time is {nextAvailableTime}.
        </div>
      )}
    </div>
  )
}
