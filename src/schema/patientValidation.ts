import { z } from "zod";

export const patientSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().optional(),
  name: z.string()
    .min(1, "Full name is required")
    .max(30, "Name must be at most 30 characters")
    .refine((val) => !val.startsWith(" "), "Name cannot start with a space"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required" }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { message: "Blood group is required" }),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\+?\d{10,}$/, "Please enter a valid phone number (at least 10 digits)"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pin: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits").optional().or(z.literal("")),
  allergies: z.string().min(1, "Allergies information is required"),
  conditions: z.string().min(1, "Medical conditions information is required"),
  surgeries: z.string().optional(),
  medications: z.string().optional(),
  contactName: z.string().min(1, "Emergency contact name is required").max(30, "Name must be at most 30 characters"),
  emergencyPhone: z.string()
    .min(1, "Emergency phone number is required")
    .regex(/^\+?\d{10,}$/, "Please enter a valid emergency phone number (at least 10 digits)"),
  relationship: z.string().optional(),
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
