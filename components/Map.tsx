"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAmbulance,
  FaCar,
  FaHospital,
  FaLocationArrow,
  FaUser,
  FaUserMd,
} from "react-icons/fa";
import {
  MdLocationOn,
  MdDirectionsWalk,
  MdDirectionsCar,
} from "react-icons/md";
import { IHospital, IMedTransport } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

/// <reference types="@types/google.maps" />

// Add Google Maps types
type GoogleMaps = typeof google.maps;
type GoogleMap = google.maps.Map;
type GoogleMarker = google.maps.Marker;
type GoogleInfoWindow = google.maps.InfoWindow;
type GoogleLatLng = google.maps.LatLng;
type GooglePoint = google.maps.Point;
type GoogleAnimation = google.maps.Animation;
type GoogleEvent = typeof google.maps.event;
type GooglePlaces = typeof google.maps.places;

interface MapProps {
  hospitals: IHospital[];
  selectedHospital: IHospital | null;
  onHospitalSelect: (hospital: IHospital) => void;
  userProfile: any;
  mode?: "hospital" | "transport";
  onMapReady?: () => void;
  patientLocation?: { lat: number; lng: number } | null; // ✅ add this
}

interface ITransport {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  status: string;
  driver: string;
  rating: number;
  eta: number;
}

// Enhanced dummy data with more realistic properties
const dummyMedTransports = [
  {
    id: 1,
    name: "Ambulance 1",
    type: "hospital_ambulance",
    lat: 6.5244,
    lng: 3.3792,
    status: "available",
    driver: "John Smith",
    rating: 4.8,
    vehicleInfo: "Mercedes Sprinter",
    eta: 5,
  },
  {
    id: 2,
    name: "Ambulance 2",
    type: "private_ambulance",
    lat: 6.5298,
    lng: 3.378,
    status: "en_route",
    driver: "Sarah Johnson",
    rating: 4.9,
    vehicleInfo: "Ford Transit",
    eta: 8,
  },
  {
    id: 3,
    name: "Private Car 1",
    type: "private_vehicle",
    lat: 6.5305,
    lng: 3.383,
    status: "available",
    driver: "Mike Brown",
    rating: 4.7,
    vehicleInfo: "Toyota Camry",
    eta: 3,
  },
];

// Custom map styles for a modern, Uber-like look
const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
];

// Lagos coordinates
const LAGOS_COORDINATES = {
  lat: 6.5244,
  lng: 3.3792,
};

// Update the control buttons styling
const controlButtonStyle =
  "p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-50 transition-colors";

export default function Map({
  hospitals,
  onHospitalSelect,
  userProfile,
  mode = "hospital",
  selectedHospital,
  onMapReady,
  patientLocation,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const [medTransports, setMedTransports] = useState(dummyMedTransports);
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showTransportList, setShowTransportList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<IHospital[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const [searchResults, setSearchResults] = useState<
    google.maps.places.PlaceResult[]
  >([]);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHospitalMarker, setSelectedHospitalMarker] =
    useState<google.maps.Marker | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [locationRetryCount, setLocationRetryCount] = useState(0);
  const MAX_LOCATION_RETRIES = 3;
  const [isMapReady, setIsMapReady] = useState(false);
  const [isServicesReady, setIsServicesReady] = useState(false);
  const [hospitalMarkers, setHospitalMarkers] = useState<{
    [key: number]: google.maps.Marker;
  }>({});
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Add new state for tracking map elements
  const [mapElements, setMapElements] = useState<{
    directionsPolyline: google.maps.Polyline | null;

    userMarker: google.maps.Marker | null;
    selectedMarker: google.maps.Marker | null;
  }>({
    directionsPolyline: null,

    userMarker: null,
    selectedMarker: null,
  });

  // Update the map bounds padding
  const mapPadding = 10;

  // Update the directions request
  const getDirectionsRequest = (
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ): google.maps.DirectionsRequest => ({
    origin,
    destination,
    travelMode: google.maps.TravelMode.DRIVING,
  });
  console.log("🚨 Map component mounted");

  // Load Google Maps script only once
  useEffect(() => {
    let isMounted = true;

    const loadGoogleMaps = async () => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log("Google Maps script already loaded");
        if (isMounted) {
          setIsGoogleMapsLoaded(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the maps URL with API key
        const response = await fetch("/api/maps-url");
        if (!response.ok) {
          throw new Error("Failed to fetch maps URL");
        }

        const { url } = await response.json();
        console.log("Maps URL:", url);

        // Create and load the script
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.defer = true;

        script.onerror = (error) => {
          console.error("Error loading Google Maps script:", error);
          if (isMounted) {
            setError("Failed to load Google Maps. Please check your API key.");
            toast.error(
              "Failed to load Google Maps. Please check your API key."
            );
            setIsLoading(false);
          }
        };

        script.onload = () => {
          console.log("Google Maps script loaded successfully");
          if (!window.google || !window.google.maps) {
            if (isMounted) {
              setError("Google Maps failed to initialize");
              toast.error("Google Maps failed to initialize");
              setIsLoading(false);
            }
            return;
          }
          if (isMounted) {
            setIsGoogleMapsLoaded(true);
            initializeMap();
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Error in loadGoogleMaps:", error);
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load Google Maps"
          );
          toast.error("Failed to load Google Maps. Please try again.");
          setIsLoading(false);
        }
      }
    };

    loadGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Add this new useEffect for geolocation handling
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current) return;

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser");
        setLocationError("Geolocation is not supported by your browser");
        setUserLocation(LAGOS_COORDINATES);
        setIsMapReady(true);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

      const successCallback = (position: GeolocationPosition) => {
        console.log("Got user location:", position.coords);
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userLatLng);
        setLocationError(null);
        setLocationPermissionDenied(false);
        setLocationRetryCount(0);

        // Update user marker if map is available
        if (mapInstanceRef.current) {
          if (userMarker) {
            userMarker.setMap(null);
          }

          const marker = new window.google.maps.Marker({
            position: userLatLng,
            map: mapInstanceRef.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            title: "Your Location",
            zIndex: 1000,
          });
          setUserMarker(marker);

          if (mapInstanceRef.current && userLatLng) {
            onMapReady?.(); // ✅ Move it here
          }

          // Add a circle to show the 10km radius
          // new window.google.maps.Circle({
          //   strokeColor: "#4285F4",
          //   strokeOpacity: 0.2,
          //   strokeWeight: 1,
          //   fillColor: "#4285F4",
          //   fillOpacity: 0.1,
          //   map: mapInstanceRef.current,
          //   center: userLatLng,
          //   radius: 10000, // 10km in meters
          // });

          // Update bounds
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(userLatLng);
          hospitals.forEach((hospital) => {
            bounds.extend({ lat: hospital.lat, lng: hospital.lng });
          });
        }
      };

      const errorCallback = (error: GeolocationPositionError) => {
        console.error("Error getting location:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable location services."
            );
            setLocationPermissionDenied(true);
            toast.error("Location access denied. Using default location.", {
              description:
                "Please enable location services in your browser settings to get accurate directions.",
              duration: 5000,
            });
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            if (locationRetryCount < MAX_LOCATION_RETRIES) {
              setLocationRetryCount((prev) => prev + 1);
              setTimeout(getUserLocation, 1000); // Retry after 1 second
              return;
            }
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            if (locationRetryCount < MAX_LOCATION_RETRIES) {
              setLocationRetryCount((prev) => prev + 1);
              setTimeout(getUserLocation, 1000); // Retry after 1 second
              return;
            }
            break;
          default:
            setLocationError(
              "An unknown error occurred while getting location."
            );
        }

        // If we've exhausted retries or got a permission error, use default location
        if (
          locationRetryCount >= MAX_LOCATION_RETRIES ||
          error.code === error.PERMISSION_DENIED
        ) {
          setUserLocation(LAGOS_COORDINATES);
          setIsMapReady(true);
          if (mapInstanceRef.current) {
            if (userMarker) {
              userMarker.setMap(null);
            }
            const marker = new window.google.maps.Marker({
              position: LAGOS_COORDINATES,
              map: mapInstanceRef.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
              title: "Your Location (Default)",
              zIndex: 1000,
            });
            setUserMarker(marker);
          }
        }
      };

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    };

    getUserLocation();

    // Set up a watch for location updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userLatLng);

        // Update marker position if it exists
        if (userMarker) {
          userMarker.setPosition(userLatLng);
        }
      },
      (error) => {
        console.error("Error watching location:", error);
        // Don't update location on watch errors, just log them
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setLocationWatchId(watchId);

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isGoogleMapsLoaded, hospitals]);
  useEffect(() => {
    if (
      mode === "transport" &&
      userLocation &&
      patientLocation &&
      mapInstanceRef.current &&
      directionsService &&
      directionsRenderer
    ) {
      // Route from user (driver) to patient
      directionsRenderer.setMap(mapInstanceRef.current);

      directionsService.route(
        {
          origin: userLocation,
          destination: patientLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
          } else {
            console.warn("Failed to fetch directions:", status);
          }
        }
      );
    }
  }, [
    userLocation,
    patientLocation,
    mode,
    directionsService,
    directionsRenderer,
  ]);

  // Initialize map and markers
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      console.error("Map container or Google Maps not available");
      return;
    }

    try {
      const mapOptions = {
        center: LAGOS_COORDINATES,
        zoom: 14,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        minZoom: 12,
        maxZoom: 16,
      };

      console.log("Initializing map with options:", mapOptions);
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Enforce zoom after fitBounds (only once)
      const listener = window.google.maps.event.addListenerOnce(
        map,
        "bounds_changed",
        () => {}
      );

      // Initialize directions service and renderer with custom styles
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#2563EB", // Updated to a more vibrant blue
          strokeWeight: 5,
          strokeOpacity: 0.8,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: "#2563EB",
                fillColor: "#2563EB",
                fillOpacity: 1,
              },
              offset: "50%",
              repeat: "100px",
            },
          ],
        },
      });
      directionsRenderer.setMap(map);
      setDirectionsService(directionsService);
      setDirectionsRenderer(directionsRenderer);
      setIsServicesReady(true);
      // onMapReady?.();

      console.log("✅ onMapReady callback triggered in Map");

      // Store markers in state for later management
      const markers: { [key: number]: google.maps.Marker } = {};

      // Add hospital markers
      hospitals.forEach((hospital) => {
        const hospitalMarker = new window.google.maps.Marker({
          position: { lat: hospital.lat, lng: hospital.lng },
          map: map,
          icon: {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#EF4444",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 2,
            anchor: new window.google.maps.Point(12, 24),
          },
          title: hospital.name,
        });

        markers[hospital.id] = hospitalMarker;

        hospitalMarker.addListener("click", () => {
          if (!isMapReady || !isServicesReady || !userLocation) {
            toast.error("Please wait while we initialize the map services...", {
              description: "This may take a few seconds.",
              duration: 3000,
            });
            return;
          }
          console.log("Hospital clicked:", hospital.name);
          handleHospitalClick(hospital, true); // true indicates it's from click
        });
      });

      setHospitalMarkers(markers);
      setIsMapReady(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing map:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initialize map"
      );
      setIsLoading(false);
    }
  };

  // Add this new function to manage marker visibility
  const updateHospitalMarkersVisibility = (
    selectedHospitalId: number | null
  ) => {
    if (!hospitalMarkers) return;
    Object.entries(hospitalMarkers).forEach(([hospitalId, marker]) => {
      if (selectedHospitalId === null) {
        // Show all markers
        marker.setMap(mapInstanceRef.current);
      } else {
        // Show only the selected hospital marker
        marker.setMap(
          Number(hospitalId) === selectedHospitalId
            ? mapInstanceRef.current
            : null
        );
      }
    });
  };

  // Update the handleHospitalClick function

  const handleHospitalClick = async (
    hospital: IHospital,
    isFromClick: boolean = false
  ) => {
    console.log("✅ handleHospitalClick called for:", hospital.name);
    // toast("🧪 handleHospitalClick triggered");
    console.log("🏥 handleHospitalClick received hospital:", hospital.name);

    console.log("Map readiness check", {
      isMapReady,
      isServicesReady,
      hasUserLocation: !!userLocation,
      hasMapInstance: !!mapInstanceRef.current,
    });
    if (!userLocation || !mapInstanceRef.current) {
      toast.error("Still locating you... Please wait.");
      return;
    }

    setIsSearchMode(!isFromClick);

    // === 1. Clear previous directions, markers, polylines ===
    if (mode !== "transport" && directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
      directionsRenderer.setMap(null);
    }

    if (mapElements.directionsPolyline) {
      mapElements.directionsPolyline.setMap(null);
    }
    if (mapElements.selectedMarker) {
      mapElements.selectedMarker.setMap(null);
    }

    // === 2. Re-attach the directionsRenderer before setting new directions ===
    if (directionsRenderer && mapInstanceRef.current) {
      directionsRenderer.setMap(mapInstanceRef.current); // ✅ Important
    }

    // === 3. Update marker visibility (optional: hide others) ===
    Object.entries(hospitalMarkers).forEach(([hospitalId, marker]) => {
      marker.setMap(
        Number(hospitalId) === hospital.id ? mapInstanceRef.current : null
      );
    });

    // === 4. Add bouncing marker for selected hospital ===
    const selectedMarker = new window.google.maps.Marker({
      position: { lat: hospital.lat, lng: hospital.lng },
      map: mapInstanceRef.current,
      icon: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: "#2563EB",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
        scale: 2,
        anchor: new window.google.maps.Point(12, 24),
      },
      animation: window.google.maps.Animation.BOUNCE,
      zIndex: 1000,
    });

    setTimeout(() => {
      selectedMarker.setAnimation(null);
    }, 2000);

    setMapElements((prev) => ({
      ...prev,
      selectedMarker,
    }));

    // === 5. Calculate and render directions ===
    if (directionsService && directionsRenderer) {
      try {
        const result = await new Promise<google.maps.DirectionsResult>(
          (resolve, reject) => {
            if (mode !== "transport") {
              directionsService.route(
                {
                  origin: userLocation,
                  destination: { lat: hospital.lat, lng: hospital.lng },
                  travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK && result) {
                    directionsRenderer.setDirections(result);

                    mapInstanceRef.current?.setCenter({
                      lat: hospital.lat,
                      lng: hospital.lng,
                    });
                    mapInstanceRef.current?.setZoom(14);
                  } else {
                    console.warn("Directions failed:", status);
                  }
                }
              );
            }
          }
        );

        // ✅ Directions successfully calculated
        directionsRenderer.setDirections(result);

        mapInstanceRef.current.setCenter({
          lat: hospital.lat,
          lng: hospital.lng,
        });
        mapInstanceRef.current.setZoom(14); // or 15, depending on desired closeness
      } catch (error) {
        console.error("Directions failed:", error);

        // === 6. Fallback: Draw straight line with arrows ===
        const polyline = new window.google.maps.Polyline({
          path: [userLocation, { lat: hospital.lat, lng: hospital.lng }],
          geodesic: true,
          strokeColor: "#2563EB",
          strokeOpacity: 0.8,
          strokeWeight: 5,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: "#2563EB",
                fillColor: "#2563EB",
                fillOpacity: 1,
              },
              offset: "50%",
              repeat: "100px",
            },
          ],
          map: mapInstanceRef.current,
        });

        setMapElements((prev) => ({
          ...prev,
          directionsPolyline: polyline,
        }));

        mapInstanceRef.current.setCenter({
          lat: hospital.lat,
          lng: hospital.lng,
        });
        mapInstanceRef.current.setZoom(14); // or 13 based on how close you want
      }
    }

    // === 7. Show hospital info in toast ===
    toast.success(`Selected ${hospital.name}`, {
      description: (
        <div className="mt-2 space-y-1">
          <p>• Average Response Time: {hospital.averageResponseTime} mins</p>
          <p>• Current Queue: {hospital.peopleInQueue} people</p>
          <p>• Specialties: {hospital.specialties.join(", ")}</p>
        </div>
      ),
      duration: 5000,
    });

    onHospitalSelect(hospital);
  };

  // Update resetMapView function
  const resetMapView = () => {
    setIsSearchMode(false);

    // Clear directions and selected marker
    if (mapElements.directionsPolyline) {
      mapElements.directionsPolyline.setMap(null);
    }
    if (mapElements.selectedMarker) {
      mapElements.selectedMarker.setMap(null);
    }
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    // Show all hospital markers
    Object.values(hospitalMarkers).forEach((marker) => {
      marker.setMap(mapInstanceRef.current);
    });

    setMapElements((prev) => ({
      ...prev,
      directionsPolyline: null,
      selectedMarker: null,
    }));
  };

  // Update user location effect to handle marker updates
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current || !userLocation) return;

    const updateUserMarker = () => {
      // Clear existing user marker
      if (mapElements.userMarker) {
        mapElements.userMarker.setMap(null);
      }

      // Create new user marker
      const marker = new window.google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Your Location",
        zIndex: 1000,
      });

      // Update state
      setMapElements((prev) => ({
        ...prev,
        userMarker: marker,
      }));

      // Add location circle
      // new window.google.maps.Circle({
      //   strokeColor: "#4285F4",
      //   strokeOpacity: 0.2,
      //   strokeWeight: 1,
      //   fillColor: "#4285F4",
      //   fillOpacity: 0.1,
      //   map: mapInstanceRef.current,
      //   center: userLocation,
      //   radius: 10000,
      // });
    };

    updateUserMarker();
  }, [isGoogleMapsLoaded, userLocation]);

  // ✅ Patient Marker Handling
  useEffect(() => {
    if (
      mode === "transport" &&
      patientLocation &&
      mapInstanceRef.current &&
      isGoogleMapsLoaded
    ) {
      // Clear existing marker
      if (mapElements.selectedMarker) {
        mapElements.selectedMarker.setMap(null);
      }

      // Add red marker for patient
      const marker = new google.maps.Marker({
        position: patientLocation,
        map: mapInstanceRef.current,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new google.maps.Size(40, 40),
        },
        title: "Patient Location",
      });

      setMapElements((prev) => ({
        ...prev,
        selectedMarker: marker,
      }));
    }
  }, [patientLocation, isGoogleMapsLoaded, mapInstanceRef.current]);

  // Update hospital markers effect
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current) return;

    const updateHospitalMarkers = () => {
      // Clear existing hospital markers
      Object.values(hospitalMarkers).forEach((marker) => {
        if (marker !== mapElements.selectedMarker) {
          marker.setMap(null);
        }
      });

      const newMarkers: { [key: number]: google.maps.Marker } = {};

      hospitals.forEach((hospital) => {
        const marker = new window.google.maps.Marker({
          position: { lat: hospital.lat, lng: hospital.lng },
          map: mapInstanceRef.current,
          icon: {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#EF4444",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 2,
            anchor: new window.google.maps.Point(12, 24),
          },
          title: hospital.name,
        });

        // 💥 Important: Clear old listeners
        window.google.maps.event.clearInstanceListeners(marker);

        // ✅ Correct listener
        marker.addListener("click", () => {
          console.log("🏥 Marker clicked:", hospital.name);

          if (!isMapReady || !isServicesReady || !userLocation) {
            toast.error("Please wait while we initialize the map services...");
            return;
          }

          handleHospitalClick(hospital, true); // ✅ Main logic to show directions
          onHospitalSelect(hospital); // Optional: notify parent too
        });

        newMarkers[hospital.id] = marker;
      });

      setMapElements((prev) => ({
        ...prev,
        hospitalMarkers: newMarkers,
      }));
    };

    updateHospitalMarkers();
  }, [isGoogleMapsLoaded, hospitals]);

  // Update cleanup effect to handle all map elements
  useEffect(() => {
    return () => {
      if (mapElements?.directionsPolyline) {
        mapElements.directionsPolyline.setMap(null);
      }
      if (mapElements?.userMarker) {
        mapElements.userMarker.setMap(null);
      }
      if (mapElements?.selectedMarker) {
        mapElements.selectedMarker.setMap(null);
      }
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [mapElements, directionsRenderer]);

  useEffect(() => {
    if (selectedHospital) {
      handleHospitalClick(selectedHospital, false);
    }
  }, [selectedHospital]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Reset Button - Show only in search mode */}
      {/* {isSearchMode && (
        <button
          onClick={resetMapView}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <FaLocationArrow className="text-blue-500" />
          <span>Show All Hospitals</span>
        </button>
      )} */}

      {/* Loading and Error States */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Initializing map services...</p>
          </div>
        </div>
      )}

      {/* Initialization Status */}
      {!isLoading && (!isMapReady || !isServicesReady || !userLocation) && (
        <div className="absolute top-4 left-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg z-50">
          <p className="font-bold">Initializing Map Services</p>
          <p>Please wait while we set up the map...</p>
          <ul className="mt-2 space-y-1">
            <li>• Map: {isMapReady ? "✓" : "..."}</li>
            <li>• Services: {isServicesReady ? "✓" : "..."}</li>
            <li>• Location: {userLocation ? "✓" : "..."}</li>
          </ul>
        </div>
      )}

      {/* Location Error Toast */}
      {locationError && !locationPermissionDenied && (
        <div className="absolute top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50">
          <p className="font-bold">Location Error</p>
          <p>{locationError}</p>
          <button
            onClick={() => {
              setLocationRetryCount(0);
              setLocationError(null);
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    });
                  },
                  (error) => {
                    console.error("Error retrying location:", error);
                    setLocationError(
                      "Failed to get location. Using default location."
                    );
                    setUserLocation(LAGOS_COORDINATES);
                  }
                );
              }
            }}
            className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Retry Location
          </button>
        </div>
      )}

      {/* Location Permission Denied Message */}
      {locationPermissionDenied && (
        <div className="absolute top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50">
          <p className="font-bold">Location Access Denied</p>
          <p>
            Please enable location services in your browser settings to get
            accurate directions.
          </p>
          <button
            onClick={() => {
              setLocationPermissionDenied(false);
              setLocationError(null);
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    });
                  },
                  (error) => {
                    console.error("Error retrying location:", error);
                    setLocationError(
                      "Failed to get location. Using default location."
                    );
                    setUserLocation(LAGOS_COORDINATES);
                  }
                );
              }
            }}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
