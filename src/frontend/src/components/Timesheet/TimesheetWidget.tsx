import { TimesheetData } from "./TimesheetController";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2 } from "lucide-react";

export const TimesheetWidget = (p: {
  open: boolean;
  onOpenChange: () => void;
  isLoading: boolean;
  timesheetData: TimesheetData;
}): JSX.Element => {
  const hasNoShifts = p.timesheetData.shifts.length === 0;

  const displayEmptyTimesheet = (): JSX.Element => {
    return (
      <p className="m-auto text-sm text-center text-gray-600">
        You haven't worked any shifts yet
      </p>
    );
  };

  const displayTimesheet = (): JSX.Element => {
    return (
      <div className="mt-2 flex flex-col">
        {p.timesheetData.shifts.map((shift, i) => {
          return (
            <div className="flex mb-6 flex-col">
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
      className="rounded-md bg-white border bg-card text-card-foreground shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between px-4 py-3">
          <CardTitle className="m-auto">Shift History</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronDownIcon className="h-5 w-5 transition-transform duration-300 [&[data-state='open']]:rotate-180" />
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

function ChevronDownIcon(p: { className: string }): JSX.Element {
  return (
    <svg
      className={p.className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
