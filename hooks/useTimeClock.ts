"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";

export interface TimeEntry {
  id: string;
  start: string;
  end?: string | null;
  minutes: number;
  type: "NORMAL" | "OVERTIME";
  note?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface TimeClockStatus {
  activeSession: TimeEntry | null;
  todaysTotalMinutes: number;
}

export interface StartClockInput {
  note?: string;
}

export function useTimeClock() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["time-clock", "status"],
    queryFn: () => apiClient.get<TimeClockStatus>("/clock/status")
  });

  const startMutation = useMutation({
    mutationFn: (input: StartClockInput) => apiClient.post<TimeEntry>("/clock/start", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-clock"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => apiClient.post<TimeEntry>("/clock/stop"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-clock"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    }
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    startClock: startMutation.mutateAsync,
    stopClock: stopMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending
  };
}
