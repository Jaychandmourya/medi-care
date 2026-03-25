// Database fix utility - run this in browser console to completely reset database

export const completelyResetDatabase = async () => {
  console.log('🔧 Starting complete database reset...');

  try {
    // Delete all IndexedDB databases for this origin
    const databases = await indexedDB.databases();
    console.log('Found databases:', databases);

    for (const db of databases) {
      if (db.name && db.name.includes('MediCare')) {
        await new Promise<void>((resolve, reject) => {
          const deleteReq = indexedDB.deleteDatabase(db.name!);
          deleteReq.onsuccess = () => {
            console.log(`✅ Deleted database: ${db.name}`);
            resolve();
          };
          deleteReq.onerror = () => {
            console.error(`❌ Failed to delete database: ${db.name}`);
            reject(deleteReq.error);
          };
          deleteReq.onblocked = () => {
            console.log(`⏳ Database deletion blocked: ${db.name}`);
          };
        });
      }
    }

    // Clear localStorage
    localStorage.clear();
    console.log('✅ Cleared localStorage');

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ Cleared sessionStorage');

    console.log('🎉 Database reset complete! Please refresh the page.');

    // Auto-refresh after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Error during database reset:', error);
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).completelyResetDatabase = completelyResetDatabase;
  console.log('💡 Run completelyResetDatabase() in console to fix database issues');
}
