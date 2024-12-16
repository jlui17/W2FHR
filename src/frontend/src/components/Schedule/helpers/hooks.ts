import { getScheduleForTimeRangeApiUrl } from "@/components/common/ApiUrlUtil";
import { ERROR_MESSAGES } from "@/components/common/constants";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  isTimesheetData,
  Shift,
  TimesheetData,
} from "@/components/Timesheet/helpers/hooks";

interface ScheduleShift {
  date: Date;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  netHours: number;
  employeeName: string;
}

export interface ScheduleData {
  shifts: ScheduleShift[];
}

export function useScheduleData(p: {
  idToken: string;
  start: Date;
  end: Date;
  enabled: boolean;
  queryKey: string[];
}): UseQueryResult<ScheduleData, Error> {
  async function getScheduleData(): Promise<ScheduleData> {
    const response = await fetch(
      getScheduleForTimeRangeApiUrl(p.start, p.end),
      {
        headers: {
          Authorization: `Bearer ${p.idToken}`,
        },
        mode: "cors",
      },
    );

    switch (response.status) {
      case 200:
        const data = await response.json();
        if (!isTimesheetData(data)) {
          return Promise.reject(
            new Error(ERROR_MESSAGES.SERVER.DATA_INCONSISTENT),
          );
        }
        return Promise.resolve(convertTimesheetDataToScheduleData(data));
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  }

  return useQuery({
    queryKey: p.queryKey,
    queryFn: getScheduleData,
    enabled: p.enabled,
  });
}

function convertTimesheetDataToScheduleData(data: TimesheetData): ScheduleData {
  const shifts: ScheduleShift[] = data.shifts.map((shift: Shift) => ({
    date: new Date(shift.date),
    shiftTitle: shift.shiftTitle,
    startTime: shift.startTime,
    endTime: shift.endTime,
    breakDuration: shift.breakDuration,
    netHours: shift.netHours,
    employeeName: shift.employeeName,
  }));

  return { shifts };
}

export const sampleData: ScheduleData = {
  shifts: [
    {
      date: new Date("Thursday, June 1, 2023"),
      shiftTitle: "Morning",
      startTime: "08:00",
      endTime: "16:00",
      breakDuration: "1:00",
      netHours: 7,
      employeeName: "John Doe",
    },
    {
      date: new Date("Friday, June 2, 2023"),
      shiftTitle: "Evening",
      startTime: "16:00",
      endTime: "00:00",
      breakDuration: "0:45",
      netHours: 7.25,
      employeeName: "Jane Smith",
    },
    {
      date: new Date("Thursday, June 1, 2023"),
      shiftTitle: "Night",
      startTime: "00:00",
      endTime: "08:00",
      breakDuration: "0:30",
      netHours: 7.5,
      employeeName: "Alice Johnson",
    },
  ],
};
