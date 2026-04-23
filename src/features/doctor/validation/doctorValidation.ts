import { z } from 'zod'

// Doctor form validation schema
export const doctorFormSchema = z.object({
  id: z.string().optional(),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(15, 'First name must be less than 15 characters')
    .transform((val) => val.trim()),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(15, 'Last name must be less than 15 characters')
    .transform((val) => val.trim()),

  middleName: z.string()
    .max(50, 'Middle name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'Middle name can only contain letters, spaces, hyphens and apostrophes')
    .optional(),

  credential: z.string()
    .max(50, 'Credential must be less than 50 characters')
    .optional(),

  gender: z.enum(['M', 'F', 'O']).refine((val) => val !== undefined, {
    message: 'Please select a gender'
  }),

  specialty: z.string()
    .min(1, 'Specialty is required')
    .max(100, 'Specialty must be less than 100 characters'),

  department: z.string()
    .min(1, 'Department is required')
    .max(50, 'Department must be less than 50 characters'),

  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional(),

  city: z.string()
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'City can only contain letters, spaces, hyphens and apostrophes')
    .optional()
    .or(z.literal('')),

  state: z.string()
    .max(50, 'State must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'State can only contain letters, spaces, hyphens and apostrophes')
    .optional()
    .or(z.literal('')),

  country: z.string()
    .max(50, 'Country must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Country can only contain letters, spaces, hyphens and apostrophes')
    .optional(),

  postalCode: z.string()
    .max(10, 'Postal code cannot exceed 10 characters')
    .optional(),

  phone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),

  contact: z.string()
    .min(1, 'Phone number is required')
    .max(15, 'Phone number must be less than 15 characters')
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please enter a valid phone number'),

  email: z.string()
    .max(100, 'Email must be less than 100 characters')
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Please enter a valid email address'
    }),

  addedAt: z.string().optional(),
})

// Search form validation schema
export const doctorSearchSchema = z.object({
  firstName: z.string()
    .min(1, 'First name must be at least 1 character')
    .max(50, 'First name must be less than 50 characters')
    .optional(),

  lastName: z.string()
    .min(1, 'Last name must be at least 1 character')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),

  taxonomy: z.string()
    .max(100, 'Specialty must be less than 100 characters')
    .optional(),

  city: z.string()
    .max(50, 'City must be less than 50 characters')
    .optional(),

  state: z.string()
    .max(2, 'State must be exactly 2 characters')
    .regex(/^[a-zA-Z]{2}$/, 'State must contain exactly 2 letters')
    .optional(),

  country: z.string()
    .max(50, 'County must be less than 50 characters')
    .optional(),

  contact: z.string()
    .max(200, 'Contact must be less than 200 characters')
    .optional()
})

// Type inference
export type DoctorFormData = z.infer<typeof doctorFormSchema>
export type DoctorSearchFormData = z.infer<typeof doctorSearchSchema>
