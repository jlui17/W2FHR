import {
  convertSchedulingDataFromAPI,
  isSchedulingDataFromAPI,
  SchedulingData,
} from "@/components/Scheduling/helpers/hooks";
import { z } from "zod";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { API_URLS, dateToFormatForApi, ERROR_MESSAGES } from "@/components/common/constants";

interface NewScheduleRequest {
  idToken: string;
  newSchedule: NewScheduleSchemaFormData;
  date: Date;
}

interface ShiftForScheduling {
  date: string;
  employee: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
}

function createPostNewScheduleRequestBody(
  shifts: NewScheduleSchemaFormData,
  date: Date,
): {
  shifts: ShiftForScheduling[];
} {
  return {
    shifts: shifts.shifts.map((shift) => ({
      date: dateToFormatForApi(date),
      employee: shift.employee,
      shiftTitle: shift.shiftTitle,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
    })),
  };
}

export function usePostNewSchedule(p: {
  onSuccess: () => void;
  onError: (err: Error) => void;
}): UseMutationResult<void, Error, NewScheduleRequest, unknown> {
  async function postNewSchedule(p: NewScheduleRequest): Promise<void> {
    const response = await fetch(API_URLS.SCHEDULING, {
      headers: {
        Authorization: `Bearer ${p.idToken}`,
      },
      method: "POST",
      mode: "cors",
      body: JSON.stringify(createPostNewScheduleRequestBody(p.newSchedule, p.date)),
    });

    switch (response.status) {
      case 200:
        return Promise.resolve();
      case 403:
        return Promise.reject(new Error(ERROR_MESSAGES.UPDATE_DISABLED));
      case 404:
        return Promise.reject(new Error(ERROR_MESSAGES.EMPLOYEE_NOT_FOUND));
      default:
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER.GENERAL_ERROR));
    }
  }

  return useMutation({
    mutationFn: (v: NewScheduleRequest) => postNewSchedule(v),
    onSuccess: p.onSuccess,
    onError: p.onError,
  });
}

export async function fetchData(): Promise<SchedulingData> {
  if (!isSchedulingDataFromAPI(mockData)) {
    throw new Error("Invalid data from API");
  }
  return Promise.resolve(convertSchedulingDataFromAPI(mockData));
}

const NewScheduleSchema = z.object({
  shifts: z.array(
    z.object({
      employee: z.string(),
      shiftTitle: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      breakDuration: z.string(),
    }),
  ),
});
export type NewScheduleSchemaFormData = z.infer<typeof NewScheduleSchema>;

export function getGamesTemplate(): NewScheduleSchemaFormData {
  return {
    shifts: [
      ...Array.from(
        [
          "1. High Striker",
          "2. Long Range Basketball",
          "2. Long Range Basketball",
          "3. Balloons",
          "3. Balloons",
          "4. Naughty Clowns",
          "5. Basketball",
          "6. Toilets",
          "7. Guns",
          "8. Knockoff",
          "9. Oneball",
          "10. Ladders",
          "10. Ladders",
          "11. Fishing Ducks",
          "12. Stand-A-Bottle",
          "13. Birthday",
          "13. Birthday",
          "14. Ring Toss",
          "14. Ring Toss",
          "14. Ring Toss",
          "15. Bean Bag Balloons",
          "15. Bean Bag Balloons",
          "16. Wheels",
          "17. Pool",
          "18. Stick Catcher",
          "18. Stick Catcher",
          "19. Bowler Roller",
          "20. Tubs",
          "21. Water Racer",
          "22. Bar Hang",
          "Games Supervisor",
          "Games Supervisor",
          "Games Supervisor",
          "Games Supervisor",
          "Assistant Manager",
          "General Manager",
          "Operations Manager",
        ].map((shiftTitle) => {
          if (shiftTitle.endsWith("Supervisor") || shiftTitle.endsWith("Manager")) {
            return {
              employee: "",
              shiftTitle: shiftTitle,
              startTime: "6:00 pm",
              endTime: "12:15 am",
              breakDuration: "00:30:00",
            };
          }

          return {
            employee: "",
            shiftTitle: shiftTitle,
            startTime: "6:45 pm",
            endTime: "12:15 am",
            breakDuration: "00:30:00",
          };
        }),
      ),
    ],
  };
}

export function getBlankTemplate(): NewScheduleSchemaFormData {
  return {
    shifts: [
      {
        employee: "",
        shiftTitle: "",
        startTime: "",
        endTime: "",
        breakDuration: "",
      },
    ],
  };
}

export function getWWTemplate(): NewScheduleSchemaFormData {
  return {
    shifts: [
      ...Array.from(
        [
          "Water Walkers Attendant",
          "Water Walkers Attendant",
          "Water Walkers Attendant",
          "Water Walkers Breaker",
          "Water Walkers Supervisor",
          "Water Walkers Supervisor",
        ].map((shiftTitle) => {
          if (shiftTitle.endsWith("Breaker")) {
            return {
              employee: "",
              shiftTitle,
              startTime: "7:30 pm",
              endTime: "12:15 am",
              breakDuration: "00:00:00",
            };
          }

          return {
            employee: "",
            shiftTitle,
            startTime: "6:45 pm",
            endTime: "12:15 am",
            breakDuration: "00:30:00",
          };
        }),
      ),
    ],
  };
}

const mockData: unknown = {
  availability: {
    "Friday, November 1, 2024": [
      "Anthony Bui (w2fnm170007)",
      "Jaden Konishi (w2fnm150009)",
      "Yi Jia Pan (w2fnm220062)",
      "Timmy Nguyen (w2fnm230040)",
      "Ethan Pham (w2fnm220007)",
      "Katie Rose (w2fnm180028)",
      "Annie Zhang (w2fnm180019)",
      "Adrian Lee (w2fnm220046)",
      "Kyle Yabut (w2fnm220013)",
      "Jason Zhao (w2fnm220059)",
      "Mischa Pollock (w2fnm230012)",
      "Jeffrey Li (w2fnm190025)",
      "Kalman Jong (w2fnm220018)",
      "Vivian Hsu (w2fnm190016)",
      "Vincent Chen (w2fnm220008)",
      "Piper Kastner-White (w2fnm240017)",
      "Amanda Ren (w2fnm240027)",
      "Koby Yu Sin Chan (w2fnm240032)",
      "Jianhan [Kevin] Chen (w2fnm240036)",
      "Calista Konishi (w2fnm170041)",
    ],
    "Monday, November 04, 2024": [
      "Anthony Bui (w2fnm170007)",
      "Luca Huynh (w2fnm220027)",
      "Nathaniel Choo (w2fnm220044)",
      "Pak Him Lai (w2fnm230008)",
      "Vicky Chao (w2fnm230033)",
      "Alexandra Ready (w2fnm220070)",
      "Timmy Nguyen (w2fnm230040)",
      "Angela Huang (w2fnm230026)",
      "Ethan Pham (w2fnm220007)",
      "Annie Zhang (w2fnm180019)",
      "Adrian Lee (w2fnm220046)",
      "Kyle Yabut (w2fnm220013)",
      "Jeffrey Li (w2fnm190025)",
      "Andre Fuentes (w2fnm230019)",
      "Trevor Chan (w2fnm240004)",
      "Jasmine de Boda (w2fnm240008)",
      "Amanda Ren (w2fnm240027)",
      "Koby Yu Sin Chan (w2fnm240032)",
      "Angus Chan (w2fnm240033)",
      "Jianhan [Kevin] Chen (w2fnm240036)",
      "Carol Xia (w2fnm240038)",
    ],
    "Saturday, November 02, 2024": [
      "Jaden Konishi (w2fnm150009)",
      "Mariel Nanadiego (w2fnm230028)",
      "Nathaniel Choo (w2fnm220044)",
      "Vicky Chao (w2fnm230033)",
      "Shreya Shrestha (w2fnm230031)",
      "Timmy Nguyen (w2fnm230040)",
      "Ethan Pham (w2fnm220007)",
      "Annie Zhang (w2fnm180019)",
      "Adrian Lee (w2fnm220046)",
      "Kyle Yabut (w2fnm220013)",
      "Mischa Pollock (w2fnm230012)",
      "Jeffrey Li (w2fnm190025)",
      "Trevor Tam (w2fnm220029)",
      "Vincent Chen (w2fnm220008)",
      "Andre Fuentes (w2fnm230019)",
      "Thenushaa Balasingam (w2fnm230013)",
      "Trevor Chan (w2fnm240004)",
      "Rachelle Ng (w2fnm240006)",
      "Anthony Choo (w2fnm240007)",
      "Piper Kastner-White (w2fnm240017)",
      "Amanda Ren (w2fnm240027)",
      "Simone Lin (w2fnm240028)",
      "Koby Yu Sin Chan (w2fnm240032)",
      "Jianhan [Kevin] Chen (w2fnm240036)",
      "Carol Xia (w2fnm240038)",
      "Angus Hin Ching Chan (w2fnm240040)",
      "Felicia Bui (w2fnm240041)",
      "Calista Konishi (w2fnm170041)",
    ],
    "Sunday, November 03, 2024": [
      "Anthony Bui (w2fnm170007)",
      "Jaden Konishi (w2fnm150009)",
      "Timmy Nguyen (w2fnm230040)",
      "Ethan Pham (w2fnm220007)",
      "Katie Rose (w2fnm180028)",
      "Annie Zhang (w2fnm180019)",
      "Kyle Yabut (w2fnm220013)",
      "Mischa Pollock (w2fnm230012)",
      "Jeffrey Li (w2fnm190025)",
      "Kalman Jong (w2fnm220018)",
      "Andre Fuentes (w2fnm230019)",
      "Rachelle Ng (w2fnm240006)",
      "Jasmine de Boda (w2fnm240008)",
      "Koby Yu Sin Chan (w2fnm240032)",
      "Jianhan [Kevin] Chen (w2fnm240036)",
      "Carol Xia (w2fnm240038)",
      "Angus Hin Ching Chan (w2fnm240040)",
    ],
  },
  metadata: {
    shiftTitles: [
      "Office Work (Games)",
      "Set Up (Games)",
      "1. High Striker",
      "2. Long Range Basketball",
      "3. Balloons",
      "4. Naughty Clowns",
      "5. Basketball",
      "6. Toilets",
      "7. Guns",
      "8. Knockoff",
      "9. Oneball",
      "10. Ladders",
      "11. Fishing Ducks",
      "12. Stand-A-Bottle",
      "13. Birthday",
      "14. Ring Toss",
      "15. Bean Bag Balloons",
      "16. Wheels",
      "17. Pool",
      "18. Stick Catcher",
      "19. Bowler Roller",
      "20. Tubs",
      "21. Water Racer",
      "22. Bar Hang",
      "Social Content Creator",
      "Office Hours (MISC)",
      "Games Supervisor",
      "Tear Down (PH)",
      "Assistant Manager",
      "General Manager",
      "Operations Manager",
      "Water Walkers Attendant",
      "FunPass Ambassador",
      "Water Walkers Breaker",
      "Water Walkers (Games Helper)",
      "Water Walkers Supervisor",
      "Prize Hut 360 Operator",
      "Prize Hut Cashier",
      "Prize Hut Attendant",
      "Tear Down (WW)",
      "Set Up (WW)",
      "Office Work (WW)",
      "Tear Down (Games)",
      "Training Day (Games)",
      "Orientation Day (Games)",
      "Orientation Day (Water Walkers)",
      "Training Day (Water Walkers)",
      "Games Helper",
      "Games Helper (WW SUP)",
      "Games Supervisor (Hybrid)",
      "Set Up (PH)",
      "Games Helper (WW)",
      "Set Up (TFP)",
      "Office Work (TFP)",
      "Set Up (TL)",
      "Office Work (TL)",
      "23. Pulley Path",
      "19. Kick the Cans",
      "23. Lucky Ducks",
    ],
    shiftTimes: [
      "12:00 am",
      "12:15 am",
      "12:30 am",
      "12:45 am",
      "1:00 am",
      "1:15 am",
      "1:30 am",
      "1:45 am",
      "2:00 am",
      "2:15 am",
      "2:30 am",
      "2:45 am",
      "3:00 am",
      "3:15 am",
      "3:30 am",
      "3:45 am",
      "4:00 am",
      "4:15 am",
      "4:30 am",
      "4:45 am",
      "5:00 am",
      "5:15 am",
      "5:30 am",
      "5:45 am",
      "6:00 am",
      "6:15 am",
      "6:30 am",
      "6:45 am",
      "7:00 am",
      "7:15 am",
      "7:30 am",
      "7:45 am",
      "8:00 am",
      "8:15 am",
      "8:30 am",
      "8:45 am",
      "9:00 am",
      "9:15 am",
      "9:30 am",
      "9:45 am",
      "10:00 am",
      "10:15 am",
      "10:30 am",
      "10:45 am",
      "11:00 am",
      "11:15 am",
      "11:30 am",
      "11:45 am",
      "12:00 pm",
      "12:15 pm",
      "12:30 pm",
      "12:45 pm",
      "1:00 pm",
      "1:15 pm",
      "1:30 pm",
      "1:45 pm",
      "2:00 pm",
      "2:15 pm",
      "2:30 pm",
      "2:45 pm",
      "3:00 pm",
      "3:15 pm",
      "3:30 pm",
      "3:45 pm",
      "4:00 pm",
      "4:15 pm",
      "4:30 pm",
      "4:45 pm",
      "5:00 pm",
      "5:15 pm",
      "5:30 pm",
      "5:45 pm",
      "6:00 pm",
      "6:15 pm",
      "6:30 pm",
      "6:45 pm",
      "7:00 pm",
      "7:15 pm",
      "7:30 pm",
      "7:45 pm",
      "8:00 pm",
      "8:15 pm",
      "8:30 pm",
      "8:45 pm",
      "9:00 pm",
      "9:15 pm",
      "9:30 pm",
      "9:45 pm",
      "10:00 pm",
      "10:15 pm",
      "10:30 pm",
      "10:45 pm",
      "11:00 pm",
      "11:15 pm",
      "11:30 pm",
      "11:45 pm",
    ],
    breakDurations: [
      "00:00:00",
      "00:15:00",
      "00:30:00",
      "00:45:00",
      "01:00:00",
      "01:15:00",
      "01:30:00",
      "01:45:00",
      "02:00:00",
      "02:15:00",
      "02:30:00",
      "02:45:00",
      "03:00:00",
      "03:15:00",
      "03:30:00",
      "03:45:00",
      "04:00:00",
      "04:15:00",
      "04:30:00",
      "04:45:00",
      "05:00:00",
      "05:15:00",
      "05:30:00",
      "05:45:00",
      "06:00:00",
      "06:15:00",
      "06:30:00",
      "06:45:00",
      "07:00:00",
      "07:15:00",
      "07:30:00",
      "07:45:00",
      "08:00:00",
      "08:15:00",
      "08:30:00",
      "08:45:00",
      "09:00:00",
      "09:15:00",
      "09:30:00",
      "09:45:00",
      "10:00:00",
      "10:15:00",
      "10:30:00",
      "10:45:00",
      "11:00:00",
      "11:15:00",
      "11:30:00",
      "11:45:00",
      "12:00:00",
    ],
  },
  showMonday: false,
  startOfWeek: "Friday, November 1, 2024",
  disableUpdates: false,
};
