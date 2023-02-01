import {
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import React from "react";
import { AlertInfo, displayAlert } from "../common/Alerts";
import { AvailabilityData } from "./AvailabilityController";

interface AvailabilityFormWidgetProps {
  isLoading: boolean;
  availabilityData: AvailabilityData;
  handleAvailabilityChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  updateAvailability: () => void;
  alert: AlertInfo | null;
  closeAlert: () => void;
}

export const AvailabilityFormWidget = ({
  isLoading,
  availabilityData,
  handleAvailabilityChange,
  updateAvailability,
  alert,
  closeAlert,
}: AvailabilityFormWidgetProps): JSX.Element => {
  const getAvailabilityBoxes = () => {
    return (
      <>
        {displayAlert(alert, closeAlert)}
        <FormControl>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={availabilityData.day1.isAvailable}
                  disabled={!availabilityData.canUpdate}
                  name="day1"
                  onChange={handleAvailabilityChange}
                />
              }
              label={availabilityData.day1.date}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={availabilityData.day2.isAvailable}
                  disabled={!availabilityData.canUpdate}
                  name="day2"
                  onChange={handleAvailabilityChange}
                />
              }
              label={availabilityData.day2.date}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={availabilityData.day3.isAvailable}
                  disabled={!availabilityData.canUpdate}
                  name="day3"
                  onChange={handleAvailabilityChange}
                />
              }
              label={availabilityData.day3.date}
            />
            {availabilityData.day4.date !== "" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={availabilityData.day4.isAvailable}
                    disabled={!availabilityData.canUpdate}
                    name="day4"
                    onChange={handleAvailabilityChange}
                  />
                }
                label={availabilityData.day4.date}
              />
            )}
          </FormGroup>
        </FormControl>
        <CardActions className="p-0">
          <Button
            onClick={updateAvailability}
            disabled={!availabilityData.canUpdate}
            variant="contained"
            className="w-full"
          >
            Save
          </Button>
        </CardActions>
      </>
    );
  };

  return (
    <Card className="inline-block">
      <CardContent>
        <Typography className="text-lg font-bold">Availability</Typography>
        {isLoading ? <CircularProgress /> : getAvailabilityBoxes()}
      </CardContent>
    </Card>
  );
};
