import { z } from 'zod'

export const achievementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }, 'Invalid start date'),
    
  endDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }, 'Invalid end date'),
    
  durationHours: z
    .number()
    .min(0, 'Duration cannot be negative')
    .max(100000, 'Duration seems too high')
    .optional(),
    
  categoryId: z
    .string()
    .min(1, 'Category is required'),
    
  impact: z
    .string()
    .max(1000, 'Impact must be less than 1000 characters')
    .optional(),
    
  skillsUsed: z
    .array(z.string())
    .min(0)
    .max(20, 'Maximum 20 skills allowed'),
    

    
   status: z
     .enum(['idea', 'concept', 'usable', 'complete'], {
       message: 'Status must be idea, concept, usable, or complete'
     }),
     
   githubUrl: z
     .string()
     .url('Must be a valid URL')
     .optional()
     .or(z.literal('')),
    
   tags: z
     .array(z.string())
     .max(10, 'Maximum 10 tags allowed')
     .min(0)
}).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true
    return new Date(data.startDate) <= new Date(data.endDate)
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
)

export type AchievementFormData = z.infer<typeof achievementSchema>