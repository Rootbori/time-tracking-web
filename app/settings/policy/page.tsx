"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  policyText: z.string().min(10, "Policy must be at least 10 characters"),
  overtimeThreshold: z.number({ invalid_type_error: "Enter a number" }).min(0).max(24)
});

type FormValues = z.infer<typeof schema>;

interface PolicyResponse {
  policyText: string;
  overtimeThreshold: number;
}

export default function PolicySettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const policyQuery = useQuery({
    queryKey: ["settings", "policy"],
    queryFn: () => apiClient.get<PolicyResponse>("/settings/policy")
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: policyQuery.data ?? {
      policyText: "",
      overtimeThreshold: 8
    }
  });

  useEffect(() => {
    if (policyQuery.data) {
      form.reset(policyQuery.data);
    }
  }, [policyQuery.data, form]);

  const updatePolicy = useMutation({
    mutationFn: (values: FormValues) => apiClient.put("/settings/policy", values),
    onSuccess: () => {
      toast.success("Policy updated");
      queryClient.invalidateQueries({ queryKey: ["settings", "policy"] });
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await updatePolicy.mutateAsync(values);
  });

  return (
    <RoleGuard roles={["ADMIN"]} onRequireLogin={() => router.push("/login")}> 
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Time tracking policy</CardTitle>
            <CardDescription>Update company policy details and overtime thresholds.</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="policyText">Policy</Label>
                <Textarea id="policyText" rows={8} {...form.register("policyText")} />
                {form.formState.errors.policyText && (
                  <p className="text-sm text-destructive">{form.formState.errors.policyText.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="overtimeThreshold">Daily overtime threshold (hours)</Label>
                <input
                  id="overtimeThreshold"
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  className="h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...form.register("overtimeThreshold", { valueAsNumber: true })}
                />
                {form.formState.errors.overtimeThreshold && (
                  <p className="text-sm text-destructive">{form.formState.errors.overtimeThreshold.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => form.reset(policyQuery.data)}>
                Reset
              </Button>
              <Button type="submit" disabled={updatePolicy.isPending}>
                {updatePolicy.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RoleGuard>
  );
}
