import { AvailabilityForm, AvailabilityFormProps } from "./AvailabilityForm";

interface AvailabilityWidgetProps extends AvailabilityFormProps {
  isLoading: boolean;
}

export const AvailabilityWidget = (props: AvailabilityWidgetProps) => {
  if (props.isLoading) return <p>Loading...</p>;

  return <AvailabilityForm {...props} />;
};
