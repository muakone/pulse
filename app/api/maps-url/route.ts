import { NextResponse } from "next/server";

export async function GET() {
  // Get the API key from environment variables (server-side only)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Log the first few characters of the API key for debugging (safely)
  console.log("API Key available:", !!apiKey);
  console.log("API Key length:", apiKey?.length);

  if (!apiKey) {
    console.error("Google Maps API key is not set in environment variables");
    return NextResponse.json(
      { error: "Google Maps API key is not configured" },
      { status: 500 }
    );
  }

  // Create the Google Maps URL with the API key
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;

  // Return the URL to the client
  return NextResponse.json({ url });
}
