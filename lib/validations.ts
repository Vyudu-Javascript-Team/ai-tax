import * as z from "zod";

export const taxReturnSchema = z.object({
  year: z.number().int().min(2000).max(new Date().getFullYear()),
  income: z.object({
    wages: z.number().min(0),
    interest: z.number().min(0),
    dividends: z.number().min(0),
    otherIncome: z.number().min(0),
  }),
  deductions: z.object({
    standardDeduction: z.number().min(0),
    itemizedDeductions: z.number().min(0),
    otherDeductions: z.number().min(0),
  }),
  taxCredits: z.object({
    childTaxCredit: z.number().min(0),
    earnedIncomeCredit: z.number().min(0),
    otherCredits: z.number().min(0),
  }),
});

export const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

export const expertConsultationSchema = z.object({
  expertId: z.string().min(1, "Expert selection is required"),
  date: z.date(),
  slotId: z.string().min(1, "Time slot selection is required"),
});

export const documentUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "File size must be 5MB or less",
  }),
  taxReturnId: z.string().min(1, "Tax return ID is required"),
});