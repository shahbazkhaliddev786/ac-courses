import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Singleton pattern to avoid multiple PrismaClient instances
declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    adapter,
    // Optional: Enable query logging in development
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
  });
};

export const prisma = globalThis.prisma ?? createPrismaClient();

// Only assign to global in development to persist across hot reloads
if (process.env.NODE_ENV !== 'production') {
   globalThis.prisma = prisma;
   // When you run npm run dev (or yarn dev), Next.js sets process.env.NODE_ENV to 
   // "development" for you. When you run npm run build or npm run start, Next.js 
   // sets it to "production". Actually next.js handles it automatically 
}
