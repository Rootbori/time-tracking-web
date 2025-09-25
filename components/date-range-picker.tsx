"use client";

import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
}

function toInputDate(date?: Date) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Input
        type="date"
        value={toInputDate(value.from)}
        onChange={(event) => {
          const next = event.target.value ? new Date(event.target.value) : undefined;
          onChange({ ...value, from: next });
        }}
        aria-label="Start date"
      />
      <Input
        type="date"
        value={toInputDate(value.to)}
        min={value.from ? format(value.from, "yyyy-MM-dd") : undefined}
        onChange={(event) => {
          const next = event.target.value ? new Date(event.target.value) : undefined;
          onChange({ ...value, to: next });
        }}
        aria-label="End date"
      />
    </div>
  );
}
