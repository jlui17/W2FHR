import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import React from "react";
import { AvailabilityData } from "./AvailabilityFormDataProvider";

interface AvailabilityFormWidgetProps {
  isLoading: boolean;
  availabilityData: AvailabilityData;
  handleAvailabilityChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export const AvailabilityFormWidget = ({
  isLoading,
  availabilityData,
  handleAvailabilityChange,
}: AvailabilityFormWidgetProps): JSX.Element => {
  const getAvailabilityBoxes = () => {
    return (
      <>
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
      </>
    );
  };

  return (
    <div>
      <h1>Availability</h1>
      {isLoading ? <CircularProgress /> : getAvailabilityBoxes()}
    </div>
  );
};
