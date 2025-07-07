import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Seed inventory items (with some duplicate names to show the system supports it)
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Beans',
        quantity: 12,
        expirationDate: new Date('2025-12-31'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Rice',
        quantity: 5,
        expirationDate: new Date('2026-06-15'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Beans',
        quantity: 8,
        expirationDate: new Date('2025-08-20'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Rice',
        quantity: 3,
        expirationDate: new Date('2025-12-01'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Pasta',
        quantity: 15,
        expirationDate: new Date('2026-03-10'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Corn',
        quantity: 6,
        expirationDate: new Date('2025-11-15'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Flour',
        quantity: 2,
        expirationDate: new Date('2025-09-30'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Tomatoes',
        quantity: 10,
        expirationDate: new Date('2026-01-20'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Oats',
        quantity: 4,
        expirationDate: new Date('2025-10-05'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Pasta',
        quantity: 7,
        expirationDate: new Date('2025-07-12'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Soup',
        quantity: 9,
        expirationDate: new Date('2026-02-28'),
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Quinoa',
        quantity: 3,
        expirationDate: new Date('2026-04-18'),
      },
    }),
  ]);

  console.log(`✅ Created ${inventoryItems.length} inventory items`);

  // Display summary
  const totalUsers = await prisma.user.count();
  const totalInventoryItems = await prisma.inventoryItem.count();
  
  console.log('\n📊 Database seeded successfully!');
  console.log(`   Users: ${totalUsers}`);
  console.log(`   Inventory Items: ${totalInventoryItems}`);
  
  // Show duplicate item summary
  const itemGroups = await prisma.inventoryItem.groupBy({
    by: ['name'],
    _count: {
      name: true,
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  console.log('\n📦 Inventory Summary by Item Name:');
  itemGroups.forEach(group => {
    console.log(`   ${group.name}: ${group._count.name} entries, ${group._sum.quantity} total quantity`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
