import { AppBar, Button, Toolbar } from "@mui/material";
import { Container } from "@mui/system";

interface HeaderWidgetProps {
  onLogout: () => void;
}
export const HeaderWidget = ({ onLogout }: HeaderWidgetProps) => {
  return (
    <AppBar position="static" color="transparent">
      <Container className="max-w-screen-md">
        <Toolbar disableGutters>
          <img
            src="wun2free_logo.png"
            alt="logo"
            className="aspect-auto h-8 md:h-12"
          />
          <Button
            color="inherit"
            className="ml-auto text-xs md:text-base"
            onClick={onLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
