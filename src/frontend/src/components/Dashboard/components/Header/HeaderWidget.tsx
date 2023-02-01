import { AppBar, Button, Toolbar } from "@mui/material";
import { Container } from "@mui/system";

interface HeaderWidgetProps {
  onLogout: () => void;
}
export const HeaderWidget = ({ onLogout }: HeaderWidgetProps) => {
  return (
    <AppBar position="static" className="bg-white shadow-md">
      <Container className="max-w-screen-md">
        <Toolbar disableGutters>
          <img
            src="wun2free_logo.png"
            alt="logo"
            className="aspect-auto h-8 md:h-12"
          />
          <Button
            className="ml-auto text-xs text-black md:text-base"
            onClick={onLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
