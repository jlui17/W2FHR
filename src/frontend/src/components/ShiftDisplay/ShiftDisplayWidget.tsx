import { TimesheetData } from "./ShiftDisplayDataProvider";

interface ShiftDisplayWidgetProps {
  isLoading: boolean;
  timesheetData: TimesheetData;
}

export const ShiftDisplayWidget = (
  props: ShiftDisplayWidgetProps
): JSX.Element => {
  const { isLoading, timesheetData } = props;

  if (isLoading) {
    return <div>loading...</div>;
  }

  console.log(timesheetData);
  return <div>hello world</div>;
};
