"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { useTimeClock } from "@/hooks/useTimeClock";
import { minutesToHHMM } from "@/utils/time";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  note: z.string().max(200, "Note must be 200 characters or less").optional()
});

type FormValues = z.infer<typeof formSchema>;

function formatElapsed(start?: string) {
  if (!start) return "00:00:00";
  const startDate = new Date(start).getTime();
  const now = Date.now();
  const elapsed = Math.max(0, Math.floor((now - startDate) / 1000));
  const hours = Math.floor(elapsed / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((elapsed % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(elapsed % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function TimeClockCard() {
  const { status, startClock, stopClock, isStarting, isStopping } = useTimeClock();
  const [elapsed, setElapsed] = useState("00:00:00");
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: "" }
  });

  const activeSession = status?.activeSession ?? null;

  useEffect(() => {
    setElapsed(formatElapsed(activeSession?.start ?? undefined));
    if (!activeSession?.start) return;

    const interval = setInterval(() => {
      setElapsed(formatElapsed(activeSession.start));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.start]);

  const todaysTotal = useMemo(() => status?.todaysTotalMinutes ?? 0, [status?.todaysTotalMinutes]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await startClock({ note: values.note });
      toast.success("Clock started");
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start clock");
    }
  });

  const handleStop = async () => {
    try {
      await stopClock();
      toast.success("Clock stopped");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to stop clock");
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Time Clock</CardTitle>
        <CardDescription>Track your work session with a single click.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2 rounded-lg border bg-muted/40 p-4 text-center">
          <span className="text-xs uppercase text-muted-foreground">Current session</span>
          <span className="text-4xl font-semibold tabular-nums">{elapsed}</span>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Badge variant={activeSession ? "success" : "secondary"}>
              {activeSession ? "Running" : "Stopped"}
            </Badge>
            <span>Total today: {minutesToHHMM(todaysTotal)}</span>
          </div>
        </div>

        {!activeSession && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2 text-left">
              <Label htmlFor="note">Session note</Label>
              <Input id="note" placeholder="What are you working on?" {...form.register("note")} />
              {form.formState.errors.note && (
                <p className="text-sm text-destructive">{form.formState.errors.note.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isStarting} className="w-full">
              {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Start session
            </Button>
          </form>
        )}

        {activeSession && (
          <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-left">
            <p className="text-sm font-medium">Started at {new Date(activeSession.start).toLocaleTimeString()}</p>
            {activeSession.note && <p className="text-sm text-muted-foreground">Note: {activeSession.note}</p>}
            <p className="text-xs text-muted-foreground">
              You can stop the timer once you finish. The entry will be available in your timesheet.
            </p>
          </div>
        )}
      </CardContent>
      {activeSession && (
        <CardFooter className="justify-end">
          <Button variant="destructive" onClick={handleStop} disabled={isStopping}>
            {isStopping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Stop session
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
