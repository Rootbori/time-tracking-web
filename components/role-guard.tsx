"use client";

import { ReactNode } from "react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  roles: UserRole[];
  fallback?: ReactNode;
  onRequireLogin?: () => void;
  children: ReactNode;
}

export function RoleGuard({ roles, fallback, onRequireLogin, children }: RoleGuardProps) {
  const { user, hasRole } = useAuth();

  if (!user) {
    return (
      fallback ?? (
        <Card className="mx-auto max-w-md">
          <CardHeader className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please log in to access this section.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={onRequireLogin}>Go to Login</Button>
          </CardContent>
        </Card>
      )
    );
  }

  if (!hasRole(roles)) {
    return (
      fallback ?? (
        <Card className="mx-auto max-w-md">
          <CardHeader className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle>Insufficient permissions</CardTitle>
            <CardDescription>You do not have the required role to view this page.</CardDescription>
          </CardHeader>
        </Card>
      )
    );
  }

  return <>{children}</>;
}
