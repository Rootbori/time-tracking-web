"use client";

import { TimeEntry } from "@/hooks/useTimeClock";
import { format, parseISO } from "date-fns";
import { minutesToHHMM, formatTimeRange } from "@/utils/time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimesheetTableProps {
  entries: TimeEntry[];
  onRequestEdit?: (entry: TimeEntry) => void;
}

const statusVariant: Record<TimeEntry["status"], "default" | "success" | "destructive" | "warning"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive"
};

const typeStyles: Record<TimeEntry["type"], string> = {
  NORMAL: "bg-emerald-500/10 text-emerald-700",
  OVERTIME: "bg-amber-500/10 text-amber-700"
};

export function TimesheetTable({ entries, onRequestEdit }: TimesheetTableProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No entries for this day.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Note</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{format(parseISO(entry.start), "MMM d, yyyy")}</TableCell>
            <TableCell>{formatTimeRange(entry.start, entry.end)}</TableCell>
            <TableCell>{minutesToHHMM(entry.minutes)}</TableCell>
            <TableCell>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", typeStyles[entry.type])}>
                {entry.type === "NORMAL" ? "Normal" : "Overtime"}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[entry.status]}>{entry.status.toLowerCase()}</Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate" title={entry.note ?? undefined}>
              {entry.note || "—"}
            </TableCell>
            <TableCell className="text-right">
              {onRequestEdit && (
                <Button variant="outline" size="sm" onClick={() => onRequestEdit(entry)}>
                  Request edit
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
