"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAmbulance,
  FaUserClock,
  FaCalendarAlt,
  FaHospital,
  FaBell,
  FaUser,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import type {
  IEmergencyRequest,
  IQueueRequest,
  IAppointment,
  IHospital,
} from "@/types";
import {
  dummyEmergencyRequests,
  dummyQueueRequests,
  dummyAppointments,
} from "@/data/dummy";
import HospitalProfile from "./HospitalProfile";

const tabs = [
  {
    id: "emergencies",
    label: "Emergencies",
    icon: FaAmbulance,
    color: "red",
  },
  {
    id: "queues",
    label: "Queues",
    icon: FaUserClock,
    color: "blue",
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: FaCalendarAlt,
    color: "green",
  },
  {
    id: "profile",
    label: "Profile",
    icon: FaHospital,
    color: "purple",
  },
];

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("emergencies");
  const [hospitalProfile, setHospitalProfile] = useState<IHospital | null>(
    null
  );
  const [emergencies, setEmergencies] = useState<IEmergencyRequest[]>([]);
  const [queues, setQueues] = useState<IQueueRequest[]>([]);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [notifications, setNotifications] = useState<number>(0);


  useEffect(() => {
    // Load hospital profile from localStorage
    const storedProfile = localStorage.getItem("userProfile");
    let parsedProfile = null;

    if (storedProfile) {
      parsedProfile = JSON.parse(storedProfile);
      setHospitalProfile(parsedProfile);
    }

    // Load and store emergency requests
    const storedEmergencies = localStorage.getItem("emergencyRequests");
    const parsedEmergencies = storedEmergencies
      ? JSON.parse(storedEmergencies)
      : dummyEmergencyRequests;
    setEmergencies(parsedEmergencies);

    // Set notifications: pending emergencies only for this hospital
    if (parsedProfile) {
      const hospitalEmergencies = parsedEmergencies.filter(
        (e: IEmergencyRequest) => e.hospitalId === parsedProfile.id
      );
      const pendingCount = hospitalEmergencies.filter(
        (e) => e.status === "pending"
      ).length;
      setNotifications(pendingCount);
    } else {
      setNotifications(0); // fallback if not logged in
    }

    // Load and store queue and appointment requests
    const storedQueues = localStorage.getItem("queueRequests");
    setQueues(storedQueues ? JSON.parse(storedQueues) : dummyQueueRequests);

    const storedAppointments = localStorage.getItem("appointments");
    setAppointments(
      storedAppointments ? JSON.parse(storedAppointments) : dummyAppointments
    );
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "emergencies":
        const filteredEmergencies = emergencies.filter(
          (e) => e.hospitalId === hospitalProfile?.id
        );

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Emergencies</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredEmergencies.filter(
                          (e) => e.status === "in_progress"
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <FaExclamationTriangle className="text-red-500 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredEmergencies.filter(
                          (e) => e.status === "pending"
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaClock className="text-yellow-500 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed Today</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredEmergencies.filter(
                          (e) =>
                            e.status === "completed" &&
                            new Date(e.requestTime).toDateString() ===
                              new Date().toDateString()
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaCheckCircle className="text-green-500 text-xl" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Emergency List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Emergency Requests
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredEmergencies.map((emergency) => (
                  <motion.div
                    key={emergency.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-red-100 rounded-full">
                          <FaAmbulance className="text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {emergency.patientName}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {emergency.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm text-gray-500">
                              Transport: {emergency.transportName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(emergency.requestTime).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            emergency.status
                          )}`}
                        >
                          {emergency.status}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <FaBell />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "queues":
        const filteredQueues = queues.filter(
          (q) => q.hospitalId == hospitalProfile?.id
        );

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Queue Stats */}
            <div className="grid grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Queue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredQueues.filter((q) => q.status === "waiting")
                          .length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaUserClock className="text-blue-500 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Wait Time</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      25m
                    </h3>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaClock className="text-yellow-500 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed Today</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredQueues.filter(
                          (q) =>
                            q.status === "completed" &&
                            new Date(q.requestTime).toDateString() ===
                              new Date().toDateString()
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaCheckCircle className="text-green-500 text-xl" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Queue List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Current Queue</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredQueues.map((queue, index) => (
                  <motion.div
                    key={queue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FaUser className="text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {queue.patientName}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {queue.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm text-gray-500">
                              Position: #{index + 1}
                            </span>
                            <span className="text-sm text-gray-500">
                              Est. Time:{" "}
                              {queue.estimatedTime
                                ? new Date(
                                    queue.estimatedTime
                                  ).toLocaleTimeString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            queue.status
                          )}`}
                        >
                          {queue.status}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <FaBell />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "appointments":
        const filteredAppointments = appointments.filter(
          (a) => a.hospitalId === hospitalProfile?.id
        );

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Appointment Stats */}
            <div className="grid grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Today's Appointments
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredAppointments.filter(
                          (a) =>
                            new Date(a.appointmentDate).toDateString() ===
                            new Date().toDateString()
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaCalendarAlt className="text-green-500 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredAppointments.filter(
                          (a) =>
                            new Date(a.appointmentDate) > new Date() &&
                            a.status === "scheduled"
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaClock className="text-blue-500 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed Today</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        filteredAppointments.filter(
                          (a) =>
                            a.status === "completed" &&
                            new Date(a.appointmentDate).toDateString() ===
                              new Date().toDateString()
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaCheckCircle className="text-green-500 text-xl" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Appointment List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Appointments</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FaCalendarAlt className="text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {appointment.patientName}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {appointment.summary}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm text-gray-500">
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              at {appointment.appointmentTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <FaBell />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case "profile":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HospitalProfile
              profile={hospitalProfile}
              onUpdate={setHospitalProfile}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white border-r border-gray-200"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaHospital className="text-blue-500 text-xl" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Hospital Dashboard
            </h1>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-50 text-${tab.color}-600`
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="mr-3" />
                <span className="font-medium">{tab.label}</span>
                {tab.id === "emergencies" && notifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {notifications}
                  </span>
                )}
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h2>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <div className="relative">
                  <FaBell className="text-xl" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600"
              >
                <FaUser className="text-xl" />
                <span className="font-medium">
                  {hospitalProfile?.name || "Hospital"}
                </span>
              </motion.button>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
