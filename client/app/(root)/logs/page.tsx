"use client";

import React, { useState, useEffect } from "react";
import MobileHeader from "@/components/layout_components/MobileHeader";
import { format } from "date-fns";

interface CommandLog {
  _id: string;
  logId: string;
  command: string;
  input: string;
  output: string;
  whatsappNumber: string;
  executedAt: string;
  aiUsed: boolean;
  tokensUsed?: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:8080";

export default function LogsPage() {
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commandFilter, setCommandFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [commandFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        commandFilter !== "all"
          ? `${BACKEND_URL}/api/logs?command=${commandFilter}`
          : `${BACKEND_URL}/api/logs?limit=100`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.output.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.command.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCommandColor = (command: string) => {
    switch (command) {
      case "bakesheet":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "waste":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "expiry":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "order":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="p-3 md:p-5 md:px-4">
      <MobileHeader title="Command Logs" />
      
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 md:p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Filter by Command</label>
              <select
                value={commandFilter}
                onChange={(e) => setCommandFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Commands</option>
                <option value="bakesheet">Bake Sheet</option>
                <option value="waste">Waste</option>
                <option value="expiry">Expiry</option>
                <option value="order">Order</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Search</label>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-8 dark:text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
        ) : filteredLogs.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {filteredLogs.map((log) => (
              <div key={log._id} className="bg-white dark:bg-gray-900 rounded-lg p-3 md:p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 md:mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getCommandColor(
                        log.command
                      )}`}
                    >
                      {log.command}
                    </span>
                    {log.aiUsed && (
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        AI Used
                      </span>
                    )}
                    {log.tokensUsed && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                        {log.tokensUsed} tokens
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {format(new Date(log.executedAt), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Input:</p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">{log.input || "(empty)"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Output:</p>
                    <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded whitespace-pre-wrap text-gray-900 dark:text-white border border-blue-200 dark:border-blue-800">
                      {log.output}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  From: {log.whatsappNumber}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "No logs found matching your search"
              : "No command logs found"}
          </div>
        )}
      </div>
    </div>
  );
}
