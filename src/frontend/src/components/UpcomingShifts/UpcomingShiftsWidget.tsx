import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { TimesheetData } from "@/components/Timesheet/helpers/hooks";
import { ReactElement } from "react";
import MobileShiftsView from "@/components/common/MobileShiftsView";

interface UpcomingShiftsWidgetProps {
  isLoading: boolean;
  upcomingShiftsData: TimesheetData;
}

export function UpcomingShiftsWidget(
  p: UpcomingShiftsWidgetProps,
): ReactElement {
  const hasNoUpcomingShifts: boolean = p.upcomingShiftsData.shifts.length === 0;

  return (
    <Card className="w-11/12 lg:mx-auto lg:w-3/4">
      <CardHeader>
        <CardTitle className="m-auto">Upcoming Shifts</CardTitle>
      </CardHeader>
      <CardContent>
        {p.isLoading ? (
          <Loader2 className="m-auto h-16 w-16 animate-spin" />
        ) : hasNoUpcomingShifts ? (
          <div className="mt-2 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-600">You have no upcoming shifts</p>
          </div>
        ) : (
          <MobileShiftsView
            shifts={p.upcomingShiftsData.shifts}
            isLoading={p.isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}
