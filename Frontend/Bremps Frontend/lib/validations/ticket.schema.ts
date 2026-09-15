import { z } from "zod";

export const categoryStepSchema = z.object({
  categoryId: z.string().min(1, "Please select a help category"),
});

export const describeStepSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(20, "Please describe the problem in at least 20 characters")
    .max(2000, "Description must be under 2000 characters"),
  urgency: z.enum(["low", "normal", "urgent"], {
    required_error: "Please select an urgency level",
  }),
  studentName: z.string().min(2, "Name is required"),
  studentEmail: z.string().email("Invalid campus email address"),
  studentId: z.string().min(4, "Student ID is required"),
  program: z.string().min(2, "Program/Department is required"),
  phone: z
    .string()
    .regex(
      /^(?:\+233|233|0)(?:2[0-9]|5[0-9]|20|24|27|50|54|55|59)[0-9]{7}$/,
      "Enter a valid Ghana phone number"
    ),
});

export const newTicketFormSchema = categoryStepSchema.merge(describeStepSchema);

export type NewTicketFormData = z.infer<typeof newTicketFormSchema>;

export const messageComposerSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(3000),
});

export type MessageComposerData = z.infer<typeof messageComposerSchema>;
