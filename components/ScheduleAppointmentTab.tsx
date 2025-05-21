"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaHospital,
  FaCheckCircle,
  FaUserMd,
  FaNotesMedical,
} from "react-icons/fa";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ScheduleAppointmentTabProps {
  selectedHospital: any;
  userProfile: any;
}

// Available time slots
const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

// Available doctors
const availableDoctors = [
  {
    id: 1,
    name: "Dr. Chinedu Okafor",
    specialty: "Cardiology",
    rating: 4.8,
    image: "https://ui-avatars.com/api/?name=Chinedu+Okafor&background=0D8ABC&color=fff",
  },
  {
    id: 2,
    name: "Dr. Amina Bello",
    specialty: "Neurology",
    rating: 4.9,
    image: "https://ui-avatars.com/api/?name=Amina+Bello&background=0D8ABC&color=fff",
  },
  {
    id: 3,
    name: "Dr. Tunde Adebayo",
    specialty: "Pediatrics",
    rating: 4.7,
    image: "https://ui-avatars.com/api/?name=Tunde+Adebayo&background=0D8ABC&color=fff",
  },
];




export default function ScheduleAppointmentTab({
  selectedHospital,
  userProfile,
}: ScheduleAppointmentTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointmentSummary, setAppointmentSummary] = useState("");
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!selectedHospital) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full p-6 text-center"
      >
        <FaHospital className="text-6xl text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Select a Hospital
        </h3>
        <p className="text-gray-500">
          Please select a hospital on the map or from the search dropdown to
          schedule an appointment.
        </p>
      </motion.div>
    );
  }

//   if (userProfile.type !== "patient") {
//   return (
//     <div className="p-8 text-center text-red-500 font-semibold">
//       Only patients can join queues or book appointments.
//     </div>
//   );
// }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fullName = userProfile?.firstName && userProfile?.lastName
  ? `${userProfile.firstName} ${userProfile.lastName}`
  : "Unknown Patient";

      const appointment = {
        id: Date.now(),
        patientName: fullName,
        patientId: userProfile.id,
        hospitalId: selectedHospital.id,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        appointmentDate: selectedDate?.toISOString(),
        appointmentTime: selectedTime,
        status: "scheduled",
        summary: appointmentSummary,
      };

      const existingAppointments = JSON.parse(
        localStorage.getItem("appointments") || "[]"
      );
      localStorage.setItem(
        "appointments",
        JSON.stringify([...existingAppointments, appointment])
      );

      setAppointmentBooked(true);
      toast.success(
        <div>
          <p className="font-medium">Appointment booked successfully!</p>
          <p className="text-sm text-gray-500">
            Your appointment is scheduled for{" "}
            {selectedDate?.toLocaleDateString()} at {selectedTime}.
          </p>
        </div>
      );
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.");
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

      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!appointmentBooked ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-8">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= stepNumber
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step > stepNumber ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Select Doctor */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUserMd className="mr-2 text-blue-500" />
                    Select a Doctor
                  </h3>
                  <div className="grid gap-4">
                    {availableDoctors.map((doctor) => (
                      <motion.button
                        key={doctor.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedDoctor?.id === doctor.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        <div className="flex items-center">
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {doctor.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {doctor.specialty}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-yellow-500">
                              <span className="mr-1">⭐</span>
                              <span>{doctor.rating}</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                    onClick={() => setStep(2)}
                    disabled={!selectedDoctor}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Select Date and Time */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Select Date & Time
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                      className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholderText="Select a date"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-lg text-center ${
                          selectedTime === time
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-xl font-semibold text-blue-500 border-2 border-blue-500 hover:bg-blue-50"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                      onClick={() => setStep(3)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continue
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Appointment Summary */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg text-gray-800 font-semibold flex items-center">
                    <FaNotesMedical className="mr-2 text-blue-500" />
                    Appointment Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center">
                      <img
                        src={selectedDoctor.image}
                        alt={selectedDoctor.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {selectedDoctor.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {selectedDoctor.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2" />
                      <span>{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2" />
                      <span>{selectedTime}</span>
                    </div>
                    <textarea
                      placeholder="Describe your symptoms or reason for visit"
                      className="w-full p-3 rounded-lg border text-gray-800 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={appointmentSummary}
                      onChange={(e) => setAppointmentSummary(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-xl font-semibold text-blue-500 border-2 border-blue-500 hover:bg-blue-50"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                      onClick={handleSubmit}
                      disabled={loading || !appointmentSummary}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center text-gray-800">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 text-gray-800" />
                          Booking...
                        </div>
                      ) : (
                        "Confirm Booking"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="booking-confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Appointment Confirmed!
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 mt-6 space-y-4">
                <div className="flex items-center justify-center">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">
                      {selectedDoctor.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedDoctor.specialty}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  <span>
                    {selectedDate?.toLocaleDateString()} at {selectedTime}
                  </span>
                </div>
                <p className="text-gray-600 mt-4">{appointmentSummary}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 px-6 py-3 rounded-xl font-semibold text-blue-500 border-2 border-blue-500 hover:bg-blue-50"
                onClick={() => {
                  setAppointmentBooked(false);
                  setStep(1);
                  setSelectedDoctor(null);
                  setSelectedDate(null);
                  setSelectedTime("");
                  setAppointmentSummary("");
                }}
              >
                Book Another Appointment
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
