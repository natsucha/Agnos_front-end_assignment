import { z } from "zod";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

export const patientSchema = z.object({
  firstName: requiredText("First Name"),
  middleName: z.string(),
  lastName: requiredText("Last Name"),
  dateOfBirth: requiredText("Date of Birth"),
  gender: requiredText("Gender"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone Number is required")
    .regex(/^[0-9+()\\-\\s]{8,20}$/, "Please enter a valid phone number"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  address: requiredText("Address"),
  preferredLanguage: requiredText("Preferred Language"),
  nationality: requiredText("Nationality"),
  emergencyContactName: z.string(),
  emergencyContactRelationship: z.string(),
  religion: z.string()
});

export type PatientFormValues = z.infer<typeof patientSchema>;