import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@aitaxprep.com' },
    update: {},
    create: {
      email: 'admin@aitaxprep.com',
      hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create feature flags
  const featureFlags = [
    {
      name: 'AI_ASSISTANT',
      description: 'Enable AI tax assistant feature',
      category: 'Core',
      enabled: true,
    },
    {
      name: 'DOCUMENT_SCANNING',
      description: 'Enable document scanning feature',
      category: 'Core',
      enabled: true,
    },
    {
      name: 'EXPERT_CONSULTATION',
      description: 'Enable expert consultation booking',
      category: 'Premium',
      enabled: true,
    },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {},
      create: flag,
    });
  }

  // Create tax deadlines
  const taxDeadlines = [
    {
      title: 'Individual Tax Return Deadline',
      date: new Date('2024-04-15'),
    },
    {
      title: 'Estimated Tax Payment Q1',
      date: new Date('2024-04-15'),
    },
    {
      title: 'Estimated Tax Payment Q2',
      date: new Date('2024-06-15'),
    },
    {
      title: 'Estimated Tax Payment Q3',
      date: new Date('2024-09-15'),
    },
    {
      title: 'Estimated Tax Payment Q4',
      date: new Date('2024-01-15'),
    },
  ];

  for (const deadline of taxDeadlines) {
    await prisma.taxDeadline.create({
      data: deadline,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });