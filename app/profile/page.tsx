"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/useAuth";

interface ScheduleItem {
  day: string;
  start: string;
  end: string;
}

interface ProfileResponse {
  jobTitle?: string;
  department?: string;
  schedule: ScheduleItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.get<ProfileResponse>("/profile")
  });

  return (
    <RoleGuard roles={["EMPLOYEE", "MANAGER", "ADMIN"]} onRequireLogin={() => router.push("/login")}> 
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Review your basic information and working schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/40 p-4">
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {user?.roles.map((role) => (
                  <Badge key={role} variant={role === "ADMIN" ? "destructive" : role === "MANAGER" ? "warning" : "secondary"}>
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <h3 className="mb-3 text-base font-semibold">Work schedule</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.schedule.map((item) => (
                    <TableRow key={item.day}>
                      <TableCell>{item.day}</TableCell>
                      <TableCell>{item.start}</TableCell>
                      <TableCell>{item.end}</TableCell>
                    </TableRow>
                  ))}
                  {(!data || data.schedule.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                        Schedule not configured.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
