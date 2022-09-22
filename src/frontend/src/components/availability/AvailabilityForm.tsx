import Form from "react-bootstrap/Form";
import { Availability } from "../../helpers/API_CONSTANTS";

export interface AvailabilityFormProps {
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
}

export const AvailabilityForm = ({
  availability,
  setAvailability,
}: AvailabilityFormProps) => {
  const updateDay = (day: string) => {
    const newAvailability: Availability = { ...availability };
    switch (day) {
      case "day1":
        newAvailability.Day1 = !availability.Day1;
        break;
      case "day2":
        newAvailability.Day2 = !availability.Day2;
        break;
      case "day3":
        newAvailability.Day3 = !availability.Day3;
        break;
      case "day4":
        newAvailability.Day4 = !availability.Day4;
        break;
    }
    setAvailability(newAvailability);
  };

  return (
    <>
      <Form>
        <Form.Check
          type="checkbox"
          label="Day 1"
          checked={availability.Day1}
          onChange={() => {
            updateDay("day1");
          }}
        />
        <Form.Check
          type="checkbox"
          label="Day 2"
          checked={availability.Day2}
          onChange={() => {
            updateDay("day2");
          }}
        />
        <Form.Check
          type="checkbox"
          label="Day 3"
          checked={availability.Day3}
          onChange={() => {
            updateDay("day3");
          }}
        />
        <Form.Check
          type="checkbox"
          label="Day 4"
          checked={availability.Day4}
          onChange={() => {
            updateDay("day4");
          }}
        />
      </Form>
      <br />
      Day1: {String(availability.Day1)}
      Day2: {String(availability.Day2)}
      Day3: {String(availability.Day3)}
      Day4: {String(availability.Day4)}
    </>
  );
};
