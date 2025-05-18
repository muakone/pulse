"use client"

import { useEffect, useRef, useState } from "react"

interface MapProps {
  hospitals: any[]
  onHospitalSelect: (hospital: any) => void
  userProfile: any
}

const dummyMedTransports = [
  { id: 1, name: "Ambulance 1", type: "hospital_ambulance", lat: 40.72, lng: -74.0 },
  { id: 2, name: "Ambulance 2", type: "private_ambulance", lat: 40.73, lng: -73.99 },
  { id: 3, name: "Private Car 1", type: "private_vehicle", lat: 40.74, lng: -73.98 },
  // ... more transports
]

export default function Map({ hospitals, onHospitalSelect, userProfile }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [medTransports, setMedTransports] = useState(dummyMedTransports)

  useEffect(() => {
    // We'll get the maps URL from a server component or API route
    // Load the Google Maps script dynamically
    const loadGoogleMaps = async () => {
      try {
        // Fetch the Google Maps URL from our API route
        const response = await fetch("/api/maps-url")
        const { url } = await response.json()

        // Create a script element and append it to the document
        const script = document.createElement("script")
        script.src = url
        script.async = true
        script.defer = true

        // Initialize map when script loads
        script.onload = () => {
          if (mapRef.current && window.google) {
            const mapOptions = {
              center: { lat: 40.7128, lng: -74.006 },
              zoom: 12,
              styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              ],
            }

            mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions)

            // Add markers for hospitals
            hospitals.forEach((hospital) => {
              if (
                userProfile &&
                hospital.specialties.some((specialty: string) => userProfile.knownAilments.includes(specialty))
              ) {
                const marker = new google.maps.Marker({
                  position: { lat: hospital.lat, lng: hospital.lng },
                  map: mapInstanceRef.current,
                  title: hospital.name,
                  icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/hospital.png",
                    scaledSize: new google.maps.Size(32, 32),
                  },
                })

                marker.addListener("click", () => {
                  onHospitalSelect(hospital)
                  const infoWindow = new google.maps.InfoWindow({
                    content: `
                    <div>
                      <h3>${hospital.name}</h3>
                      <p>Specialties: ${hospital.specialties.join(", ")}</p>
                      <p>Average Wait Time: ${hospital.averageWaitTime} mins</p>
                    </div>
                  `,
                  })
                  infoWindow.open(mapInstanceRef.current, marker)
                })
              }
            })

            // Add markers for medical transports
            medTransports.forEach((transport) => {
              const marker = new google.maps.Marker({
                position: { lat: transport.lat, lng: transport.lng },
                map: mapInstanceRef.current,
                title: transport.name,
                icon: {
                  url: getTransportIcon(transport.type),
                  scaledSize: new google.maps.Size(32, 32),
                },
              })
            })
          }
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      }
    }

    loadGoogleMaps()
  }, [hospitals, onHospitalSelect, userProfile, medTransports])

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "hospital_ambulance":
        return "https://maps.google.com/mapfiles/ms/icons/ambulance.png"
      case "private_ambulance":
        return "https://maps.google.com/mapfiles/ms/icons/cabs.png"
      case "private_vehicle":
        return "https://maps.google.com/mapfiles/ms/icons/car.png"
      default:
        return "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
    }
  }

  return <div ref={mapRef} className="w-full h-full rounded-lg" />
}
