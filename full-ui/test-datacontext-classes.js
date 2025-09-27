/**
 * Test DataContext integration with updated classes API
 */

const API_BASE_URL = 'http://localhost:8000';

async function testDataContextIntegration() {
  console.log('🧪 Testing DataContext Classes Integration...\n');

  try {
    // Simulate the DataContext refresh logic
    const classesResponse = await fetch(`${API_BASE_URL}/api/classes`);
    
    if (classesResponse.ok) {
      const data = await classesResponse.json();
      
      // Apply the same transformation as DataContext
      const transformedClasses = data.classes.map((apiClass) => {
        const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayName = typeof apiClass.day_of_week === 'number' ? 
          dayNames[apiClass.day_of_week] : 
          apiClass.day_of_week || 'Monday';
        
        // Extract time from ISO datetime
        const startTime = apiClass.start_time ? 
          new Date(apiClass.start_time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }) : '09:00';
        
        const endTime = apiClass.end_time ? 
          new Date(apiClass.end_time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }) : '10:30';

        return {
          id: apiClass.id,
          name: apiClass.courses?.name || apiClass.title || 'Unknown Course',
          code: apiClass.courses?.code || 'N/A',
          instructor: apiClass.instructor || 'TBA',
          room: apiClass.room || 'TBA',
          schedule: [{
            day: dayName,
            startTime: startTime,
            endTime: endTime
          }],
          students: []
        };
      });

      console.log('✅ DataContext Classes Transformation:');
      console.log(`Total Classes: ${transformedClasses.length}`);
      
      console.log('\n📋 Transformed Classes for Components:');
      transformedClasses.forEach((cls, index) => {
        console.log(`${index + 1}. ${cls.name} (${cls.code})`);
        console.log(`   Room: ${cls.room}`);
        console.log(`   Schedule: ${cls.schedule[0].day} ${cls.schedule[0].startTime}-${cls.schedule[0].endTime}`);
        console.log(`   Instructor: ${cls.instructor}\n`);
      });

      // Test compatibility with existing components
      console.log('🎯 Component Compatibility Test:');
      const firstClass = transformedClasses[0];
      console.log('✅ Class object has required fields for existing components:');
      console.log(`- id: ${firstClass.id ? '✓' : '✗'}`);
      console.log(`- name: ${firstClass.name ? '✓' : '✗'}`);
      console.log(`- code: ${firstClass.code ? '✓' : '✗'}`);
      console.log(`- instructor: ${firstClass.instructor ? '✓' : '✗'}`);
      console.log(`- room: ${firstClass.room ? '✓' : '✗'}`);
      console.log(`- schedule: ${firstClass.schedule?.length > 0 ? '✓' : '✗'}`);
      console.log(`- schedule.day: ${firstClass.schedule[0]?.day ? '✓' : '✗'}`);
      console.log(`- schedule.startTime: ${firstClass.schedule[0]?.startTime ? '✓' : '✗'}`);
      console.log(`- schedule.endTime: ${firstClass.schedule[0]?.endTime ? '✓' : '✗'}`);
      
    } else {
      console.log('❌ API Error:', classesResponse.status, classesResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testDataContextIntegration().catch(console.error);