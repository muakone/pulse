export interface IHospital {
  id: number
  name: string
  lat: number
  lng: number
  specialties: string[]
  averageResponseTime: number // in minutes
  peopleInQueue: number
  beds: number
  doctors: number
  averageConsultancyPrice: number // in Naira (₦)
}



export interface IMedTransport {
  id: number
  name: string
  type: "hospital_ambulance" | "private_ambulance" | "private_vehicle"
  hospitalId?: number // Only for hospital ambulances
  hospitalName?: string
  lat: number
  lng: number
  status: "available" | "busy"
}

export interface IEmergencyRequest {
  id: number
  patientName: string
  patientId: string
  hospitalId: number
  hospitalName: string
  transportId: number
  transportName: string
  status: "pending" | "accepted" | "in_progress" | "completed"
  requestTime: string
  patientLocation: {
    lat: number
    lng: number
  }
  description: string
}

export interface IQueueRequest {
  id: number
  patientName: string
  patientId: string
  hospitalId: number
  requestTime: string
  estimatedTime: string
  status: "waiting" | "in_progress" | "completed"
  description: string
}

export interface IAppointment {
  id: number
  patientName: string
  patientId: string
  hospitalId: number
  appointmentDate: string
  appointmentTime: string
  status: "scheduled" | "completed" | "cancelled"
  summary: string
}
