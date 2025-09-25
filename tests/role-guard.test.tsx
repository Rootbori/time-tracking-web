import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { RoleGuard } from "@/components/role-guard";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn()
}));

import { useAuth } from "@/hooks/useAuth";

const mockUseAuth = vi.mocked(useAuth);

describe("RoleGuard", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("renders login prompt when user is missing", () => {
    mockUseAuth.mockReturnValue({ user: null, hasRole: vi.fn(), logout: vi.fn() } as any);

    render(
      <RoleGuard roles={["EMPLOYEE"]}>
        <p>Protected</p>
      </RoleGuard>
    );

    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
  });

  it("renders fallback when user lacks role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "User", email: "user@test.com", roles: ["EMPLOYEE"] },
      hasRole: vi.fn().mockReturnValue(false)
    } as any);

    render(
      <RoleGuard roles={["MANAGER"]}>
        <p>Protected</p>
      </RoleGuard>
    );

    expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument();
  });

  it("renders children when role matches", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "User", email: "user@test.com", roles: ["MANAGER"] },
      hasRole: vi.fn().mockReturnValue(true)
    } as any);

    render(
      <RoleGuard roles={["MANAGER"]}>
        <p>Protected</p>
      </RoleGuard>
    );

    expect(screen.getByText("Protected")).toBeInTheDocument();
  });
});
