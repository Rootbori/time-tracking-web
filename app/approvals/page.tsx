"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { RoleGuard } from "@/components/role-guard";
import { ApprovalsTable, ApprovalRequest } from "@/components/approvals-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ApprovalsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const approvalsQuery = useQuery({
    queryKey: ["approvals"],
    queryFn: () => apiClient.get<ApprovalRequest[]>("/approvals")
  });

  const approveMutation = useMutation({
    mutationFn: (ids: string[]) => apiClient.post("/approvals/bulk-approve", { ids }),
    onSuccess: () => {
      toast.success("Requests approved");
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (ids: string[]) => apiClient.post("/approvals/bulk-reject", { ids }),
    onSuccess: () => {
      toast.success("Requests rejected");
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    }
  });

  return (
    <RoleGuard roles={["MANAGER", "ADMIN"]} onRequireLogin={() => router.push("/login")}> 
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
            <CardDescription>Review pending timesheet adjustments and approve or reject in bulk.</CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalsTable
              requests={approvalsQuery.data ?? []}
              onApprove={(ids) => approveMutation.mutateAsync(ids)}
              onReject={(ids) => rejectMutation.mutateAsync(ids)}
            />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
