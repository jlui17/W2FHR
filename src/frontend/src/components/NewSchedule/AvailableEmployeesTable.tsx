import { ReactElement } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AvailableEmployee, SchedulingData } from "@/components/Scheduling/helpers/hooks";

const ATTENDANTS_COLOR: string = "bg-pink-200";
const SUPERVISORS_COLOR: string = "bg-blue-300";

function isManager(employee: AvailableEmployee): boolean {
  return employee.position.includes("Manager");
}

function isSupervisor(employee: AvailableEmployee): boolean {
  return employee.position.includes("Supervisor");
}

function getBackgroundColour(employee: AvailableEmployee): string {
  if (isManager(employee) || employee.name === "") {
    return "";
  } else if (isSupervisor(employee)) {
    return SUPERVISORS_COLOR;
  } else {
    return ATTENDANTS_COLOR;
  }
}

const BLANK_EMPLOYEE: AvailableEmployee = { name: "", position: "" };

export function AvailableEmployeesTable(p: {
  isLoading: boolean;
  schedulingData: SchedulingData;
  isEmployeeScheduled: (employeeName: string, day: string) => boolean;
}): ReactElement {
  if (p.isLoading) {
    return <p>...</p>;
  }

  const numberOfAvailableEmployeesPerDay: number[] = Object.values(p.schedulingData.availability)
    .map((availableEmployees: AvailableEmployee[] | null): number =>
      availableEmployees === null ? 0 : availableEmployees.length
    );
  
  const numRows: number = numberOfAvailableEmployeesPerDay.length > 0 
    ? Math.max(...numberOfAvailableEmployeesPerDay) 
    : 0;

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
              if (p.schedulingData.availability[day] === null) {
                return <TableCell key={day}>-</TableCell>;
              }

              const employee: AvailableEmployee = p.schedulingData.availability[day][i] || BLANK_EMPLOYEE;
              if (p.isEmployeeScheduled(employee.name, day)) {
                return (
                  <TableCell key={day} className={"line-through opacity-50 " + getBackgroundColour(employee)}>
                    {employee.name}
                  </TableCell>
                );
              }
              return <TableCell key={day} className={getBackgroundColour(employee)}>{employee.name}</TableCell>;
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
