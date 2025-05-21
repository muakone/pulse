"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaEnvelope } from "react-icons/fa"
import { ClipLoader } from "react-spinners"
import toast from "react-hot-toast"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("OTP sent to your email!")
      router.push("/select-user-type")
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        disabled={loading}
      >
        {loading ? <ClipLoader color="#ffffff" size={20} /> : "Continue with Email"}
      </button>
    </form>
  )
}
