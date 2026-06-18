import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import React, { ReactElement, useMemo, useState } from "react";
import { TimesheetData } from "@/components/Timesheet/helpers/hooks";
import MobileShiftsView from "@/components/common/MobileShiftsView";
import { useIsDesktopView } from "@/components/common/ScreenSizeHelpers";
import DesktopShiftsView from "@/components/common/DesktopShiftsView";

const NO_SHIFTS_MESSAGE: string = "You haven't worked any shifts yet.";
type SortOrder = "asc" | "desc";

export const TimesheetWidget = (p: {
  open: boolean;
  onOpenChange: () => void;
  isLoading: boolean;
  timesheetData: TimesheetData;
}): ReactElement => {
  const isDesktopView: boolean = useIsDesktopView();
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const sortedShifts = useMemo(
    () =>
      [...p.timesheetData.shifts].sort((a, b) => {
        // Compare the actual calendar dates, not the formatted strings.
        // The API sends dates like "Sunday, May 31, 2026", so localeCompare
        // would sort them alphabetically (by weekday/month name) instead of
        // chronologically.
        const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      }),
    [p.timesheetData.shifts, sortOrder],
  );
  const nextSortOrder: SortOrder = sortOrder === "asc" ? "desc" : "asc";

  return (
    <Collapsible open={p.open} onOpenChange={p.onOpenChange} className="col-span-2 w-11/12 lg:w-auto">
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="transition-colors duration-200 hover:bg-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="m-auto">Work History</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {p.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <>
              <div className="mb-4 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setSortOrder(nextSortOrder)}>
                  {sortOrder === "asc" ? <ArrowUp className="mr-2 h-4 w-4" /> : <ArrowDown className="mr-2 h-4 w-4" />}
                  Sort: {sortOrder === "asc" ? "Asc" : "Desc"}
                </Button>
              </div>
              {isDesktopView && (
                <DesktopShiftsView shifts={sortedShifts} isLoading={p.isLoading} noShiftsMessage={NO_SHIFTS_MESSAGE} />
              )}
              {!isDesktopView && (
                <MobileShiftsView shifts={sortedShifts} isLoading={p.isLoading} noShiftsMessage={NO_SHIFTS_MESSAGE} />
              )}
            </>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
