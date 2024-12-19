import React, { ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
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
import { ScheduleData } from "@/components/Schedule/helpers/hooks";

interface ScheduleWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  schedule: ScheduleData;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  onSortChange: () => void;
}

export function ScheduleWidget(p: ScheduleWidgetProps): ReactElement {
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
            <div className="mb-4 flex space-x-4">
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
                    onSelect={(date) => p.setStartDate(date || p.startDate)}
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
                    onSelect={(date) => p.setEndDate(date || p.endDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={p.onSortChange}
                      className="h-auto p-0 font-bold"
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Shift</TableHead>
                  <TableHead className="font-bold">Start</TableHead>
                  <TableHead className="font-bold">End</TableHead>
                  <TableHead className="font-bold">Break</TableHead>
                  <TableHead className="font-bold">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.isLoading ? (
                  <TableRow>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <TableCell key={index}>
                        <div className="flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ) : (
                  p.schedule.shifts.map((row) => (
                    <TableRow
                      key={
                        row.date.toISOString() +
                        row.shiftTitle +
                        row.employeeName
                      }
                    >
                      <TableCell>
                        {row.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>{row.shiftTitle}</TableCell>
                      <TableCell>{row.startTime}</TableCell>
                      <TableCell>{row.endTime}</TableCell>
                      <TableCell>{row.breakDuration}</TableCell>
                      <TableCell>{row.netHours}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
