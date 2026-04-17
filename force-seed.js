// Force seed data - run this in browser console
(async () => {
  try {

    // Clear existing data
    const { db } = await import('/src/features/db/dexie.ts');
    await db.delete();
    await db.open();

    // Seed fresh data
    const { seedAllData } = await import('/src/data/seedData.ts');
    await seedAllData();

    // Verify data
    const scheduleCount = await db.doctorSchedules.count();

    if (scheduleCount === 0) {
      console.error('❌ No schedules created - there might be an issue with the seed function');
    } else {
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
