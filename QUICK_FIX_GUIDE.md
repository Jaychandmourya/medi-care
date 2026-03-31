# Fix Time Slot Issue - Step by Step

## Quick Fix Steps

### Step 1: Check Current Data State
Look at the DataDebugger in the top-right corner of your app. It should show:
- Doctors: 5
- Schedules: 5 (THIS IS THE KEY ONE)
- Patients: 5

### Step 2: If Schedules = 0, Run This Script
Copy and paste this into your browser console:

```javascript
// Force seed data - copy this entire block and paste in browser console
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
      console.error('❌ No schedules created - run Step 3');
    } else {
      console.log('✅ All good! Refresh the page and try booking an appointment.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

### Step 3: If Still No Schedules, Create One Manually
If Step 2 shows schedules: 0, run this:

```javascript
// Manual schedule creation - copy this into browser console
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
```

### Step 4: Test the Time Slots
1. Refresh the page
2. Open the booking modal
3. Select a doctor (any doctor)
4. Select a date (weekday)
5. You should see:
   - "Loading available slots..." briefly
   - Then time slots like: 09:00, 09:30, 10:00, etc.
   - Lunch break (12:00-13:00) should be excluded

### Step 5: Check Console Logs
Open browser console and watch for these messages:
- `🕐 BookingModal: Generating time slots for doctor: [id] on date: [date]`
- `Generating time slots for doctor: [id] on date: [date]`
- `Found schedule: [schedule object]`
- `Generated slots: [array of times]`

## What Should Happen

When you select a doctor and date:
1. Console shows "Generating time slots..."
2. Console shows the found schedule
3. Console shows the generated time slots
4. Dropdown shows available time slots

## Expected Time Slots

For a weekday (Monday-Friday), you should see:
- 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
- (12:00 and 12:30 excluded for lunch)
- 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30

## If Still Not Working

Check the console for errors and share what you see. The most common issues:
1. No doctor schedules in database
2. Date is a weekend (doctors work Mon-Fri only)
3. Database permissions issue

## Clean Up (Optional)

Once working, you can remove the DataDebugger from App.tsx and reduce console logging.
