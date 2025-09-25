"use client";

import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { minutesToHHMM, formatTimeRange } from "@/utils/time";
import { Badge } from "@/components/ui/badge";

export interface ApprovalRequest {
  id: string;
  employee: {
    id: string;
    name: string;
  };
  start: string;
  end?: string | null;
  minutes: number;
  type: "NORMAL" | "OVERTIME";
  note?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ApprovalsTableProps {
  requests: ApprovalRequest[];
  onApprove: (ids: string[]) => Promise<void> | void;
  onReject: (ids: string[]) => Promise<void> | void;
}

export function ApprovalsTable({ requests, onApprove, onReject }: ApprovalsTableProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const pendingRequests = useMemo(() => requests.filter((request) => request.status === "PENDING"), [requests]);
  const isAllSelected = pendingRequests.length > 0 && selected.length === pendingRequests.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      setSelected(pendingRequests.map((request) => request.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleApprove = async () => {
    await onApprove(selected);
    setSelected([]);
  };

  const handleReject = async () => {
    await onReject(selected);
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={selected.length === 0} onClick={handleApprove}>
          Approve selected
        </Button>
        <Button size="sm" variant="destructive" disabled={selected.length === 0} onClick={handleReject}>
          Reject selected
        </Button>
        <span className="text-sm text-muted-foreground">{selected.length} selected</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={isAllSelected} onChange={() => toggleAll()} aria-label="Select all pending requests" />
            </TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} data-state={selected.includes(request.id) ? "selected" : undefined}>
              <TableCell>
                {request.status === "PENDING" ? (
                  <Checkbox
                    checked={selected.includes(request.id)}
                    onChange={() => toggleOne(request.id)}
                    aria-label={`Select request for ${request.employee.name}`}
                  />
                ) : null}
              </TableCell>
              <TableCell>{request.employee.name}</TableCell>
              <TableCell>{formatTimeRange(request.start, request.end)}</TableCell>
              <TableCell>{minutesToHHMM(request.minutes)}</TableCell>
              <TableCell>
                <Badge variant={request.type === "NORMAL" ? "secondary" : "warning"}>
                  {request.type === "NORMAL" ? "Normal" : "Overtime"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md truncate" title={request.note ?? undefined}>
                {request.note ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={request.status === "APPROVED" ? "success" : request.status === "REJECTED" ? "destructive" : "warning"}>
                  {request.status.toLowerCase()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                Nothing to review.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
