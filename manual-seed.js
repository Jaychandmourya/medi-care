// Manual data seeding script - copy and paste this into browser console
(async () => {
  try {
    console.log('🔄 Manual data seeding started...');
    
    // Import the seed function
    const { seedAllData } = await import('/src/data/seedData.ts');
    
    // Run the seeding
    await seedAllData();
    
    console.log('✅ Data seeding completed!');
    
    // Refresh the page to see the changes
    setTimeout(() => {
      console.log('🔄 Refreshing page...');
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error during manual seeding:', error);
  }
})();
