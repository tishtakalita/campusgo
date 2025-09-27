/**
 * Debug day allocation and user class assignment
 */

const API_BASE_URL = 'http://localhost:8000';

async function debugClassAllocation() {
  console.log('🔍 Debugging Class Allocation for testuser@cb.students.amrita.edu\n');

  // Check what day is today and what day_of_week number corresponds to Friday
  const today = new Date('2025-09-26'); // Today is Thursday Sep 26, 2025
  const friday = new Date('2025-09-27'); // Tomorrow is Friday Sep 27, 2025
  
  console.log('📅 Date Analysis:');
  console.log(`Today (Sep 26): ${today.toLocaleDateString('en-US', { weekday: 'long' })} - Day Number: ${today.getDay()}`);
  console.log(`Tomorrow (Sep 27): ${friday.toLocaleDateString('en-US', { weekday: 'long' })} - Day Number: ${friday.getDay()}`);
  console.log('Note: JavaScript getDay() returns 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday\n');

  try {
    // Get all classes
    const classesResponse = await fetch(`${API_BASE_URL}/api/classes`);
    if (classesResponse.ok) {
      const classesData = await classesResponse.json();
      
      console.log('📚 All Classes in Database:');
      classesData.classes.forEach((cls, index) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[cls.day_of_week] || 'Unknown';
        console.log(`${index + 1}. ${cls.title} - Day: ${cls.day_of_week} (${dayName}) - Time: ${cls.start_time}`);
      });

      console.log('\n🔍 Classes by Day:');
      const classByDay = {};
      classesData.classes.forEach(cls => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[cls.day_of_week];
        if (!classByDay[dayName]) classByDay[dayName] = [];
        classByDay[dayName].push(cls.title);
      });

      Object.keys(classByDay).forEach(day => {
        console.log(`${day}: ${classByDay[day].length} classes - ${classByDay[day].join(', ')}`);
      });

      console.log(`\n❓ Friday Classes: ${classByDay['Friday'] ? classByDay['Friday'].length : 0} classes found`);
    }

    // Check user enrollment - how are classes assigned to users?
    console.log('\n👤 User Class Assignment Analysis:');
    
    // Check if there's an enrollments endpoint
    try {
      const enrollmentsResponse = await fetch(`${API_BASE_URL}/api/courses`);
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        console.log('✅ Courses endpoint available');
        console.log(`Total Courses: ${enrollmentsData.courses?.length || 0}`);
        
        if (enrollmentsData.courses?.length > 0) {
          console.log('📖 Available Courses:');
          enrollmentsData.courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name} (${course.code}) - Dept: ${course.departments?.name || 'N/A'}`);
          });
        }
      }
    } catch (e) {
      console.log('❌ No enrollments/courses endpoint available');
    }

    // Check testuser details
    console.log('\n🔍 TestUser Analysis:');
    try {
      const usersResponse = await fetch(`${API_BASE_URL}/api/users`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const testUser = usersData.users.find(u => u.email === 'testuser@cb.students.amrita.edu');
        
        if (testUser) {
          console.log('✅ TestUser Found:');
          console.log(`- ID: ${testUser.id}`);
          console.log(`- Name: ${testUser.first_name} ${testUser.last_name}`);
          console.log(`- Role: ${testUser.role}`);
          console.log(`- Department: ${testUser.department_id}`);
          console.log(`- Year: ${testUser.year_of_study}`);
        } else {
          console.log('❌ TestUser not found');
        }
      }
    } catch (e) {
      console.log('❌ Error fetching user data:', e.message);
    }

    // Check how frontend determines "today's classes"
    console.log('\n🎯 Frontend Logic Analysis:');
    console.log('The issue might be:');
    console.log('1. All classes are set to day_of_week = 1 (Monday)');
    console.log('2. Frontend filters by current day (Friday = 5)');
    console.log('3. No classes match Friday, so "No Classes Today" is shown');
    console.log('4. User class assignment might be based on enrollment data or all users see all classes');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugClassAllocation().catch(console.error);