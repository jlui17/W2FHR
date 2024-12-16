
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import React from "react";
import { TimesheetData } from "@/components/Timesheet/helpers/hooks";

export const TimesheetWidget = (p: {
  open: boolean;
  onOpenChange: () => void;
  isLoading: boolean;
  timesheetData: TimesheetData;
}): JSX.Element => {
  const hasNoShifts = p.timesheetData.shifts.length === 0;

  const displayEmptyTimesheet = (): JSX.Element => {
    return (
      <p className="m-auto text-center text-sm text-gray-600">
        You haven't worked any shifts yet
      </p>
    );
  };

  const displayTimesheet = (): JSX.Element => {
    return (
      <div className="mt-2 flex flex-col">
        {p.timesheetData.shifts.map((shift, i) => {
          return (
            <div className="mb-6 flex flex-col">
              <p className="text-md">{shift.date}</p>
              <p className="text-sm">{shift.shiftTitle}</p>
              <p className="text-sm text-gray-600">Start: {shift.startTime}</p>
              <p className="text-sm text-gray-600">End: {shift.endTime}</p>
              <p className="text-sm text-gray-600">
                Break Duration: {shift.breakDuration}
              </p>
              <p className="text-sm text-gray-600">
                Net Hours: {shift.netHours}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Collapsible
      open={p.open}
      onOpenChange={p.onOpenChange}
      className="bg-card text-card-foreground w-11/12 rounded-md border bg-white shadow-sm md:w-auto"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between px-4 py-3">
          <CardTitle className="m-auto">Shift History</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {p.open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 py-3 pb-7">
        {p.isLoading ? (
          <Loader2 className="m-auto h-16 w-16 animate-spin" />
        ) : hasNoShifts ? (
          displayEmptyTimesheet()
        ) : (
          displayTimesheet()
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
