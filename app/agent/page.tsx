"use client"

import { useState } from "react"

interface AgentLog {
  timestamp: number
  level: "info" | "success" | "warning" | "error"
  message: string
  details?: any
}

import { useEffect } from "react";

function AgentPage() {
  const [agentStatus, setAgentStatus] = useState<"running" | "stopped" | "initializing">("running")
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [reasoningLogs, setReasoningLogs] = useState([]);

  useEffect(() => {
    // Simulate Claude call
    const fetchReasoning = async () => {
      // Call OpenRouter or Claude API
      const response = await fetch('/api/claude', { method: 'POST', body: JSON.stringify({ prompt: 'Analyze spread >1.5%' }) });
      const data = await response.json();
      setReasoningLogs((prev) => [...prev, { timestamp: Date.now(), log: data.reasoning }]);
    };
    const interval = setInterval(fetchReasoning, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div>Claude Reasoning Logs: {reasoningLogs.map(log => <p key={log.timestamp}>{log.log}</p>)}</div>
    </div>
  );
}
