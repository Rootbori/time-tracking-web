"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api";
import { TimeEntry } from "@/hooks/useTimeClock";
import { TimesheetTable } from "@/components/timesheet-table";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface DailyTimesheet {
  date: string;
  entries: TimeEntry[];
}

export default function TimesheetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["timesheet", "list"],
    queryFn: () => apiClient.get<DailyTimesheet[]>("/timesheet")
  });

  const requestEdit = useMutation({
    mutationFn: (payload: { entryId: string }) => apiClient.post(`/timesheet/${payload.entryId}/edit-request`, {}),
    onSuccess: () => {
      toast.success("Edit request submitted");
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    }
  });

  return (
    <RoleGuard roles={["EMPLOYEE", "MANAGER", "ADMIN"]} onRequireLogin={() => router.push("/login")}> 
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Timesheet</CardTitle>
            <CardDescription>Review and manage your logged hours. Submit edit requests when needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading && <p className="text-sm text-muted-foreground">Loading timesheet…</p>}
            {!isLoading &&
              data.map((day) => (
                <div key={day.date} className="space-y-3">
                  <h3 className="text-lg font-semibold">{new Date(day.date).toLocaleDateString()}</h3>
                  <TimesheetTable
                    entries={day.entries}
                    onRequestEdit={(entry) => {
                      requestEdit.mutate({ entryId: entry.id });
                    }}
                  />
                </div>
              ))}
            {!isLoading && data.length === 0 && <p className="text-sm text-muted-foreground">No entries yet.</p>}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
