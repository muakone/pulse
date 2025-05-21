"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaAmbulance,
  FaHospital,
  FaCalendarAlt,
  FaUser,
  FaBell,
} from "react-icons/fa";
import Map from "@/components/Map";
import EmergencyTab from "@/components/EmergencyTab";
import JoinQueueTab from "@/components/JoinQueueTab";
import ScheduleAppointmentTab from "@/components/ScheduleAppointmentTab";
import HospitalDropdown from "@/components/HospitalDropdown";
import { dummyHospitals } from "@/lib/dummyHospital";
import { toast } from "sonner";

// Uber-inspired color scheme
const colors = {
  primary: "#000000",
  secondary: "#00A3FF",
  accent: "#FF5A5F",
  background: "#FFFFFF",
  surface: "#F7F7F7",
  text: "#1A1A1A",
  textSecondary: "#666666",
};

const tabs = [
  {
    id: "emergency",
    label: "Emergency",
    icon: FaAmbulance,
    color: colors.accent,
  },
  {
    id: "joinQueue",
    label: "Join Queue",
    icon: FaHospital,
    color: colors.secondary,
  },
  {
    id: "scheduleAppointment",
    label: "Schedule",
    icon: FaCalendarAlt,
    color: colors.primary,
  },
];

// Dummy data for hospitals
// const dummyHospitals = [
//   {
//     id: 1,
//     name: "City Hospital",
//     lat: 40.7128,
//     lng: -74.006,
//     specialties: ["Cardiology", "Neurology"],
//     averageResponseTime: 30,
//     peopleInQueue: 5,
//   },
//   {
//     id: 2,
//     name: "Central Clinic",
//     lat: 40.7282,
//     lng: -73.9942,
//     specialties: ["Pediatrics", "Orthopedics"],
//     averageResponseTime: 45,
//     peopleInQueue: 8,
//   },
//   // ... more hospitals
// ];

export default function PatientHome() {
  const [activeTab, setActiveTab] = useState("emergency");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hospitals, setHospitals] = useState(dummyHospitals);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHospitals, setFilteredHospitals] = useState(dummyHospitals);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
      console.log(storedProfile, "storedProfile");
    }
  }, []);

  useEffect(() => {
  if (typeof window !== "undefined") {
    const returned = sessionStorage.getItem("returnedFromStatus");
    if (returned) {
      sessionStorage.removeItem("returnedFromStatus");
      setSelectedHospital(null);
      setSearchTerm("");
      setFilteredHospitals(hospitals); // fallback list
      console.log("🧹 Reset state after returning from EmergencyStatus");
    }
  }
}, []);


  useEffect(() => {
  if (selectedHospital) {
    // Delay restoring full hospital list to avoid flicker
    const timeout = setTimeout(() => {
      setFilteredHospitals(hospitals); // restore full list after rendering
    }, 500); // allow map to finish animating

    return () => clearTimeout(timeout);
  }
}, [selectedHospital]);


const handleHospitalSelect = (hospital: any) => {
  if (!isMapReady) {
    toast.error("Map is still loading...");
    return;
  }

  if (!hospital?.lat || !hospital?.lng || !hospital.name) {
    toast.error("Invalid hospital selection.");
    return;
  }

  setSelectedHospital(hospital);
  setSearchTerm("");        // clear input
  setShowDropdown(false);   // hide dropdown
};



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setShowDropdown(term.length > 0);
    const filtered = hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(term) ||
        hospital.specialties.some((specialty: string) =>
          specialty.toLowerCase().includes(term)
        )
    );
    setFilteredHospitals(filtered);
  };

  const handleMapReady = useCallback(() => {
    console.log("✅ Map is now ready in PatientHome");
    setIsMapReady(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar - Navigation */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-16 bg-black flex flex-col items-center py-6"
      >
        <div className="mb-8">
          <img src="/logo.png" alt="Pulse" className="w-10 h-10" />
        </div>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
              activeTab === tab.id ? "bg-white" : "bg-gray-800"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon
              className={`text-xl ${
                activeTab === tab.id ? "text-black" : "text-white"
              }`}
            />
          </motion.button>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map Section */}
        <div className="w-2/3 relative">
          <div className="absolute top-4 left-4 right-4 z-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-lg shadow-lg p-4"
            >
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search hospitals or specialties"
                    className="w-full px-4 py-3 pl-10 bg-gray-100 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-black text-white rounded-full"
                >
                  <FaBell />
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gray-100 rounded-full"
                >
                  <FaUser className="text-gray-600" />
                </motion.div>
              </div>
              {searchTerm && showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <HospitalDropdown
                    hospitals={filteredHospitals}
                    onSelect={handleHospitalSelect}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>

          <Map
            hospitals={filteredHospitals}
            onHospitalSelect={handleHospitalSelect}
            userProfile={userProfile}
            onMapReady={handleMapReady}
            selectedHospital={selectedHospital}
          />
        </div>

        {/* Right Panel */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-1/3 bg-white border-l border-gray-200"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "emergency" && (
                <EmergencyTab
                  userProfile={userProfile}
                  selectedHospital={selectedHospital}
                />
              )}
              {activeTab === "joinQueue" && (
                <JoinQueueTab userProfile={userProfile} selectedHospital={selectedHospital}  />
              )}
              {activeTab === "scheduleAppointment" && (
                <ScheduleAppointmentTab userProfile={userProfile}  selectedHospital={selectedHospital} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
