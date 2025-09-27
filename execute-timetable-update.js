/**
 * Execute the complete timetable update via API
 */

const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:8000';

async function updateTimetable() {
  console.log('🔄 Updating timetable with complete week data...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'complete_timetable_update.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements (basic splitting)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('SELECT')) {
        // Skip SELECT statements for now, we'll do those at the end
        continue;
      }

      console.log(`${i + 1}. Executing: ${statement.substring(0, 50)}...`);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/execute-sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: statement + ';'
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ Success: ${result.message || 'Statement executed'}`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`   ❌ Error: ${error}`);
          errorCount++;
        }
      } catch (err) {
        console.log(`   ❌ Network Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    // Now test the API to see the updated classes
    console.log('\n🧪 Testing updated classes API...');
    const classesResponse = await fetch(`${API_BASE_URL}/api/classes`);
    if (classesResponse.ok) {
      const classesData = await classesResponse.json();
      console.log(`📚 Total classes loaded: ${classesData.classes.length}`);
      
      // Group by day
      const dayCount = {};
      classesData.classes.forEach(cls => {
        const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayName = dayNames[cls.day_of_week] || 'Unknown';
        dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      });

      console.log('\n📅 Classes by day:');
      Object.entries(dayCount).forEach(([day, count]) => {
        console.log(`   ${day}: ${count} classes`);
      });
    }

  } catch (error) {
    console.log('❌ Script Error:', error.message);
  }
}

updateTimetable().catch(console.error);