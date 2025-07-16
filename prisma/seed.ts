import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data in proper order to handle foreign key constraints
  await prisma.inventoryItem.deleteMany();
  await prisma.homeAccess.deleteMany();
  await prisma.home.deleteMany();
  await prisma.recommendedInventoryItem.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        password: hashedPassword,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Seed homes
  const homes = await Promise.all([
    prisma.home.create({
      data: {
        name: 'The Doe Family Home',
        numberOfAdults: 2,
        numberOfChildren: 2,
        numberOfPets: 1,
        ownerId: users[0].id, // John Doe
      },
    }),
    prisma.home.create({
      data: {
        name: 'Jane\'s Apartment',
        numberOfAdults: 1,
        numberOfChildren: 0,
        numberOfPets: 0,
        ownerId: users[1].id, // Jane Smith
      },
    }),
    prisma.home.create({
      data: {
        name: 'The Johnson Household',
        numberOfAdults: 2,
        numberOfChildren: 3,
        numberOfPets: 2,
        ownerId: users[2].id, // Bob Johnson
      },
    }),
  ]);

  console.log(`✅ Created ${homes.length} homes`);

  // Seed home access (give Jane access to John's home as ADMIN, Alice as MEMBER)
  const homeAccesses = await Promise.all([
    prisma.homeAccess.create({
      data: {
        userId: users[1].id, // Jane Smith
        homeId: homes[0].id, // John's home
        role: 'ADMIN',
      },
    }),
    prisma.homeAccess.create({
      data: {
        userId: users[3].id, // Alice Brown
        homeId: homes[0].id, // John's home
        role: 'MEMBER',
      },
    }),
    prisma.homeAccess.create({
      data: {
        userId: users[0].id, // John Doe
        homeId: homes[1].id, // Jane's apartment
        role: 'MEMBER',
      },
    }),
  ]);

  console.log(`✅ Created ${homeAccesses.length} home access records`);

  // Seed inventory items (distributed across different homes)
  const inventoryItems = await Promise.all([
    // Items for John's home
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Beans',
        quantity: 12,
        expirationDate: new Date('2025-12-31'),
        homeId: homes[0].id, // John's home
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Rice',
        quantity: 5,
        expirationDate: new Date('2026-06-15'),
        homeId: homes[0].id, // John's home
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Pasta',
        quantity: 15,
        expirationDate: new Date('2026-03-10'),
        homeId: homes[0].id, // John's home
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Corn',
        quantity: 6,
        expirationDate: new Date('2025-11-15'),
        homeId: homes[0].id, // John's home
      },
    }),
    
    // Items for Jane's apartment
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Beans',
        quantity: 4,
        expirationDate: new Date('2025-08-20'),
        homeId: homes[1].id, // Jane's apartment
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Rice',
        quantity: 2,
        expirationDate: new Date('2025-12-01'),
        homeId: homes[1].id, // Jane's apartment
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Flour',
        quantity: 1,
        expirationDate: new Date('2025-09-30'),
        homeId: homes[1].id, // Jane's apartment
      },
    }),
    
    // Items for Bob's household
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Tomatoes',
        quantity: 10,
        expirationDate: new Date('2026-01-20'),
        homeId: homes[2].id, // Bob's household
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Oats',
        quantity: 4,
        expirationDate: new Date('2025-10-05'),
        homeId: homes[2].id, // Bob's household
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Pasta',
        quantity: 7,
        expirationDate: new Date('2025-07-12'),
        homeId: homes[2].id, // Bob's household
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Canned Soup',
        quantity: 9,
        expirationDate: new Date('2026-02-28'),
        homeId: homes[2].id, // Bob's household
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Quinoa',
        quantity: 3,
        expirationDate: new Date('2026-04-18'),
        homeId: homes[2].id, // Bob's household
      },
    }),
  ]);

  console.log(`✅ Created ${inventoryItems.length} inventory items`);

  // Seed recommended inventory items
  const recommendedItems = await Promise.all([
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Water (per person)',
        expiresIn: 365, // 1 year
        quantity: 14, // 2 weeks worth (1 gallon per day)
        isOptional: false,
        description: 'Essential drinking water supply. Store 1 gallon per person per day for at least 2 weeks.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Rice',
        expiresIn: 1095, // 3 years
        quantity: 20, // 20 lbs
        isOptional: false,
        description: 'Long-term carbohydrate source. Store in airtight containers to prevent pests.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Canned Beans',
        expiresIn: 1095, // 3 years
        quantity: 24, // 24 cans
        isOptional: false,
        description: 'Protein-rich canned goods with long shelf life. Variety pack recommended.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'First Aid Kit',
        expiresIn: 1825, // 5 years
        quantity: 1,
        isOptional: false,
        description: 'Comprehensive first aid supplies including bandages, antiseptic, pain relievers, and emergency medications.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Flashlight',
        expiresIn: 3650, // 10 years
        quantity: 3,
        isOptional: false,
        description: 'Battery-powered or hand-crank flashlights. Keep extra batteries.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Solar Power Bank',
        expiresIn: 1825, // 5 years
        quantity: 1,
        isOptional: true,
        description: 'Solar-powered device charger for phones and small electronics during extended outages.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Water Purification Tablets',
        expiresIn: 1460, // 4 years
        quantity: 100,
        isOptional: true,
        description: 'Emergency water treatment for questionable water sources. Backup to stored water.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Freeze-Dried Meals',
        expiresIn: 9125, // 25 years
        quantity: 72, // 3 days worth for family of 4
        isOptional: true,
        description: 'Long-term emergency meals with extended shelf life. Just add water.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Emergency Radio',
        expiresIn: 3650, // 10 years
        quantity: 1,
        isOptional: false,
        description: 'Battery or hand-crank radio for emergency broadcasts and weather alerts.',
      },
    }),
    prisma.recommendedInventoryItem.create({
      data: {
        name: 'Sleeping Bags',
        expiresIn: 3650, // 10 years
        quantity: 4, // Family of 4
        isOptional: true,
        description: 'Cold-weather sleeping bags rated for local winter temperatures.',
      },
    }),
  ]);

  console.log(`✅ Created ${recommendedItems.length} recommended inventory items`);

  // Display summary
  const totalUsers = await prisma.user.count();
  const totalInventoryItems = await prisma.inventoryItem.count();
  const totalRecommendedItems = await prisma.recommendedInventoryItem.count();
  
  console.log('\n📊 Database seeded successfully!');
  console.log(`   Users: ${totalUsers}`);
  console.log(`   Inventory Items: ${totalInventoryItems}`);
  console.log(`   Recommended Items: ${totalRecommendedItems}`);
  
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
