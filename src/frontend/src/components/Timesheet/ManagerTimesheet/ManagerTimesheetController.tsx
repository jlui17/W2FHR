import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useAlert, AlertType, AlertInfo } from "@/components/common/Alerts";
import { useContext, useState } from "react";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";
import { useTimesheetData } from "../helpers/hooks";
import { ERROR_MESSAGES } from "@/components/common/constants";
import { Button } from "@mui/material";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { FilePenIcon, TrashIcon } from "lucide-react";

export interface Shift {
  date: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  netHours: number;
}

export interface ManagerTimesheetData {
  shifts: AllSchedules[];
}

export interface AllSchedules {
  EmployeeIds: string[][];
  ShiftNames: string[][];
  Shifts: string[][];
}



const ManagerTimesheetController = (): JSX.Element => {
  const { getAuthSession } = useContext(AuthenticationContext);
  const [selectedDay, setSelectedDay] = useState<string>('');

  const {
    refetch,
    isFetching,
    isError,
    data: shiftHistory,
  } = useTimesheetData({
    idToken: getAuthSession()?.IdToken || "",
    getUpcoming: true,
    all: true,
  });

  const data = shiftHistory as ManagerTimesheetData;

  const handleDayClick = (day: string) => {
    setSelectedDay(day);
  };

  const filterShiftsByDay = (shift: any) => {
    return selectedDay === '' || shift[0].startsWith(selectedDay);
  };

  if (data) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-100">
        <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <h1 className="text-2xl font-bold">Shifts</h1>
          <div>
            {['Friday', 'Saturday', 'Sunday', 'Monday'].map(day => (
              <button key={day} onClick={() => handleDayClick(day)} className={`px-3 py-2 ${selectedDay === day ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {day}
              </button>
            ))}
            </div>
          <div className="flex items-center space-x-4">
            <Button>Save</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Shift</th>
                <th className="px-4 py-3 text-left">Assigned To</th>
                <th className="px-4 py-3 text-left">Start</th>
                <th className="px-4 py-3 text-left">End</th>
                <th className="px-4 py-3 text-left">Break</th>
                <th className="px-4 py-3 text-left">Net Hours</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.shifts.map((shiftGroup, i) => (
                shiftGroup.Shifts.filter(filterShiftsByDay).map((shift, j) => (
                  <tr key={`shiftgroup-${i}-shift-${j}`} className="border-b">
                    <td className="px-4 py-3">{shift[0]}</td>
                    <td className="px-4 py-3">{shiftGroup.ShiftNames[j][0]}</td>
                    <td className="px-4 py-3">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={shiftGroup.EmployeeIds[0][0]}/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test1">Test</SelectItem>
                          <SelectItem value="test2">Test2</SelectItem>
                          <SelectItem value="test3">Test3</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">{shift[1]}</td>
                    <td className="px-4 py-3">{shift[2]}</td>
                    <td className="px-4 py-3">{shift[3]}</td>
                    <td className="px-4 py-3">{shift[4]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="outlined" size="small">
                          <FilePenIcon className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="outlined" size="small">
                          <TrashIcon className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

  } else {

    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }


};
export const ManagerTimesheet = (): JSX.Element => {
  const { setAlert } = useAlert();
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        console.error(`Error in ManagerTimesheet:\n${error}`);
        const errorAlert: AlertInfo = {
          type: AlertType.ERROR,
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
        };
        if (error instanceof Error) {
          errorAlert.message = error.message;
        }
        setAlert(errorAlert);
      },
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ManagerTimesheetController />
    </QueryClientProvider>
  );

};
