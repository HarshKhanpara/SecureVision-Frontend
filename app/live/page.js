"use client";

import React from "react";
import { useEmailStore } from "@/store/emailStore";
import { useVideoStore } from "@/store/videoStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useIpStore } from "@/store/ipStore";
import { useCctvNameStore } from "@/store/cctvNameStore";
import { useState } from "react";

export default function CameraStream() {
  const email = useEmailStore((state) => state.email);
  const setEmail = useEmailStore((state) => state.setEmail);


  const cctvNames = useCctvNameStore((state) => state.cctvNames);
  const addCctvName = useCctvNameStore((state) => state.addCctvName);
  const removeCctvName = useCctvNameStore((state) => state.removeCctvName);
  const clearCctvNames = useCctvNameStore((state) => state.clearCctvNames);
  const ips = useIpStore((state) => state.ips);
  const setIps = useIpStore((state) => state.setIps);
  const addIp = useIpStore((state) => state.addIp);
  const removeIp = useIpStore((state) => state.removeIp);
  const [ipInput, setIpInput] = useState("");
  const [cctvInput, setCctvInput] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || ips.length === 0 || cctvNames.length === 0) {
      alert("Email, IPs, and CCTV names are required");
      return;
    }

    if (ips.length !== cctvNames.length) {
      alert("Mismatch between number of IPs and CCTV names");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);

    for (let i = 0; i < ips.length; i++) {
      formData.append("ip_urls", ips[i]);
      formData.append("cctv_names", cctvNames[i]);
    }
    console.log("IP URLs:", ips);
    console.log("CCTV Names:", cctvNames);
    // for(let i = 0; i < cctvNames.length; i++) {
    //   console.log("cctv_name[]", cctvNames[i]);
    // }
    // for(let i = 0; i < ips.length; i++) {
    //   console.log("ip_url[]", ips[i]);
    // }
    try {
      const response = await axios.post(
        "http://localhost:8000/get-live-logs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Success:", response.data);
      // clearIps();
      // clearCctvNames();
      router.push("/live-dashboard");
    } catch (err) {
      console.error("Failed:", err);
      alert("Upload failed");
    }
  };

  const handleAdd = () => {
    if (!ipInput || !cctvInput) return alert("Both IP and CCTV Name are required");
    addIp(ipInput);
    addCctvName(cctvInput);
    setIpInput("");
    setCctvInput("");
  };

  const handleRemove = (index) => {
    removeIp(ips[index]);
    removeCctvName(cctvNames[index]);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">IP Address</label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="192.168.0.1:5000"
              className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CCTV Name</label>
            <input
              type="text"
              value={cctvInput}
              onChange={(e) => setCctvInput(e.target.value)}
              placeholder="Main Gate"
              className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl"
        >
          + Add to List
        </button>

        <div className="space-y-2">
          {ips.map((ip, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center px-4 py-2 bg-gray-700 rounded-xl"
            >
              <span>
                {cctvNames[idx]} — {ip}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
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
