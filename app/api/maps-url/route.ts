import { NextResponse } from "next/server"

export async function GET() {
  // Get the API key from environment variables (server-side only)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  // Create the Google Maps URL with the API key
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`

  // Return the URL to the client
  return NextResponse.json({ url })
}
