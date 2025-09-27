/**
 * Simple connection test for the updated API
 * Run this with: node test-connection.js
 */

const API_BASE_URL = 'http://localhost:8000';

async function testConnection() {
  console.log('🔍 Testing API Connection...\n');

  // Test health endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return;
  }

  // Test authentication with sample data
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'a_milton@cb.amrita.edu',
        password: 'faculty123'
      }),
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login Test:', {
        user_id: loginData.user?.id,
        name: `${loginData.user?.first_name} ${loginData.user?.last_name}`,
        role: loginData.user?.role,
        email: loginData.user?.email
      });
    } else {
      console.log('❌ Login Test Failed:', await loginResponse.text());
    }
  } catch (error) {
    console.log('❌ Login Test Error:', error.message);
  }

  // Test classes endpoint
  try {
    const classesResponse = await fetch(`${API_BASE_URL}/api/classes`);
    if (classesResponse.ok) {
      const classesData = await classesResponse.json();
      console.log('✅ Classes Test:', {
        count: classesData.classes?.length || 0,
        sample: classesData.classes?.[0] ? {
          id: classesData.classes[0].id,
          course: classesData.classes[0].courses?.name,
          instructor: classesData.classes[0].instructor
        } : 'No classes found'
      });
    } else {
      console.log('❌ Classes Test Failed:', await classesResponse.text());
    }
  } catch (error) {
    console.log('❌ Classes Test Error:', error.message);
  }

  // Test assignments endpoint
  try {
    const assignmentsResponse = await fetch(`${API_BASE_URL}/api/assignments`);
    if (assignmentsResponse.ok) {
      const assignmentsData = await assignmentsResponse.json();
      console.log('✅ Assignments Test:', {
        count: assignmentsData.assignments?.length || 0,
        sample: assignmentsData.assignments?.[0] ? {
          id: assignmentsData.assignments[0].id,
          title: assignmentsData.assignments[0].title,
          course: assignmentsData.assignments[0].courses?.name
        } : 'No assignments found'
      });
    } else {
      console.log('❌ Assignments Test Failed:', await assignmentsResponse.text());
    }
  } catch (error) {
    console.log('❌ Assignments Test Error:', error.message);
  }

  console.log('\n🎯 Connection Test Complete!');
}

// Run the test
testConnection().catch(console.error);