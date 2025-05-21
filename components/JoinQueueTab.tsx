"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaUserPlus,
  FaHospital,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

interface JoinQueueTabProps {
  selectedHospital: any;
  userProfile: any;
}

export default function JoinQueueTab({
  selectedHospital,
  userProfile,
}: JoinQueueTabProps) {
  const [joinedQueue, setJoinedQueue] = useState(false);
  const [nextAvailableTime, setNextAvailableTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);

  useEffect(() => {
    if (selectedHospital) {
      const totalWaitTime =
        selectedHospital.averageResponseTime * selectedHospital.peopleInQueue;
      const nextTime = new Date(Date.now() + totalWaitTime * 60000);
      setNextAvailableTime(
        nextTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setEstimatedWaitTime(totalWaitTime);
      setQueuePosition(selectedHospital.peopleInQueue + 1);
    }
  }, [selectedHospital]);

  if (!selectedHospital) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full p-6 text-center"
      >
        <FaHospital className="text-6xl text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Select a Hospital
        </h3>
        <p className="text-gray-500">
          Please select a hospital on the map or from the search dropdown to
          join the queue.
        </p>
      </motion.div>
    );
  }

  // if (userProfile.type !== "patient") {
  //   return (
  //     <div className="p-8 text-center text-red-500 font-semibold">
  //       Only patients can join queues or book appointments.
  //     </div>
  //   );
  // }

  const handleJoinQueue = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setJoinedQueue(true);

      const fullName =
        userProfile?.firstName && userProfile?.lastName
          ? `${userProfile.firstName} ${userProfile.lastName}`
          : "Unknown Patient";

      const queueRequest = {
        id: Date.now(),
        patientName: fullName,
        patientId: userProfile.id,
        hospitalId: selectedHospital.id,
        requestTime: new Date().toISOString(),
        estimatedTime: nextAvailableTime || new Date().toISOString(),
        status: "waiting",
        description: "General consultation",
        queuePosition: queuePosition,
      };

      if (!selectedHospital || !nextAvailableTime) {
  toast.error("Missing hospital or time info.");
  return;
}

      const existingQueues = JSON.parse(
        localStorage.getItem("queueRequests") || "[]"
      );
      localStorage.setItem(
        "queueRequests",
        JSON.stringify([...existingQueues, queueRequest])
      );

      toast.success("Successfully joined the queue!", {
        description: `Your estimated appointment time is ${nextAvailableTime}.`,
      });

      // Start queue position updates
      const interval = setInterval(() => {
        setQueuePosition((prev) => Math.max(1, prev - 1));
        setEstimatedWaitTime((prev) => Math.max(0, prev - 1));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    } catch (error) {
      toast.error("Failed to join queue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-white"
    >
      {/* Hospital Info Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 border-b border-gray-200"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedHospital.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {selectedHospital.specialties.map((specialty: string) => (
                <span
                  key={specialty}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <FaHospital className="text-blue-500 text-xl" />
          </div>
        </div>
      </motion.div>

      {/* Queue Status */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {!joinedQueue ? (
            <motion.div
              key="queue-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 flex text-gray-800 items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  Queue Information
                </h3>
                <div className="space-y-3 text-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Current Queue Size</span>
                    <span className="font-medium text-gray-800">
                      {selectedHospital.peopleInQueue} people
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Average Wait Time</span>
                    <span className="font-medium">
                      {selectedHospital.averageResponseTime} mins
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Next Available</span>
                    <span className="font-medium">{nextAvailableTime}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                  loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={handleJoinQueue}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Joining Queue...
                  </div>
                ) : (
                  "Reserve Spot in Queue"
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="queue-status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <FaCheckCircle className="text-blue-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  You're in the Queue!
                </h3>
                <p className="text-blue-600 mb-4">
                  Estimated appointment time: {nextAvailableTime}
                </p>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-800">Your Position</span>
                    <span className="text-2xl font-bold text-blue-500">
                      #{queuePosition}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Estimated Wait</span>
                    <span className="text-xl text-gray-800 font-semibold">
                      {estimatedWaitTime} mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">
                      Important Information
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Please arrive 10 minutes before your estimated appointment
                      time. Your position in the queue may change based on other
                      patients' status.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold text-blue-500 border-2 border-blue-500 hover:bg-blue-50"
                onClick={() => {
                  // Handle cancel queue
                  setJoinedQueue(false);
                  toast.success("Successfully removed from queue");
                }}
              >
                Leave Queue
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
