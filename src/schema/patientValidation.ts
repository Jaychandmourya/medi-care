import { z } from "zod";

export const patientSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  name: z.string()
    .min(1, "Full name is required")
    .max(30, "Name must be at most 30 characters")
    .transform((val) => val.trim()),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required" }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { message: "Blood group is required" }),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\+?\d{10,}$/, "Please enter a valid phone number (at least 10 digits)"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  address: z.string().max(150, "Address must be at most 150 characters").optional(),
  city: z.string().max(30, "City must be at most 30 characters").optional(),
  state: z.string().max(30, "State must be at most 30 characters").optional(),
  pin: z.string().max(10, "Pin code must be at most 10 characters").optional().or(z.literal("")),
  allergies: z.string().min(1, "Allergies information is required"),
  conditions: z.string().min(1, "Medical conditions information is required").max(150, "Conditions must be at most 150 characters"),
  surgeries: z.string().max(200, "Surgeries must be at most 150 characters").optional(),
  medications: z.string().max(200, "Medications must be at most 150 characters").optional(),
  contactName: z.string().min(1, "Emergency contact name is required").max(30, "Name must be at most 30 characters"),
  emergencyPhone: z.string()
    .min(1, "Emergency phone number is required")
    .regex(/^\+?\d{10,}$/, "Please enter a valid emergency phone number (at least 10 digits)"),
  relationship: z.string().min(1, "Relationship is required"),
  photo: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export const stepSchemas = {
  1: patientSchema.pick({
    name: true,
    dob: true,
    gender: true,
    bloodGroup: true,
    phone: true,
    email: true,
    address: true,
    city: true,
    state: true,
    pin: true,
    photo: true,
  }),
  2: patientSchema.pick({
    allergies: true,
    conditions: true,
    surgeries: true,
    medications: true,
  }),
  3: patientSchema.pick({
    contactName: true,
    emergencyPhone: true,
    relationship: true,
  }),
};
