// Manual schedule creation - run this in browser console if seeding fails
(async () => {
  try {
    console.log('🔧 Creating manual doctor schedule...');
    
    const { db } = await import('/src/features/db/dexie.ts');
    
    // Get first doctor
    const doctors = await db.doctors.toArray();
    if (doctors.length === 0) {
      console.error('❌ No doctors found. Please seed doctors first.');
      return;
    }
    
    const firstDoctor = doctors[0];
    console.log('📋 Using doctor:', firstDoctor.name);
    
    // Create schedule for this doctor
    const schedule = {
      id: crypto.randomUUID(),
      doctorId: firstDoctor.id,
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      lunchBreakStart: '12:00',
      lunchBreakEnd: '13:00',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.doctorSchedules.add(schedule);
    console.log('✅ Schedule created for doctor:', firstDoctor.name);
    
    // Verify
    const scheduleCount = await db.doctorSchedules.count();
    console.log('📊 Total schedules now:', scheduleCount);
    
    console.log('🔄 Refresh the page and try selecting this doctor and a date.');
    
  } catch (error) {
    console.error('❌ Error creating schedule:', error);
  }
})();
