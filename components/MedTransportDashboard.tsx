"use client";

import { useEffect, useState } from "react";
import {
  FaAmbulance,
  FaUser,
  FaBell,
  FaMapMarkerAlt,
  FaCar,
} from "react-icons/fa";
import type { IEmergencyRequest } from "@/types";
import { dummyEmergencyRequests } from "@/data/dummy";
import Map from "@/components/Map";
import { motion, AnimatePresence } from "framer-motion";

const colors = {
  primary: "#000000",
  secondary: "#00A3FF",
  accent: "#FF5A5F",
};

export default function MedTransportDashboard() {
  const [emergencies, setEmergencies] = useState<IEmergencyRequest[]>([]);
  const [selectedEmergency, setSelectedEmergency] =
    useState<IEmergencyRequest | null>(null);
  const [transportProfile, setTransportProfile] = useState<any>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setTransportProfile(JSON.parse(storedProfile));
    }

    const storedEmergencies = localStorage.getItem("emergencyRequests");
    setEmergencies(
      storedEmergencies ? JSON.parse(storedEmergencies) : dummyEmergencyRequests
    );
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-16 bg-black flex flex-col items-center py-6"
      >
        <div className="mb-8">
          <FaCar className="text-white text-2xl" />
        </div>
        <motion.div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
          <FaAmbulance className="text-red-500 text-xl" />
        </motion.div>
      </motion.div>

      {/* Map View */}
      <div className="w-2/3 relative">
        <div className="absolute top-4 left-4 right-4 z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-400">Logged in as</p>
              <h2 className="text-lg font-bold text-gray-800">
                {transportProfile?.name || "Driver"}
              </h2>
              <p className="text-sm text-gray-500">
                {transportProfile?.vehicleInfo}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button className="p-3 bg-gray-100 rounded-full">
                <FaBell className="text-gray-600" />
              </motion.button>
              <motion.button className="p-3 bg-gray-100 rounded-full">
                <FaUser className="text-gray-600" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        <Map
          hospitals={
            selectedEmergency
              ? [
                  {
                    id: selectedEmergency.hospitalId,
                    name: selectedEmergency.hospitalName,
                    lat: selectedEmergency.hospitalLat || 6.5244,
                    lng: selectedEmergency.hospitalLng || 3.3792,
                  },
                ]
              : []
          }
          selectedHospital={null}
          onHospitalSelect={() => {}}
          userProfile={transportProfile}
          patientLocation={
            selectedEmergency
              ? {
                  lat: selectedEmergency.patientLat || 6.4478,
                  lng: selectedEmergency.patientLng || 3.3792,
                }
              : null
          }
          mode="transport"
        />
      </div>

      {/* Right Panel */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-1/3 bg-white border-l border-gray-200 h-screen overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Emergency Requests
          </h2>
          <div className="space-y-4">
            {emergencies.map((emergency) => (
              <motion.button
                key={emergency.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-4 border rounded-xl transition ${
                  selectedEmergency?.id === emergency.id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedEmergency(emergency)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 font-semibold">
                    {emergency.patientName}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      emergency.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : emergency.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {emergency.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {emergency.description}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-400 mt-2">
                  <FaMapMarkerAlt />
                  <span>{emergency.hospitalName}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(emergency.requestTime).toLocaleString()}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
