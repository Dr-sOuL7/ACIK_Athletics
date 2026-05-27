import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  category: z.string().optional(),
});

try {
  eventSchema.parse({
    title: "Test Event",
    description: "",
    location: "",
    event_date: "",
    event_time: "",
    category: "",
  });
  console.log("Validation passed");
} catch (e) {
  console.log("Validation failed", e);
}
