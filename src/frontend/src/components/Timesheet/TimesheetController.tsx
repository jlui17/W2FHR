import { ReactElement, useContext, useState } from "react";
import { AuthenticationContext } from "../AuthenticationContextProvider";
import { TimesheetData, useTimesheetData } from "./helpers/hooks";
import { TimesheetWidget } from "./TimesheetWidget";

const EMPTY_DATA: TimesheetData = { shifts: [] };

const TimesheetController = (): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const { getAuthSession } = useContext(AuthenticationContext);
  const {
    refetch,
    isFetching,
    data: shiftHistory,
  } = useTimesheetData({
    idToken: getAuthSession()?.idToken || "",
    getUpcoming: false,
  });

  function onOpenChange(): void {
    if (!open && shiftHistory === undefined) {
      refetch();
    }
    setOpen(!open);
  }

  if (!open) {
    return (
      <TimesheetWidget
        isLoading={false}
        timesheetData={EMPTY_DATA}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  if (!shiftHistory) {
    return (
      <TimesheetWidget
        isLoading={isFetching}
        timesheetData={EMPTY_DATA}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  return (
    <TimesheetWidget
      isLoading={isFetching}
      timesheetData={shiftHistory}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
};

export const Timesheet = (): ReactElement => {
  return <TimesheetController />;
};
