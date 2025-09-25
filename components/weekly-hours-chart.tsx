"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export interface WeeklyHoursDataPoint {
  day: string;
  regularMinutes: number;
  overtimeMinutes: number;
}

interface WeeklyHoursChartProps {
  data: WeeklyHoursDataPoint[];
}

function minutesToHours(minutes: number) {
  return Math.round((minutes / 60) * 100) / 100;
}

export function WeeklyHoursChart({ data }: WeeklyHoursChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={minutesToHours} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => `${minutesToHours(value)}h`} />
          <Legend formatter={(value) => (value === "regularMinutes" ? "Normal" : "Overtime")} />
          <Bar dataKey="regularMinutes" stackId="hours" fill="#2563eb" name="Normal" radius={[4, 4, 0, 0]} />
          <Bar dataKey="overtimeMinutes" stackId="hours" fill="#f97316" name="Overtime" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
