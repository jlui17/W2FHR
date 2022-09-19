import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
import { Availability, BASE_API_ENDPOINT } from "../../helpers/API_CONSTANTS";

const useGetAvailabilityByEmployeeId = (employeeId: string) => {
  return useQuery(["getAvailabilityByEmployeeId"], async () => {
    const employeeAvailabilityEndpoint = `${BASE_API_ENDPOINT}/availability/${employeeId}`;
    const { data } = await axios.get(employeeAvailabilityEndpoint);

    return data;
  });
};

export const AvailabilityWidget = () => {
  const queryClient = useQueryClient();
  const { data, error, isFetching } =
    useGetAvailabilityByEmployeeId("w2fnm170007");

  const employeeAvailability: Availability = data;
  console.log(employeeAvailability, isFetching);

  if (isFetching) {
    return <div>Loading</div>;
  }
  return (
    <div>
      Day1: {String(employeeAvailability.Day1)} <br />
      Day2: {String(employeeAvailability.Day2)} <br />
      Day3: {String(employeeAvailability.Day3)} <br />
      Day4: {String(employeeAvailability.Day4)}
    </div>
  );
};
