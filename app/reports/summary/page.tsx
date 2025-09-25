"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { apiClient } from "@/services/api";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker, DateRangeValue } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { minutesToHHMM } from "@/utils/time";
import { toast } from "sonner";

interface SummaryRow {
  employeeId: string;
  employeeName: string;
  regularMinutes: number;
  overtimeMinutes: number;
  approvalsPending: number;
}

interface SummaryResponse {
  rows: SummaryRow[];
  totals: {
    regularMinutes: number;
    overtimeMinutes: number;
  };
}

function buildQuery(range: DateRangeValue) {
  const params = new URLSearchParams();
  if (range.from) params.set("from", formatISO(range.from, { representation: "date" }));
  if (range.to) params.set("to", formatISO(range.to, { representation: "date" }));
  const search = params.toString();
  return search ? `?${search}` : "";
}

export default function SummaryReportPage() {
  const router = useRouter();
  const [range, setRange] = useState<DateRangeValue>({});

  const summaryQuery = useQuery({
    queryKey: ["reports", "summary", range],
    queryFn: () => apiClient.get<SummaryResponse>(`/reports/summary${buildQuery(range)}`)
  });

  const rows = summaryQuery.data?.rows ?? [];
  const totals = summaryQuery.data?.totals ?? { regularMinutes: 0, overtimeMinutes: 0 };

  const handleExport = async () => {
    try {
      const csv = await apiClient.get<string>(`/reports/summary/export${buildQuery(range)}`);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "summary-report.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Report exported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export report");
    }
  };

  const totalEmployees = rows.length;
  const totalMinutes = useMemo(() => totals.regularMinutes + totals.overtimeMinutes, [totals]);

  return (
    <RoleGuard roles={["MANAGER", "ADMIN"]} onRequireLogin={() => router.push("/login")}> 
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <Card>
          <CardHeader className="gap-4 md:flex md:items-center md:justify-between">
            <div>
              <CardTitle>Summary report</CardTitle>
              <CardDescription>Filter by date range and export detailed CSV results.</CardDescription>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <DateRangePicker value={range} onChange={setRange} />
              <Button onClick={handleExport} variant="secondary">
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="text-muted-foreground">Employees</p>
                <p className="text-2xl font-semibold">{totalEmployees}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="text-muted-foreground">Normal hours</p>
                <p className="text-2xl font-semibold text-emerald-600">{minutesToHHMM(totals.regularMinutes)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="text-muted-foreground">Overtime hours</p>
                <p className="text-2xl font-semibold text-amber-600">{minutesToHHMM(totals.overtimeMinutes)}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="text-muted-foreground">Total hours</p>
                <p className="text-2xl font-semibold">{minutesToHHMM(totalMinutes)}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Normal</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pending approvals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>{minutesToHHMM(row.regularMinutes)}</TableCell>
                    <TableCell>{minutesToHHMM(row.overtimeMinutes)}</TableCell>
                    <TableCell>{minutesToHHMM(row.regularMinutes + row.overtimeMinutes)}</TableCell>
                    <TableCell>{row.approvalsPending}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No data for the selected range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
