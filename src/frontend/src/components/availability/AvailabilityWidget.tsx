import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { Availability } from "../../helpers/API_CONSTANTS";

interface AvailabilityWidgetProps extends WidgetProps {
  isLoading: boolean;
}

interface WidgetProps {
  initialAvailability: Availability;
}

export const AvailabilityWidget = (props: AvailabilityWidgetProps) => {
  const { isLoading } = props;

  if (isLoading) return <p>Loading...</p>;

  const { initialAvailability } = props;
  return <Widget initialAvailability={initialAvailability} />;
};

const Widget = (props: WidgetProps) => {
  const [availability, setAvailability] = useState<Availability>({
    ...props.initialAvailability,
  });

  const handleAvailabilityChange = (event: React.MouseEvent) => {
    console.log(event);
  };

  return (
    <>
      <Button variant="outline-primary" onClick={handleAvailabilityChange} />
      Day1: {String(availability.Day1)}
      Day2: {String(availability.Day2)}
      Day3: {String(availability.Day3)}
      Day4: {String(availability.Day4)}
    </>
  );
};
