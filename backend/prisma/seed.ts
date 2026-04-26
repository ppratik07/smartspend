import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: '#E07A5F' },
  { name: 'Travel', icon: 'airplane', color: '#3D405B' },
  { name: 'Rent', icon: 'home', color: '#81B29A' },
  { name: 'Utilities', icon: 'flash', color: '#F2CC8F' },
  { name: 'Shopping', icon: 'bag', color: '#6B4226' },
  { name: 'Dining & Food', icon: 'restaurant-outline', color: '#2D6A4F' },
  { name: 'Transport', icon: 'car', color: '#457B9D' },
  { name: 'Health', icon: 'medical', color: '#E63946' },
  { name: 'Entertainment', icon: 'musical-notes', color: '#A8DADC' },
  { name: 'Salary', icon: 'cash', color: '#52B788' },
  { name: 'Freelance', icon: 'laptop', color: '#74C69D' },
  { name: 'Investment', icon: 'trending-up', color: '#1B4332' },
  { name: 'Others', icon: 'ellipsis-horizontal', color: '#ADB5BD' },
];

async function main() {
  console.log('Seeding default categories...');

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        // Use a composite key workaround via name for system categories
        id: `default-${cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`,
      },
      update: {},
      create: {
        id: `default-${cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
        userId: null,
      },
    });
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
