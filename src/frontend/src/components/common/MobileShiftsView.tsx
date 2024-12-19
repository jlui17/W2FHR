import { Shift } from "@/components/Timesheet/helpers/hooks";
import React, { ReactElement } from "react";
import { Loader2 } from "lucide-react";

export default function MobileShiftsView(p: {
  className?: string;
  shifts: Shift[];
  isLoading: boolean;
}): ReactElement {
  const hasShifts: boolean = p.shifts.length > 0;
  return p.isLoading ? (
    <div className="flex justify-center">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  ) : !hasShifts ? (
    <p className="m-auto text-center text-sm text-gray-600">
      You haven't worked any shifts yet
    </p>
  ) : (
    <div className={`mt-2 flex flex-col ${p.className || ""}`}>
      {p.shifts.map((shift: Shift, i: number) => (
        <>
          <div
            className="mb-6 flex flex-col"
            key={i + shift.date + shift.shiftTitle}
          >
            <p className="text-md">{shift.date}</p>
            <i>
              <p className="text-md">{shift.shiftTitle}</p>
            </i>
            <p className="text-sm text-gray-600">
              Start Time: {shift.startTime}
            </p>
            <p className="text-sm text-gray-600">End Time: {shift.endTime}</p>
            <p className="text-sm text-gray-600">
              Break Duration: {shift.breakDuration}
            </p>
            <p className="text-sm text-gray-600">Net Hours: {shift.netHours}</p>
          </div>
          {i !== p.shifts.length - 1 && (
            <div className="mb-6 border-b" key={i} />
          )}
        </>
      ))}
    </div>
  );
}
