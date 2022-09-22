import { AvailabilityForm, AvailabilityFormProps } from "./AvailabilityForm";

interface AvailabilityWidgetProps extends AvailabilityFormProps {
  isLoading: boolean;
}

export const AvailabilityWidget = ({
  isLoading,
  availability,
  setAvailability,
}: AvailabilityWidgetProps) => {
  if (isLoading) return <p>Loading...</p>;

  return (
    <AvailabilityForm
      availability={availability}
      setAvailability={setAvailability}
    />
  );
};
