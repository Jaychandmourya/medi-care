import { z } from 'zod'

// Doctor form validation schema
export const doctorFormSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens and apostrophes'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens and apostrophes'),

  middleName: z.string()
    .max(50, 'Middle name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'Middle name can only contain letters, spaces, hyphens and apostrophes')
    .optional(),

  specialty: z.string()
    .max(100, 'Specialty must be less than 100 characters')
    .optional(),

  phone: z.string()
    .regex(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number')
    .optional(),

  contact: z.string()
    .max(200, 'Contact information must be less than 200 characters')
    .optional(),

  email: z.string()
    .email('Please enter a valid email address')
    .optional(),

  city: z.string()
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'City can only contain letters, spaces, hyphens and apostrophes')
    .optional(),

  state: z.string()
    .max(2, 'State must be exactly 2 characters')
    .regex(/^[a-zA-Z]{2}$/, 'State must contain exactly 2 letters')
    .optional(),

  country: z.string()
    .max(50, 'County must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'County can only contain letters, spaces, hyphens and apostrophes')
    .optional(),

  postalCode: z.string()
    .regex(/^(\d{5}(-\d{4})?|\d{9})$/, 'Please enter a valid postal code (e.g., 780285333, 12345-6789)')
    .optional(),

  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional(),

  credential: z.string()
    .max(20, 'Credential must be less than 20 characters')
    .regex(/^[a-zA-Z\s.\-]+$/, 'Credential can only contain letters, spaces, dots and hyphens')
    .optional(),

  gender: z.enum(['male', 'female', 'other'], 'Please select a valid gender')
    .optional()
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

  county: z.string()
    .max(50, 'County must be less than 50 characters')
    .optional(),

  contact: z.string()
    .max(200, 'Contact must be less than 200 characters')
    .optional()
})

// Type inference
export type DoctorFormData = z.infer<typeof doctorFormSchema>
export type DoctorSearchFormData = z.infer<typeof doctorSearchSchema>
