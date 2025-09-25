"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api";
import { TimeEntry } from "@/hooks/useTimeClock";
import { TimeClockCard } from "@/components/time-clock-card";
import { TimesheetTable } from "@/components/timesheet-table";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { minutesToHHMM } from "@/utils/time";

export default function ClockPage() {
  const router = useRouter();
  const todayQuery = useQuery({
    queryKey: ["timesheet", "today"],
    queryFn: () => apiClient.get<TimeEntry[]>("/timesheet/today")
  });

  const totals = useMemo(() => {
    const entries = todayQuery.data ?? [];
    const normal = entries.filter((entry) => entry.type === "NORMAL").reduce((acc, entry) => acc + entry.minutes, 0);
    const overtime = entries.filter((entry) => entry.type === "OVERTIME").reduce((acc, entry) => acc + entry.minutes, 0);
    return {
      normal: minutesToHHMM(normal),
      overtime: minutesToHHMM(overtime)
    };
  }, [todayQuery.data]);

  return (
    <RoleGuard roles={["EMPLOYEE", "MANAGER", "ADMIN"]} onRequireLogin={() => router.push("/login")}> 
      <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
        <TimeClockCard />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
                <span className="font-medium text-muted-foreground">Normal</span>
                <span className="font-semibold text-emerald-600">{totals.normal}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
                <span className="font-medium text-muted-foreground">Overtime</span>
                <span className="font-semibold text-amber-600">{totals.overtime}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Today&apos;s entries</CardTitle>
            </CardHeader>
            <CardContent>
              <TimesheetTable entries={todayQuery.data ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
