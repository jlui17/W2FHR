import { useContext } from "react";
import Header from "../components/Header";
import { AuthenticationContext } from "@/components/AuthenticationContextProvider";
import { useTimesheetData } from "@/components/Timesheet/helpers/hooks";
import { Man } from "@mui/icons-material";
import { ManagerTimesheet } from "@/components/Timesheet/ManagerTimesheet/ManagerTimesheetController";

export const ManagerWidget = () => {

  return (
    <div className="h-full w-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex h-full min-h-screen max-w-screen flex-col content-start items-center justify-start">
        <ManagerTimesheet/>
      </div>
    </div>
  );
};
