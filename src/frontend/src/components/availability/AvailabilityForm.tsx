import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Availability } from "../../helpers/API_CONSTANTS";

export interface AvailabilityFormProps {
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
  employeeId: string;
  setEmployeeId: React.Dispatch<React.SetStateAction<string>>;
  updateEmployeeAvailability: (e: any) => void;
  refreshAvailability: (e: any) => void;
}

export const AvailabilityForm = ({
  availability,
  setAvailability,
  employeeId,
  setEmployeeId,
  updateEmployeeAvailability,
  refreshAvailability,
}: AvailabilityFormProps) => {
  const updateDay = (day: number) => {
    const newAvailability: Availability = { ...availability };
    switch (day) {
      case 1:
        newAvailability.Day1.isAvailable = !availability.Day1.isAvailable;
        break;
      case 2:
        newAvailability.Day2.isAvailable = !availability.Day2.isAvailable;
        break;
      case 3:
        newAvailability.Day3.isAvailable = !availability.Day3.isAvailable;
        break;
      case 4:
        newAvailability.Day4.isAvailable = !availability.Day4.isAvailable;
        break;
    }
    setAvailability(newAvailability);
  };

  const updateEmployeeId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeId(event.target.value);
  };

  return (
    <>
      <Form onSubmit={updateEmployeeAvailability}>
        <Form.Control
          value={employeeId}
          type="text"
          size="sm"
          onChange={updateEmployeeId}
        />
        <Form.Check
          type="checkbox"
          label={availability.Day1.date}
          checked={availability.Day1.isAvailable}
          onChange={() => {
            updateDay(1);
          }}
        />
        <Form.Check
          type="checkbox"
          label={availability.Day2.date}
          checked={availability.Day2.isAvailable}
          onChange={() => {
            updateDay(2);
          }}
        />
        <Form.Check
          type="checkbox"
          label={availability.Day3.date}
          checked={availability.Day3.isAvailable}
          onChange={() => {
            updateDay(3);
          }}
        />
        <Form.Check
          type="checkbox"
          label={availability.Day4.date}
          checked={availability.Day4.isAvailable}
          onChange={() => {
            updateDay(4);
          }}
        />
        <Button variant="primary">Update</Button>
        <Button variant="secondary" onClick={refreshAvailability}>
          Refresh Availability
        </Button>
      </Form>
    </>
  );
};
