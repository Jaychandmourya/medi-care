// Database testing utility - run this in browser console
import { patientService } from '../services/patientServices';

export async function testDatabase() {
  console.log('🧪 Testing Database Operations...');
  
  try {
    // Test 1: Clear database (optional)
    console.log('1. Clearing database...');
    await patientService.clearDatabase();
    
    // Test 2: Add a patient
    console.log('2. Adding test patient...');
    const testPatient = await patientService.addPatient({
      name: 'Test Patient',
      dob: '1990-01-01',
      gender: 'Male',
      bloodGroup: 'A+',
      phone: '1234567890',
      email: 'test@example.com',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pin: '123456',
      allergies: 'None',
      conditions: 'None',
      surgeries: '',
      medications: '',
      contactName: 'Emergency Contact',
      emergencyPhone: '0987654321',
      relationship: 'Spouse',
      photo: '',
      isActive: true,
    });
    
    console.log('✅ Patient added successfully:', testPatient);
    
    // Test 3: Get all patients
    console.log('3. Getting all patients...');
    const allPatients = await patientService.getAllPatients();
    console.log('✅ All patients:', allPatients);
    
    // Test 4: Search by patientId
    console.log('4. Searching by patientId...');
    const searchResult = await patientService.searchPatients(testPatient.patientId || '');
    console.log('✅ Search result:', searchResult);
    
    // Test 5: Get by patientId
    console.log('5. Getting patient by patientId...');
    const foundPatient = await patientService.getPatientByPatientId(testPatient.patientId || '');
    console.log('✅ Found patient:', foundPatient);
    
    console.log('🎉 All database tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  // Make it available globally for testing
  (window as any).testDatabase = testDatabase;
  console.log('💡 Run testDatabase() in console to test database operations');
}
