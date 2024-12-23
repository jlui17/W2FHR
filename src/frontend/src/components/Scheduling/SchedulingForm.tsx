import React, { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DesktopShiftsView from "@/components/common/DesktopShiftsView";
import { Shift } from "@/components/Timesheet/helpers/hooks";
import MobileShiftsView from "@/components/common/MobileShiftsView";
import { useIsDesktopView } from "@/components/common/ScreenSizeHelpers";
import { Controller, UseFormReturn } from "react-hook-form";
import { SchedulingSchemaFormData } from "@/components/Scheduling/SchedulingController";
import { dateToFormatForUser } from "@/components/common/constants";
import { CheckboxButton } from "@/components/ui/checkbox-button";

interface SchedulingWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  shifts: Shift[];
  startDate: Date;
  onSetStartDate: (date: Date) => void;
  endDate: Date;
  onSetEndDate: (date: Date) => void;
  onSortChange: () => void;
  onSubmit: (data: SchedulingSchemaFormData) => void;
  form: UseFormReturn<SchedulingSchemaFormData>;
}

const NO_SHIFTS_MESSAGE: string = "No shift data available.";

export function SchedulingForm(p: SchedulingWidgetProps): ReactElement {
  const isDesktopView: boolean = useIsDesktopView();
  return (
    <div className="col-span-2 w-11/12 lg:w-auto">
      <form onSubmit={p.form.handleSubmit(p.onSubmit)}>
        <Collapsible open={p.open} onOpenChange={p.onOpenChange}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="transition-colors duration-200 hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="m-auto">Schedule</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {p.open ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle table</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="mb-4 flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-start">
                  <Controller
                    control={p.form.control}
                    name="startOfWeek"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[240px] justify-start text-left font-normal"
                            disabled={p.isLoading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateToFormatForUser(field.value)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  <Controller
                    control={p.form.control}
                    name="showMonday"
                    render={({ field }) => (
                      <CheckboxButton
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                        text="Show Monday"
                        checked={field.value}
                        disabled={p.isLoading}
                      />
                    )}
                  />
                  <Controller
                    control={p.form.control}
                    name="disableUpdates"
                    render={({ field }) => (
                      <CheckboxButton
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                        text="Disable Updates"
                        checked={field.value}
                        disabled={p.isLoading}
                      />
                    )}
                  />
                  <Button
                    className="justify-start font-normal"
                    type="submit"
                    disabled={p.isLoading}
                  >
                    Update
                  </Button>
                </div>
                <div className="mb-4 flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-start">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !p.startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {p.startDate ? (
                          format(p.startDate, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={p.startDate}
                        onSelect={(date) =>
                          p.onSetStartDate(date || p.startDate)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !p.endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {p.endDate ? (
                          format(p.endDate, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={p.endDate}
                        onSelect={(date) => p.onSetEndDate(date || p.endDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    onClick={p.onSortChange}
                    className="h-auto font-normal"
                  >
                    Sort
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {isDesktopView ? (
                  <DesktopShiftsView
                    shifts={p.shifts}
                    isLoading={p.isLoading}
                    showNames
                    noShiftsMessage={NO_SHIFTS_MESSAGE}
                  />
                ) : (
                  <MobileShiftsView
                    shifts={p.shifts}
                    isLoading={p.isLoading}
                    noShiftsMessage={NO_SHIFTS_MESSAGE}
                  />
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </form>
    </div>
  );
}
