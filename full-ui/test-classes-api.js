/**
 * Test the updated classesAPI with Supabase data transformation
 */

// Import the API (this would normally be from '../services/api')
const API_BASE_URL = 'http://localhost:8000';

// Simulate the transform function from our API
function transformClass(apiClass) {
  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return {
    ...apiClass,
    // Backward compatibility fields
    name: apiClass.courses?.name || apiClass.title || 'Unknown Course',
    code: apiClass.courses?.code || 'N/A',
    instructor: apiClass.instructor || 'TBA',
    day_of_week: typeof apiClass.day_of_week === 'number' ? dayNames[apiClass.day_of_week] : apiClass.day_of_week,
  };
}

async function testClassesAPI() {
  console.log('🧪 Testing Updated Classes API...\n');

  try {
    // Test getAllClasses
    const response = await fetch(`${API_BASE_URL}/api/classes`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Raw API Response (first class):');
      console.log(JSON.stringify(data.classes[0], null, 2));
      
      // Test transformation
      const transformedClass = transformClass(data.classes[0]);
      console.log('\n✅ Transformed Class (backward compatible):');
      console.log(JSON.stringify({
        id: transformedClass.id,
        name: transformedClass.name,           // NEW: from courses.name
        code: transformedClass.code,           // NEW: from courses.code  
        title: transformedClass.title,         // ORIGINAL: Supabase field
        instructor: transformedClass.instructor, // NEW: placeholder
        room: transformedClass.room,
        start_time: transformedClass.start_time,
        end_time: transformedClass.end_time,
        day_of_week: transformedClass.day_of_week, // NEW: converted from number to name
        status: transformedClass.status,
        course_id: transformedClass.course_id
      }, null, 2));

      console.log('\n📊 Classes Summary:');
      console.log(`Total Classes: ${data.classes.length}`);
      
      // Show all unique courses
      const courses = [...new Set(data.classes.map(c => c.courses?.name || c.title))];
      console.log(`Unique Courses: ${courses.join(', ')}`);
      
      // Show schedule pattern
      const dayPattern = data.classes.reduce((acc, c) => {
        const day = typeof c.day_of_week === 'number' ? 
          ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][c.day_of_week] : 
          c.day_of_week;
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      console.log('Day Distribution:', dayPattern);
      
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testClassesAPI().catch(console.error);