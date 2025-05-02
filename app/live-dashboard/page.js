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
import { useIpStore } from "@/store/ipStore";
import { useCctvNameStore } from "@/store/cctvNameStore";

const Dashboard = () => {
  const router = useRouter();
  const email = useEmailStore((state) => state.email);
  const [alertLogs, setAlertLogs] = useState([]);
  const [filters, setFilters] = useState({
    timestampFrom: "",
    timestampTo: "",
    zone: "",
    violenceType: "",
    severity: "all", // info, warning, alert
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const cctvNames = useCctvNameStore((state) => state.cctvNames);
  const [newCctvNames, setNewCctvNames] = useState([...cctvNames]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [logLimit, setLogLimit] = useState(100);
  const [notificationLimit, setNotificationLimit] = useState(5);
  const [downloadLimit, setDownloadLimit] = useState(50);

  const handleUserProfile = () => {
    setNewEmail(email);
    setNewCctvNames([...cctvNames]);
    setIsProfileModalOpen(true);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const ips = useIpStore((state) => state.ips);
  // const ips = ["http://192.168.1.48:8080/video"];
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
    const ws = new WebSocket("ws://localhost:8000/ws/logs");
    console.log("Ips recieived", ips);
    console.log("CCTV Names", cctvNames);
    ws.onmessage = (event) => {
      console.log("IPs", ips);
      console.log("event", event);
      const rawText = event.data;
      const log = parseRawLog(rawText, email);
      if (log) {
        setLogs((prevLogs) => {
          const updatedLogs = [log, ...prevLogs];
          console.log("Updated logs:", updatedLogs); // Add this
          if (log.type === "alert") {
            setAlertLogs((prevAlerts) => [log, ...prevAlerts]);
          }
          return updatedLogs;
        });
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
    if (
      email.trim().length === 0 &&
      ips.length === 0 &&
      cctvNames.length === 0
    ) {
      router.push("/live");
    }
    console.log(email);
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
    const sanitizedLogs = logs.slice(0, downloadLimit).map((log) => {
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
    setIsFilterOpen((prev) => !prev);
  };

  // Handle settings
  const handleSettings = () => {
    setIsSettingsModalOpen(true);
  };

  // Handle notifications
  const handleNotifications = () => {
    if (alertLogs.length === 0) {
      alert("No alerts at the moment.");
    } else {
      const messages = alertLogs
      .slice(0, notificationLimit)
      .map((log) => `${log.timestamp} - ${log.user}: ${log.message}`)
        .join("\n\n");
      alert(`Recent Alerts:\n\n${messages}`);
    }
  };

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    return (
      new Date(`2025/03/22 ${b.timestamp}`) -
      new Date(`2025/03/22 ${a.timestamp}`)
    );
  });

  const filteredLogs = sortedLogs.filter((log) => {
    const logTime = new Date(`2025/03/22 ${log.timestamp}`);

    const fromTime = filters.timestampFrom
      ? new Date(`2025/03/22 ${filters.timestampFrom}`)
      : null;
    const toTime = filters.timestampTo
      ? new Date(`2025/03/22 ${filters.timestampTo}`)
      : null;

    const matchesTime =
      (!fromTime || logTime >= fromTime) && (!toTime || logTime <= toTime);

    const matchesZone =
      !filters.zone ||
      log.message.toLowerCase().includes(filters.zone.toLowerCase());

    const matchesViolence =
      !filters.violenceType ||
      log.message.toLowerCase().includes(filters.violenceType.toLowerCase());

    const matchesSeverity =
      filters.severity === "all" || log.type === filters.severity;

    const matchesSearch =
      searchQuery.trim() === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesTime &&
      matchesZone &&
      matchesViolence &&
      matchesSeverity &&
      matchesSearch
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
                {alertLogs.length}
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

              <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 shadow-2xl h-full flex flex-col items-center justify-center p-6 space-y-4 bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-100">
                  Video Preview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ips.map((ip, index) => (
                    <div
                      key={ip}
                      className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-md flex flex-col items-center"
                    >
                      {console.log("ip", ip)}
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">
                        {cctvNames[index] || `CCTV ${index + 1}`}
                      </h3>

                      <img
                        src={ip}
                        alt="Live CCTV Feed"
                        className="rounded-xl border border-gray-700"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "600px",
                          aspectRatio: "16/9",
                          objectFit: "contain",
                        }}
                      />

                      <p className="text-sm text-gray-400 mt-2 break-all">
                        {ip}
                      </p>
                    </div>
                  ))}
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
                  <button
                    className="p-2 bg-gray-800/90 rounded-xl hover:bg-green-600/80 transition-colors duration-200 border border-gray-700/50"
                    onClick={handleShare}
                    title="Download Logs"
                  >
                    <FiDownload className="text-gray-300 hover:text-white" />
                  </button>
                </div>
              </div>

              {isFilterOpen && (
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 mb-4 transition-all duration-300 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-200">
                    <div>
                      <label className="block mb-1">From Time:</label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM"
                        value={filters.timestampFrom}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            timestampFrom: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">To Time:</label>
                      <input
                        type="text"
                        placeholder="e.g. 12:00 PM"
                        value={filters.timestampTo}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            timestampTo: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Zone:</label>
                      <input
                        type="text"
                        placeholder="e.g. Lobby"
                        value={filters.zone}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            zone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Violence Type:</label>
                      <input
                        type="text"
                        placeholder="e.g. Punch"
                        value={filters.violenceType}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            violenceType: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Severity:</label>
                      <select
                        value={filters.severity}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            severity: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                      >
                        <option value="all">All</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="alert">Alert</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() =>
                        setFilters({
                          timestampFrom: "",
                          timestampTo: "",
                          zone: "",
                          violenceType: "",
                          severity: "all",
                        })
                      }
                      className="px-4 py-2 bg-gray-700 text-sm rounded-md text-white hover:bg-gray-600 transition"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 bg-blue-600 text-sm rounded-md text-white hover:bg-blue-700 transition"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 overflow-y-auto h-[440px] pr-2 custom-scrollbar">
                {filteredLogs.slice(0, logLimit).map((log, index) => (
                  <div key={index} className="relative pl-8 pb-6 group">
                    {/* Timeline line */}
                    {index !== filteredLogs.length - 1 && (
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

        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Update Profile
              </h2>

              {/* Email Input */}
              <div>
                <label className="text-sm text-gray-400">Email:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              {/* CCTV Name Inputs */}
              <div>
                <label className="text-sm text-gray-400">CCTV Names:</label>
                <div className="space-y-2 mt-1">
                  {newCctvNames.map((name, index) => (
                    <input
                      key={index}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const updated = [...newCctvNames];
                        updated[index] = e.target.value;
                        setNewCctvNames(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                    />
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    useEmailStore.getState().setEmail(newEmail);
                    useCctvNameStore.getState().setCctvNames(newCctvNames);
                    setIsProfileModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h2 className="text-xl font-semibold text-white">Settings</h2>

              <div>
                <label className="text-sm text-gray-400">
                  Max Logs to Display:
                </label>
                <input
                  type="number"
                  value={logLimit}
                  onChange={(e) => setLogLimit(Number(e.target.value))}
                  min={10}
                  className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">
                  Max Alerts in Notifications:
                </label>
                <input
                  type="number"
                  value={notificationLimit}
                  onChange={(e) => setNotificationLimit(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">
                  Max Logs to Download:
                </label>
                <input
                  type="number"
                  value={downloadLimit}
                  onChange={(e) => setDownloadLimit(Number(e.target.value))}
                  min={10}
                  className="w-full px-3 py-2 mt-1 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
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