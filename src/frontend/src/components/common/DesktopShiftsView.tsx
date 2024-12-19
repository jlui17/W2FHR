import { Shift } from "@/components/Timesheet/helpers/hooks";
import React, { ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function DesktopShiftsView(p: {
  shifts: Shift[];
  isLoading: boolean;
  noShiftsMessage: string;
  className?: string;
  showNames?: boolean;
}): ReactElement {
  const hasShifts: boolean = p.shifts.length > 0;

  return (
    <Table className={p.className}>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Date</TableHead>
          {p.showNames && <TableHead className="font-bold">Name</TableHead>}
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
        ) : hasShifts ? (
          p.shifts.map((row) => (
            <TableRow key={row.date + row.shiftTitle + row.employeeName}>
              <TableCell>{row.date}</TableCell>
              {p.showNames && <TableCell>{row.employeeName}</TableCell>}
              <TableCell>{row.shiftTitle}</TableCell>
              <TableCell>{row.startTime}</TableCell>
              <TableCell>{row.endTime}</TableCell>
              <TableCell>{row.breakDuration}</TableCell>
              <TableCell>{row.netHours}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              {p.noShiftsMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
