import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimesheetWidget } from "../TimesheetWidget";
import { TimesheetData } from "../helpers/hooks";

vi.mock("@/components/common/ScreenSizeHelpers", () => ({
  useIsDesktopView: () => true,
}));

// Dates use the same human-formatted shape the API returns (e.g.
// "Sunday, May 31, 2026"). The months are chosen so that alphabetical
// string order (April < June < May) differs from chronological order,
// which would catch the date-sorting bug.
const timesheetData: TimesheetData = {
  shifts: [
    {
      date: "Friday, April 24, 2026",
      shiftTitle: "Morning",
      startTime: "08:00",
      endTime: "16:00",
      breakDuration: "1:00",
      netHours: 7,
      employeeName: "John Doe",
    },
    {
      date: "Saturday, June 20, 2026",
      shiftTitle: "Evening",
      startTime: "16:00",
      endTime: "22:00",
      breakDuration: "0:30",
      netHours: 5.5,
      employeeName: "John Doe",
    },
    {
      date: "Sunday, May 31, 2026",
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

    expect(renderedShiftDates()).toEqual([
      "Saturday, June 20, 2026",
      "Sunday, May 31, 2026",
      "Friday, April 24, 2026",
    ]);
    expect(screen.getByRole("button", { name: /sort: desc/i })).toBeVisible();
  });

  it("toggles the shift date sort order between descending and ascending", () => {
    renderWidget();

    fireEvent.click(screen.getByRole("button", { name: /sort: desc/i }));

    expect(renderedShiftDates()).toEqual([
      "Friday, April 24, 2026",
      "Sunday, May 31, 2026",
      "Saturday, June 20, 2026",
    ]);
    expect(screen.getByRole("button", { name: /sort: asc/i })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /sort: asc/i }));

    expect(renderedShiftDates()).toEqual([
      "Saturday, June 20, 2026",
      "Sunday, May 31, 2026",
      "Friday, April 24, 2026",
    ]);
  });
});
