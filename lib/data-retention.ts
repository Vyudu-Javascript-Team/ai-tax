import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function applyDataRetentionPolicies() {
  const sevenYearsAgo = new Date();
  sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

  // Delete tax returns older than 7 years
  await prisma.taxReturn.deleteMany({
    where: {
      createdAt: {
        lt: sevenYearsAgo,
      },
    },
  });

  // Delete documents associated with deleted tax returns
  await prisma.document.deleteMany({
    where: {
      taxReturn: null,
    },
  });

  // Anonymize user data for inactive accounts
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  await prisma.user.updateMany({
    where: {
      lastLoginAt: {
        lt: oneYearAgo,
      },
    },
    data: {
      email: "anonymized@example.com",
      firstName: "Anonymized",
      lastName: "User",
    },
  });

  console.log("Data retention policies applied successfully");
}

export async function scheduleDataRetention() {
  // Run data retention policies daily at 3 AM
  const now = new Date();
  const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0, 0);
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilExecution = scheduledTime.getTime() - now.getTime();

  setTimeout(async () => {
    await applyDataRetentionPolicies();
    scheduleDataRetention(); // Schedule the next execution
  }, timeUntilExecution);
}