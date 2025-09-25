import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { TimeClockCard } from "@/components/time-clock-card";

vi.mock("@/hooks/useTimeClock", () => ({
  useTimeClock: vi.fn()
}));

import { useTimeClock } from "@/hooks/useTimeClock";

const mockUseTimeClock = vi.mocked(useTimeClock);

describe("TimeClockCard", () => {
  beforeEach(() => {
    mockUseTimeClock.mockReset();
  });

  it("shows start button when there is no active session", () => {
    mockUseTimeClock.mockReturnValue({
      status: { activeSession: null, todaysTotalMinutes: 0 },
      isLoading: false,
      startClock: vi.fn(),
      stopClock: vi.fn(),
      isStarting: false,
      isStopping: false
    });

    render(<TimeClockCard />);

    expect(screen.getByRole("button", { name: /start session/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /stop session/i })).toBeDisabled();
  });

  it("shows stop button when there is an active session", () => {
    mockUseTimeClock.mockReturnValue({
      status: {
        activeSession: {
          id: "1",
          start: new Date().toISOString(),
          minutes: 5,
          type: "NORMAL",
          status: "PENDING"
        },
        todaysTotalMinutes: 30
      },
      isLoading: false,
      startClock: vi.fn(),
      stopClock: vi.fn(),
      isStarting: false,
      isStopping: false
    });

    render(<TimeClockCard />);

    expect(screen.getByRole("button", { name: /stop session/i })).toBeEnabled();
  });

  it("calls stopClock when stop button is clicked", () => {
    const stopClock = vi.fn().mockResolvedValue(undefined);
    mockUseTimeClock.mockReturnValue({
      status: {
        activeSession: {
          id: "1",
          start: new Date().toISOString(),
          minutes: 5,
          type: "NORMAL",
          status: "PENDING"
        },
        todaysTotalMinutes: 30
      },
      isLoading: false,
      startClock: vi.fn(),
      stopClock,
      isStarting: false,
      isStopping: false
    });

    render(<TimeClockCard />);

    fireEvent.click(screen.getByRole("button", { name: /stop session/i }));
    expect(stopClock).toHaveBeenCalledTimes(1);
  });
});
