// Test script to verify database delete functionality
import { doctorDBOperations } from './src/services/doctorServices.js';

async function testDeleteFunction() {
  console.log('Testing doctor delete functionality...');
  
  try {
    // Get all doctors first
    const doctors = await doctorDBOperations.getAll();
    console.log(`Found ${doctors.length} doctors in database`);
    
    if (doctors.length > 0) {
      const firstDoctor = doctors[0];
      console.log('First doctor:', firstDoctor);
      
      // Test delete
      console.log(`Deleting doctor with ID: ${firstDoctor.id}`);
      await doctorDBOperations.remove(firstDoctor.id);
      
      // Verify deletion
      const remainingDoctors = await doctorDBOperations.getAll();
      console.log(`After deletion: ${remainingDoctors.length} doctors remaining`);
      
      // Check if specific doctor was deleted
      const deletedDoctor = remainingDoctors.find(d => d.id === firstDoctor.id);
      if (!deletedDoctor) {
        console.log('✅ Delete functionality working correctly!');
      } else {
        console.log('❌ Delete functionality failed - doctor still exists');
      }
    } else {
      console.log('No doctors in database to test deletion');
    }
  } catch (error) {
    console.error('❌ Error testing delete functionality:', error);
  }
}

testDeleteFunction();
