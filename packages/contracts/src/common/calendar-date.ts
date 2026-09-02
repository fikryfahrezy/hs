import { z } from "zod";

export const CalendarDateSchema = z.iso.date();
