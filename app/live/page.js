"use client";

import React from "react";
import { useEmailStore } from "@/store/emailStore";
import { useVideoStore } from "@/store/videoStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useIpStore } from "@/store/ipStore";
import { useCctvNameStore } from "@/store/cctvNameStore";

export default function CameraStream() {
  const email = useEmailStore((state) => state.email);
  const setEmail = useEmailStore((state) => state.setEmail);

  const ip = useIpStore(state => state.ip);
  const setIp = useIpStore(state => state.setIp);

  const cctvName = useCctvNameStore(state => state.cctvName);
  const setCctvName = useCctvNameStore(state => state.setcctvName);
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !ip || !cctvName) {
      alert("Please provide an email and ip url and CCTV name");
      console.log("Submission blocked: Missing email or ip url or CCTV name");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("cctv_name", cctvName);
    formData.append('ip_url', ip);

    try {
      console.log("Uploading data:", { email, ip,cctvName });

      const response = await axios.post(
        "https://icy-poets-take.loca.lt//get-live-logs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload successful:", response.data);
      router.push("/live-dashboard"); // Navigate to dashboard
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/40 backdrop-blur-lg border border-gray-800/50 rounded-3xl shadow-2xl p-10 w-full max-w-2xl space-y-8 text-white"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text text-center">
          Upload Videos
        </h2>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-300 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="block w-full px-4 py-2 bg-gray-800/60 text-white border border-gray-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          />
        </div>

        <div>
          <label
            htmlFor="ip_url"
            className="block text-sm font-semibold text-gray-300 mb-1"
          >
            IP of Camera
          </label>
          <input
            type="text"
            id="ip_url"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.0.100:5000"
            required
            className="block w-full px-4 py-2 bg-gray-800/60 text-white border border-gray-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          />
        </div>


        <div>
          <label
            htmlFor="cctv_name"
            className="block text-sm font-semibold text-gray-300 mb-1"
          >
            Name of CCTV
          </label>
          <input
            type="text"
            id="cctv_name"
            value={cctvName}
            onChange={(e) => setCctvName(e.target.value)}
            placeholder="CCTV1"
            required
            className="block w-full px-4 py-2 bg-gray-800/60 text-white border border-gray-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          />
        </div>


        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
