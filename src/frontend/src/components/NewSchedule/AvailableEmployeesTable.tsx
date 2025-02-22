import { ReactElement } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SchedulingData } from "@/components/Scheduling/helpers/hooks";

export function AvailableEmployeesTable(p: {
  isLoading: boolean;
  schedulingData: SchedulingData;
  schedulingForDate: string;
  selectedEmployees: Set<string>;
}): ReactElement {
  if (p.isLoading) {
    return <p>...</p>;
  }

  const numRows = Math.max(...Object.values(p.schedulingData.availability).map((day: string[]): number => day.length));
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {p.schedulingData.days.map((day) => (
            <TableHead key={day}>{day}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(numRows)].map((_, i) => (
          <TableRow key={i}>
            {p.schedulingData.days.map((day) => {
              const employee: string = p.schedulingData.availability[day][i] || "";
              if (day === p.schedulingForDate && p.selectedEmployees.has(p.schedulingData.availability[day][i])) {
                return (
                  <TableCell key={day} className="line-through opacity-50">
                    {employee}
                  </TableCell>
                );
              }
              return <TableCell key={day}>{employee}</TableCell>;
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
