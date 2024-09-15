import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HeaderWidgetProps {
  onLogout: () => void;
}
export const HeaderWidget = ({ onLogout }: HeaderWidgetProps) => {
  return (
    <Card className="flex w-screen items-center justify-around rounded-none p-2 px-8 shadow-md">
      <img
        src="wun2free_logo.png"
        alt="logo"
        className="aspect-auto h-8 md:h-12"
      />
      <Button className="ml-auto text-xs md:text-sm" onClick={onLogout}>
        Logout
      </Button>
    </Card>
  );
};
