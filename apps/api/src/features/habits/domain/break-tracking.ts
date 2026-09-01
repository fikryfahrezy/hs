import { toEpochDay } from "../../../common/time/calendar";

export function cleanStreak(
  startDate: string,
  today: string,
  relapse: string | null,
): number {
  if (relapse === today) {
    return 0;
  }
  if (relapse) {
    return toEpochDay(today) - toEpochDay(relapse);
  }
  return toEpochDay(today) - toEpochDay(startDate) + 1;
}
