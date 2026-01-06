import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Seed Admin
  await prisma.user.upsert({
    where: { email: 'admin@edulearn.com' },
    update: {},
    create: {
      email: 'admin@edulearn.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin seeded');

  // Seed Categories
  const categories = [
    { name: 'Technical Trade' },
    { name: 'Professional Trade' },
    { name: 'IT Trade'},
    { name: 'Veterinary Trade'}
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('Categories seeded');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });