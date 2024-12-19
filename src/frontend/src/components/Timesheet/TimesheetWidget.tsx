import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { ReactElement } from "react";
import { TimesheetData } from "@/components/Timesheet/helpers/hooks";
import MobileShiftsView from "@/components/common/MobileShiftsView";
import { useIsDesktopView } from "@/components/common/ScreenSizeHelpers";
import DesktopShiftsView from "@/components/common/DesktopShiftsView";

export const TimesheetWidget = (p: {
  open: boolean;
  onOpenChange: () => void;
  isLoading: boolean;
  timesheetData: TimesheetData;
}): ReactElement => {
  const isDesktopView: boolean = useIsDesktopView();

  return (
    <Collapsible
      open={p.open}
      onOpenChange={p.onOpenChange}
      className="col-span-2 w-11/12 lg:w-auto"
    >
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="transition-colors duration-200 hover:bg-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="m-auto">Work History</CardTitle>
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
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <>
              {isDesktopView && (
                <DesktopShiftsView
                  shifts={p.timesheetData.shifts}
                  isLoading={p.isLoading}
                />
              )}
              {!isDesktopView && (
                <MobileShiftsView shifts={p.timesheetData.shifts} isLoading={p.isLoading} />
              )}
            </>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
