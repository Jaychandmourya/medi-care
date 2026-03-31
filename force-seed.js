// Force seed data - run this in browser console
(async () => {
  try {
    console.log('🔧 Force seeding data...');
    
    // Clear existing data
    const { db } = await import('/src/features/db/dexie.ts');
    await db.delete();
    await db.open();
    console.log('✅ Database cleared');
    
    // Seed fresh data
    const { seedAllData } = await import('/src/data/seedData.ts');
    await seedAllData();
    console.log('✅ Data seeded successfully');
    
    // Verify data
    const doctorCount = await db.doctors.count();
    const scheduleCount = await db.doctorSchedules.count();
    const patientCount = await db.patients.count();
    
    console.log('📊 Data verification:', {
      doctors: doctorCount,
      schedules: scheduleCount,
      patients: patientCount
    });
    
    if (scheduleCount === 0) {
      console.error('❌ No schedules created - there might be an issue with the seed function');
    } else {
      console.log('✅ All good! Refresh the page and try booking an appointment.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
