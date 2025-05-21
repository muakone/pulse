"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAmbulance,
  FaCar,
  FaHospital,
  FaClock,
  FaUserMd,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "sonner";
import type { IMedTransport } from "@/types";
import { dummyMedTransports } from "@/data/dummy";
import EmergencyStatus from "./EmergencyStatus"; // ✅ Import the new inline version

interface EmergencyTabProps {
  userProfile: any;
  selectedHospital: any;
}

export default function EmergencyTab({
  userProfile,
  selectedHospital,
}: EmergencyTabProps) {
  const [selectedTransport, setSelectedTransport] = useState<IMedTransport | null>(null);
  const [nearbyTransports, setNearbyTransports] = useState<IMedTransport[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasActiveEmergency, setHasActiveEmergency] = useState(false); // ✅ State to toggle status tab

  useEffect(() => {
    if (selectedHospital) {
      const availableTransports = dummyMedTransports.filter(
        (transport) =>
          transport.status === "available" &&
          (!transport.hospitalId || transport.hospitalId === selectedHospital.id)
      );
      setNearbyTransports(availableTransports);
    }
  }, [selectedHospital]);

  useEffect(() => {
  const wasJustRequested = sessionStorage.getItem("emergencyJustRequested");
  if (wasJustRequested) {
    setHasActiveEmergency(true);
    sessionStorage.removeItem("emergencyJustRequested"); // Clean up
  }
}, []);


  const handleRequestEmergency = async () => {
    if (!selectedTransport) {
      toast.error("Please select a transport option");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const emergencyRequest = {
        patientName: userProfile?.firstName + " " + userProfile?.lastName,
        patientId: userProfile?.id,
        hospitalId: selectedHospital?.id,
        hospitalName: selectedHospital?.name,
        transportId: selectedTransport.id,
        transportName: selectedTransport.name,
        status: "pending",
        requestTime: new Date().toISOString(),
        patientLocation: {
          lat: 40.7289,
          lng: -73.9965,
        },
        description: userProfile?.knownAilments,
      };

      const existingRequests = JSON.parse(
        localStorage.getItem("emergencyRequests") || "[]"
      );
      localStorage.setItem(
        "emergencyRequests",
        JSON.stringify([...existingRequests, emergencyRequest])
      );

      // toast.success("Emergency service requested successfully!", {
      //   description: `${selectedTransport.name} is on the way to your location.`,
      // });
      sessionStorage.setItem("emergencyJustRequested", "true");


      setHasActiveEmergency(true); // ✅ Switch to status view
    } catch (error) {
      toast.error("Failed to request emergency service", {
        description: "Please try again or contact support.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show EmergencyStatus if active
  if (hasActiveEmergency) {
    return <EmergencyStatus onReturn={() => setHasActiveEmergency(false)} />;
  }

  if (!selectedHospital) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full p-6 text-center"
      >
        <FaHospital className="text-6xl text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Hospital</h3>
        <p className="text-gray-500">
          Please select a hospital on the map or from the search dropdown to proceed with
          emergency services.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-white"
    >
      {/* Hospital Info */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedHospital.name}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <FaClock className="mr-2" />
              <span>Avg. Response: {selectedHospital.averageResponseTime} min</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedHospital.specialties.map((specialty: string) => (
                <span key={specialty} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-red-100 rounded-full">
            <FaExclamationTriangle className="text-red-500 text-xl" />
          </motion.div>
        </div>
      </motion.div>

      {/* Patient Info */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaUserMd className="mr-2 text-blue-500" />
          Patient Information
        </h3>
        <div className="space-y-3 text-gray-600">
          <div className="flex justify-between">
            <span>Name:</span>
            <span className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span>Health Summary:</span>
            <span className="font-medium">{userProfile?.pastHealthSummary || "Not available"}</span>
          </div>
          <div className="flex justify-between">
            <span>Known Conditions:</span>
            <span className="font-medium">{userProfile?.knownAilments || "Not available"}</span>
          </div>
        </div>
      </motion.div>

      {/* Transport Options */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Transport</h3>
        <AnimatePresence>
          <div className="space-y-3">
            {nearbyTransports.map((transport) => (
              <motion.button
                key={transport.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedTransport?.id === transport.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedTransport(transport)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${transport.type === "private_vehicle" ? "bg-green-100" : "bg-red-100"}`}>
                      {transport.type === "private_vehicle" ? (
                        <FaCar className="text-green-600" />
                      ) : (
                        <FaAmbulance className="text-red-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{transport.name}</h4>
                      <p className="text-sm text-gray-500">
                        {transport.type === "private_vehicle" ? "Medical Transport" : "Emergency Ambulance"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {Math.floor(Math.random() * 10) + 5} min
                    </div>
                    <div className="text-xs text-gray-500">ETA</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      </div>

      {/* Request Button */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
            loading || !selectedTransport
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
          onClick={handleRequestEmergency}
          disabled={loading || !selectedTransport}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Requesting...
            </div>
          ) : (
            "Request Emergency Service"
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
