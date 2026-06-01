import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimesheetWidget } from "../TimesheetWidget";
import { TimesheetData } from "../helpers/hooks";

vi.mock("@/components/common/ScreenSizeHelpers", () => ({
  useIsDesktopView: () => true,
}));

const timesheetData: TimesheetData = {
  shifts: [
    {
      date: "2024-06-01",
      shiftTitle: "Morning",
      startTime: "08:00",
      endTime: "16:00",
      breakDuration: "1:00",
      netHours: 7,
      employeeName: "John Doe",
    },
    {
      date: "2024-06-03",
      shiftTitle: "Evening",
      startTime: "16:00",
      endTime: "22:00",
      breakDuration: "0:30",
      netHours: 5.5,
      employeeName: "John Doe",
    },
    {
      date: "2024-06-02",
      shiftTitle: "Afternoon",
      startTime: "12:00",
      endTime: "18:00",
      breakDuration: "0:30",
      netHours: 5.5,
      employeeName: "John Doe",
    },
  ],
};

function renderWidget() {
  return render(<TimesheetWidget open={true} onOpenChange={vi.fn()} isLoading={false} timesheetData={timesheetData} />);
}

function renderedShiftDates(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent ?? "");
}

describe("TimesheetWidget", () => {
  afterEach(() => {
    cleanup();
  });

  it("sorts shifts by date descending by default", () => {
    renderWidget();

    expect(renderedShiftDates()).toEqual(["2024-06-03", "2024-06-02", "2024-06-01"]);
    expect(screen.getByRole("button", { name: /sort: desc/i })).toBeVisible();
  });

  it("toggles the shift date sort order between descending and ascending", () => {
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /sort: desc/i }));

    expect(renderedShiftDates()).toEqual(["2024-06-01", "2024-06-02", "2024-06-03"]);
    expect(screen.getByRole("button", { name: /sort: asc/i })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /sort: asc/i }));

    expect(renderedShiftDates()).toEqual(["2024-06-03", "2024-06-02", "2024-06-01"]);
  });
});
