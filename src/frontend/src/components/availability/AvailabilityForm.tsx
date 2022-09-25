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
        newAvailability.day1.isAvailable = !availability.day1.isAvailable;
        break;
      case 2:
        newAvailability.day2.isAvailable = !availability.day2.isAvailable;
        break;
      case 3:
        newAvailability.day3.isAvailable = !availability.day3.isAvailable;
        break;
      case 4:
        newAvailability.day4.isAvailable = !availability.day4.isAvailable;
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
          label={availability.day1.date}
          checked={availability.day1.isAvailable}
          onChange={() => {
            updateDay(1);
          }}
        />
        <Form.Check
          type="checkbox"
          label={availability.day2.date}
          checked={availability.day2.isAvailable}
          onChange={() => {
            updateDay(2);
          }}
        />
        <Form.Check
          type="checkbox"
          label={availability.day3.date}
          checked={availability.day3.isAvailable}
          onChange={() => {
            updateDay(3);
          }}
        />
        <Form.Check
          type="checkbox"
          label={availability.day4.date}
          checked={availability.day4.isAvailable}
          onChange={() => {
            updateDay(4);
          }}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={!availability.canUpdate}
        >
          Update
        </Button>
        <Button variant="secondary" onClick={refreshAvailability}>
          Refresh Availability
        </Button>
      </Form>
    </>
  );
};
