"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyHoursChart, WeeklyHoursDataPoint } from "@/components/weekly-hours-chart";
import { minutesToHHMM } from "@/utils/time";

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totals: {
    regularMinutes: number;
    overtimeMinutes: number;
  };
  chart: WeeklyHoursDataPoint[];
}

export default function MyWeekReportPage() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["reports", "my-week"],
    queryFn: () => apiClient.get<WeeklySummary>("/reports/my-week")
  });

  const regular = data?.totals.regularMinutes ?? 0;
  const overtime = data?.totals.overtimeMinutes ?? 0;

  return (
    <RoleGuard roles={["EMPLOYEE", "MANAGER", "ADMIN"]} onRequireLogin={() => router.push("/login")}> 
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>My week</CardTitle>
            <CardDescription>
              {data
                ? `Week of ${new Date(data.weekStart).toLocaleDateString()} – ${new Date(data.weekEnd).toLocaleDateString()}`
                : "Loading weekly summary"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Normal hours</p>
                <p className="text-3xl font-semibold text-emerald-600">{minutesToHHMM(regular)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Overtime hours</p>
                <p className="text-3xl font-semibold text-amber-600">{minutesToHHMM(overtime)}</p>
              </div>
            </div>
            <WeeklyHoursChart data={data?.chart ?? []} />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
