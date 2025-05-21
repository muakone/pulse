"use client";

import { useEffect, useState } from "react";
import {
  FaAmbulance,
  FaPhoneAlt,
  FaTimesCircle,
  FaUser,
  FaClock,
  FaArrowLeft,
  FaFilePdf,
  FaHospital,
} from "react-icons/fa";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface EmergencyStatusProps {
  onReturn?: () => void;
}

export default function EmergencyStatus({ onReturn }: EmergencyStatusProps) {
  const [request, setRequest] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only allow status to load if explicitly entered from EmergencyTab
    const allowShow =
      sessionStorage.getItem("emergencyJustRequested") === "true";

    if (!allowShow) {
      setIsLoading(false);
      return;
    }

    const requests = JSON.parse(
      localStorage.getItem("emergencyRequests") || "[]"
    );
    if (requests.length > 0) {
      setRequest(requests[requests.length - 1]);
      setEta(Math.floor(Math.random() * 10 + 5));
    }

    sessionStorage.removeItem("emergencyJustRequested"); // Clean up after loading
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!request) return;
    const requestTime = new Date(request.requestTime).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setElapsedTime(Math.floor((now - requestTime) / 60000));
      setEta((prev) => Math.max(1, Number((prev - 0.2).toFixed(1))));
    }, 5000);
    return () => clearInterval(interval);
  }, [request]);

  const handleCancelRequest = () => {
    if (confirm("Cancel this emergency request?")) {
      const requests = JSON.parse(
        localStorage.getItem("emergencyRequests") || "[]"
      );
      const updated = requests.filter(
        (r: any) => r.requestTime !== request?.requestTime
      );
      localStorage.setItem("emergencyRequests", JSON.stringify(updated));
      toast.success("Emergency request cancelled.");
      if (onReturn) onReturn();
    }
  };

  const generatePDF = () => {
    if (!request) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Pulse Emergency Trip Details", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text(`Request ID: ${Math.floor(Math.random() * 1000000)}`, 20, 40);
    doc.text(`Patient: ${request.patientName}`, 20, 50);
    doc.text(`Hospital: ${request.hospitalName}`, 20, 60);
    doc.text(`Description: ${request.description || "N/A"}`, 20, 70);
    doc.text(`Time Elapsed: ${elapsedTime} min`, 20, 80);
    doc.text(`ETA: ${eta.toFixed(1)} min`, 20, 90);
    doc.save("emergency-trip.pdf");
    toast.success("PDF downloaded");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-black rounded-full"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <FaAmbulance className="text-5xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Emergency</h2>
        <p className="text-gray-600 mb-6">
          You don’t have any active emergency requests.
        </p>
        <button
          onClick={onReturn}
          className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2"
        >
          <FaArrowLeft /> Return
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Emergency Status</h2>
        <button
          onClick={onReturn}
          className="flex items-center text-gray-600 hover:text-black"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-600">En Route</h3>
            <p className="text-gray-600">
              {request.transportName} is on the way
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{eta.toFixed(1)} min</div>
            <small className="text-gray-500">ETA</small>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Patient Info</h4>
          <p>
            <FaUser className="inline mr-2" /> {request.patientName}
          </p>
          <p>
            <FaClock className="inline mr-2" /> Elapsed: {elapsedTime} min
          </p>
          <p className="mt-2">
            Condition: {request.description || "Not specified"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Hospital Info</h4>
          <p>
            <FaHospital className="inline mr-2" /> {request.hospitalName}
          </p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleCancelRequest}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
          >
            <FaTimesCircle className="inline mr-2" /> Cancel Request
          </button>
          <button
            onClick={generatePDF}
            className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-black"
          >
            <FaFilePdf className="inline mr-2" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
