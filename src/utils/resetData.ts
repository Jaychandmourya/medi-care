import { db } from '@/features/db/dexie';
import { seedAllData } from '@/data/seedData';

export const resetAndSeedData = async () => {
  try {
    console.log('Clearing existing data...');
    await db.delete();
    await db.open();

    console.log('Seeding fresh data...');
    await seedAllData();
    console.log('Data reset and seeded successfully!');

    // Reload the page to refresh the UI
    window.location.reload();
  } catch (error) {
    console.error('Error resetting data:', error);
  }
};

// Make this function available globally for debugging
(window as any).resetAndSeedData = resetAndSeedData;
