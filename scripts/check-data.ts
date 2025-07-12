import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking seeded data...\n');

  // Check users
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });
  
  console.log('👥 Users:');
  users.forEach(user => {
    console.log(`   ${user.id}: ${user.name} (${user.email})`);
  });

  // Check inventory items
  const items = await prisma.inventoryItem.findMany({
    orderBy: [{ name: 'asc' }, { expirationDate: 'asc' }],
  });
  
  console.log('\n📦 Inventory Items:');
  items.forEach(item => {
    console.log(`   ${item.id}: ${item.name} - Qty: ${item.quantity}, Expires: ${item.expirationDate.split('T')[0]}`);
  });

  // Group by name to show duplicates
  const groupedItems = await prisma.inventoryItem.groupBy({
    by: ['name'],
    _count: { name: true },
    _sum: { quantity: true },
    orderBy: { name: 'asc' },
  });

  console.log('\n📊 Items grouped by name:');
  groupedItems.forEach(group => {
    console.log(`   ${group.name}: ${group._count.name} entries, ${group._sum.quantity} total quantity`);
  });
}

checkData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
