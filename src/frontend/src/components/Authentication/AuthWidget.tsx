import { ReactNode } from "react";

interface AuthWidgetProps {
  children: ReactNode;
}

export const AuthWidget = ({ children }: AuthWidgetProps) => {
  return (
    <div className="m-auto inline-flex h-[500px] w-[500px] flex-col rounded-md border-2 border-solid border-gray-100 p-4 shadow-md">
      <img src="wun2free_logo.png" className="mx-auto my-2 aspect-auto w-48" />
      <div className="flex h-[100%] flex-col justify-around align-middle">
        {children}
      </div>
    </div>
  );
};
