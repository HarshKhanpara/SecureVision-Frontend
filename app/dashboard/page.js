"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiVideo,
  FiSettings,
  FiMenu,
  FiSearch,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiMaximize,
  FiDownload,
  FiShare2,
  FiMap,
  FiPieChart,
  FiShield,
  FiBell,
} from "react-icons/fi";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";
import { useEmailStore } from "@/store/emailStore";
import { useVideoStore } from "@/store/videoStore";

const Dashboard = () => {
  const router = useRouter();
  const email = useEmailStore((state) => state.email);
  const videos = useVideoStore((state) => state.videos);
  const [videoUrls, setVideoUrls] = useState([]);

  useEffect(() => {
    const urls = videos
      .map((file) => {
        if (file instanceof File || file instanceof Blob) {
          return { name: file.name, url: URL.createObjectURL(file) };
        }
        return null;
      })
      .filter(Boolean);

    setVideoUrls(urls);

    // Clean up when files change or component unmounts
    return () => {
      urls.forEach((video) => URL.revokeObjectURL(video.url));
    };
  }, [videos]);

  const [logs, setLogs] = useState([
    {
      timestamp: "10:15 AM",
      type: "info",
      message: "Welcome User. Your live feed is ready. It will be shown here.",
      icon: <FiUser className="text-blue-400" />,
      user: "Admin",
    },
  ]);

  useEffect(() => {
    const ws = new WebSocket("ws://great-papayas-march.loca.lt/ws/logs");

    ws.onmessage = (event) => {
      console.log("event", event);
      const rawText = event.data;
      console.log("Received raw log:", rawText);
      const log = parseRawLog(rawText, email);
      if (log) {
        setLogs((prevLogs) => [log, ...prevLogs]);
      }
    };

    return () => ws.close();
  }, []);

  const parseRawLog = (text, currentUserEmail) => {
    const match = text.match(
      /\[(.*?)\]\s*Email:\s*(.*?)\s*\|\s*CCTV:\s*(.*?)\s*\|\s*Violence:\s*(.*?)\s*\((.*?)\)\s*\|\s*Severity:\s*(.*?)\s*\((.*?)\)/
    );

    if (!match) return null;

    const [
      ,
      rawTimestamp,
      logEmail,
      location,
      label,
      confidence,
      severityScore,
      severityLevel,
    ] = match;

    // Only process logs for the current user email
    if (logEmail.trim().toLowerCase() !== currentUserEmail.trim().toLowerCase())
      return null;

    const type = severityLevel.toLowerCase().includes("high")
      ? "alert"
      : severityLevel.toLowerCase().includes("medium")
      ? "warning"
      : "info";

    const iconMap = {
      alert: <FiAlertCircle className="text-red-600" />,
      warning: <FiAlertTriangle className="text-yellow-400" />,
      info: <FiCheckCircle className="text-green-400" />,
    };

    const timestamp = new Date(rawTimestamp).toLocaleTimeString();

    return {
      timestamp,
      type,
      message: `Zone: ${location} | Violence: ${label} (${confidence}) | Severity: ${severityScore} (${severityLevel})`,
      icon: iconMap[type],
      user: logEmail,
    };
  };

  const [videoSrc] = useState("https://your-cctv-stream-url"); // Replace with live CCTV feed
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [currentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );
  const [activeTab, setActiveTab] = useState("live");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Update the time every second
  useEffect(() => {
    if (!email || !videos) router.push("/demo");
    console.log(email);
    console.log(videos);
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle full-screen toggle
  const toggleFullScreen = () => {
    const videoElement = document.querySelector("video");
    if (!isFullScreen) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if (videoElement.mozRequestFullScreen) {
        // Firefox
        videoElement.mozRequestFullScreen();
      } else if (videoElement.webkitRequestFullscreen) {
        // Chrome, Safari, and Opera
        videoElement.webkitRequestFullscreen();
      } else if (videoElement.msRequestFullscreen) {
        // IE/Edge
        videoElement.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        // Chrome, Safari, and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  // Handle video download
  const handleDownload = () => {
    // const link = document.createElement("a");
    // link.href = videoSrc;
    // link.download = "cctv_feed.mp4";
    // link.click();
  };

  const handleShare = () => {
    const format = "pdf"; // You can add more formats here
    // Create a sanitized version of logs without non-serializable data
    const sanitizedLogs = logs.map((log) => {
      const { icon, ...rest } = log; // Remove the icon property
      return rest;
    });

    // Convert sanitized logs to a JSON string
    const logsData = JSON.stringify(sanitizedLogs, null, 2); // Pretty-print JSON with 2 spaces indentation

    if (format === "text") {
      // Create a Blob with the logs data for text file
      const blob = new Blob([logsData], { type: "text/plain" });

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "logs.txt"; // File name for download

      // Trigger the download
      link.click();

      // Clean up the URL object
      URL.revokeObjectURL(link.href);
    } else if (format === "pdf") {
      // Create a new PDF document
      const doc = new jsPDF();

      // Add content to the PDF
      doc.setFontSize(12);
      sanitizedLogs.forEach((log, index) => {
        const yOffset = 10 + index * 10; // Adjust spacing between lines
        doc.text(
          `${log.timestamp} - ${log.type}: ${log.message} (${log.user})`,
          10,
          yOffset
        );
      });

      // Save the PDF
      doc.save("logs.pdf");
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    // Simulate refreshing logs
    setLogs((prevLogs) => [...prevLogs]);
  };

  // Handle filter
  const handleFilter = () => {
    // Simulate filtering logs
    alert("Filter functionality to be implemented.");
  };

  // Handle settings
  const handleSettings = () => {
    alert("Settings functionality to be implemented.");
  };

  // Handle notifications
  const handleNotifications = () => {
    alert("Notifications functionality to be implemented.");
  };

  // Handle user profile
  const handleUserProfile = () => {
    alert("User profile functionality to be implemented.");
  };

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    return (
      new Date(`2025/03/22 ${b.timestamp}`) -
      new Date(`2025/03/22 ${a.timestamp}`)
    );
  });

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 text-white min-h-screen font-sans">
      {/* Side Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-20 bg-gray-950 border-r border-gray-800/50 flex flex-col items-center py-8 z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-900/20">
          <FiShield className="text-xl" />
        </div>
        <div className="flex flex-col items-center space-y-6 flex-1">
          <button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group
              ${
                activeTab === "live"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/80"
              }`}
            onClick={() => handleTabChange("live")}
          >
            <FiVideo
              className={`${
                activeTab !== "live" && "group-hover:text-blue-400"
              } transition-colors duration-200`}
            />
          </button>
          <button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group
              ${
                activeTab === "alerts"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/80"
              }`}
            onClick={() => handleTabChange("alerts")}
          >
            <FiBell
              className={`${
                activeTab !== "alerts" && "group-hover:text-blue-400"
              } transition-colors duration-200`}
            />
          </button>
          <button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group
              ${
                activeTab === "stats"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/80"
              }`}
            onClick={() => handleTabChange("stats")}
          >
            <FiPieChart
              className={`${
                activeTab !== "stats" && "group-hover:text-blue-400"
              } transition-colors duration-200`}
            />
          </button>
          <button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group
              ${
                activeTab === "map"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-gray-900/50 text-gray-400 hover:bg-gray-800/80"
              }`}
            onClick={() => handleTabChange("map")}
          >
            <FiMap
              className={`${
                activeTab !== "map" && "group-hover:text-blue-400"
              } transition-colors duration-200`}
            />
          </button>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-900/50 text-gray-500 hover:bg-gray-800/80 hover:text-gray-300 transition-all duration-300 mb-6">
          <FiSettings onClick={handleSettings} />
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <FiUser onClick={handleUserProfile} />
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-20 p-0">
        {/* Top Navigation Bar */}
        <nav className="bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
          <div className="flex items-center">
            <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
              SECUREVISION
            </h1>
            <div className="ml-8 flex space-x-1">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/20">
                PRODUCTION
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400 border border-green-600/20">
                ONLINE
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-gray-900/60 px-4 py-2 rounded-xl border border-gray-800/50 shadow-sm">
              <FiCalendar className="text-blue-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">
                {currentDate}
              </span>
            </div>
            <div className="flex items-center bg-gray-900/60 px-4 py-2 rounded-xl border border-gray-800/50 shadow-sm">
              <FiClock className="text-blue-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">
                {currentTime}
              </span>
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="bg-gray-900/60 border border-gray-800/50 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-56 shadow-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <button
                className="w-10 h-10 rounded-xl bg-gray-900/60 border border-gray-800/50 flex items-center justify-center text-blue-400 hover:text-blue-300 shadow-sm"
                onClick={handleNotifications}
              >
                <FiBell />
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <FiUser onClick={handleUserProfile} />
            </div>
          </div>
        </nav>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-4rem)]">
          {/* Main Video Feed */}
          <div className="lg:col-span-8">
            <div className="bg-gray-900/40 rounded-3xl p-6 shadow-xl backdrop-blur-sm border border-gray-800/30 h-full overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center text-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mr-3">
                    <FiVideo className="text-blue-400" />
                  </div>
                  Live Feed
                </h2>
                <div className="flex space-x-3">
                  <span className="bg-gradient-to-r from-red-600/90 to-red-500/90 text-white px-4 py-1.5 rounded-full text-sm shadow-lg flex items-center font-medium">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                    LIVE
                  </span>
                  <span className="bg-gray-800/80 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700/50">
                    All Zones
                  </span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 shadow-2xl h-full">
                {videos.length > 0 && (
                  <div className="p-6 space-y-6 ">
                    <div className="space-y-1 ">
                      <h3 className="text-lg font-semibold text-gray-100">
                        Video Preview
                      </h3>
                      <p className="text-sm text-gray-400">
                        {videos.length} generated video
                        {videos.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {videoUrls.map(({ name, url }, idx) => (
                        <div
                          key={name + idx}
                          className="group relative overflow-hidden rounded-xl bg-gray-800/50 transition-all hover:bg-gray-800/70"
                        >
                          <video
                            src={url}
                            muted
                            autoPlay
                            loop
                            playsInline
                            controls={false}
                            className="w-full h-48 sm:h-56 object-cover rounded-t-xl border-t border-x border-gray-700/50 group-hover:border-gray-600/50 transition-colors"
                            onContextMenu={(e) => e.preventDefault()}
                          />
                          <div className="p-3 border-b border-x border-gray-700/50 rounded-b-xl">
                            <p className="text-sm font-medium text-gray-200 truncate">
                              {name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              MP4 • {idx + 1}/{videoUrls.length}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Camera controls overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-4">
                    <button
                      className="w-12 h-12 rounded-full bg-gray-900/80 hover:bg-blue-600/90 flex items-center justify-center transition-all duration-200 border border-gray-700/50 shadow-lg"
                      onClick={toggleFullScreen}
                    >
                      <FiMaximize className="text-white text-lg" />
                    </button>
                    <button
                      className="w-12 h-12 rounded-full bg-gray-900/80 hover:bg-blue-600/90 flex items-center justify-center transition-all duration-200 border border-gray-700/50 shadow-lg"
                      onClick={handleDownload}
                    >
                      <FiDownload className="text-white text-lg" />
                    </button>
                    <button
                      className="w-12 h-12 rounded-full bg-gray-900/80 hover:bg-blue-600/90 flex items-center justify-center transition-all duration-200 border border-gray-700/50 shadow-lg"
                      onClick={handleShare}
                    >
                      <FiShare2 className="text-white text-lg" />
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 m-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        CAMERA FEEDS
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {email.split("@")[0]} {currentTime}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        className="bg-gray-800/80 hover:bg-blue-600/80 p-2.5 rounded-xl transition-colors duration-200 border border-gray-700/50"
                        onClick={handleSearch}
                      >
                        <FiSearch className="text-white" />
                      </button>
                      <button
                        className="bg-gray-800/80 hover:bg-blue-600/80 p-2.5 rounded-xl transition-colors duration-200 border border-gray-700/50"
                        onClick={handleRefresh}
                      >
                        <FiRefreshCw className="text-white" />
                      </button>
                      <button
                        className="bg-gray-800/80 hover:bg-blue-600/80 p-2.5 rounded-xl transition-colors duration-200 border border-gray-700/50"
                        onClick={handleSettings}
                      >
                        <FiSettings className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Logs */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900/40 rounded-3xl p-6 shadow-xl backdrop-blur-sm border border-gray-800/30 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center text-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mr-3">
                    <FiAlertCircle className="text-blue-400" />
                  </div>
                  Event Timeline
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-800/90 text-xs px-3 py-1.5 rounded-full font-medium border border-gray-700/50 text-gray-300">
                    {logs.length} events
                  </span>
                  <button
                    className="p-2 bg-gray-800/90 rounded-xl hover:bg-blue-600/80 transition-colors duration-200 border border-gray-700/50"
                    onClick={handleFilter}
                  >
                    <FiFilter className="text-gray-300 hover:text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto h-[440px] pr-2 custom-scrollbar">
                {sortedLogs.map((log, index) => (
                  <div key={index} className="relative pl-8 pb-6 group">
                    {/* Timeline line */}
                    {index !== sortedLogs.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gradient-to-b from-gray-700/60 to-gray-800/30"></div>
                    )}

                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        log.type === "error"
                          ? "bg-red-900/30 border-red-500 text-red-400"
                          : log.type === "warning"
                          ? "bg-yellow-900/30 border-yellow-500 text-yellow-400"
                          : log.type === "alert"
                          ? "bg-red-800/30 border-red-600 text-red-400 animate-pulse"
                          : "bg-blue-900/30 border-blue-500 text-blue-400"
                      }`}
                    >
                      {log.icon}
                    </div>

                    {/* Event card */}
                    <div
                      className={`p-4 rounded-xl shadow-lg transition-all duration-300 group-hover:translate-x-1 
                        ${
                          log.type === "error"
                            ? "bg-gradient-to-r from-red-900/20 to-red-900/5 border border-red-900/30"
                            : log.type === "warning"
                            ? "bg-gradient-to-r from-yellow-900/20 to-yellow-900/5 border border-yellow-900/30"
                            : log.type === "alert"
                            ? "bg-gradient-to-r from-red-900/20 to-red-800/5 border border-red-900/30"
                            : "bg-gradient-to-r from-blue-900/20 to-blue-900/5 border border-blue-900/30"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-bold ${
                              log.type === "error"
                                ? "text-red-400"
                                : log.type === "warning"
                                ? "text-yellow-400"
                                : log.type === "alert"
                                ? "text-red-400"
                                : "text-blue-400"
                            }`}
                          >
                            {log.user}
                          </p>
                        </div>
                        <p className="text-xs bg-gray-800/80 px-2.5 py-1 rounded-full text-gray-400 font-medium border border-gray-700/30">
                          {log.timestamp}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-300">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
