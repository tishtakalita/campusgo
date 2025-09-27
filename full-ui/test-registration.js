/**
 * Test registration with the frontend form data structure
 */

const API_BASE_URL = 'http://localhost:8000';

async function testRegistrationForm() {
  console.log('🧪 Testing Registration Form Data...\n');

  // This simulates what the frontend form would send
  const formData = {
    email: "newstudent2025@cb.students.amrita.edu",
    password: "newstudent123",
    first_name: "New",
    last_name: "Student",
    role: "student",
    student_id: "cb.sc.u4aie23301",
    department_id: "11111111-1111-1111-1111-111111111001", // Valid AIE department
    year_of_study: "4"
  };

  try {
    console.log('📝 Form Data to Send:', formData);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration Success:', {
        user_id: data.user?.id,
        name: `${data.user?.first_name} ${data.user?.last_name}`,
        email: data.user?.email,
        role: data.user?.role,
        student_id: data.user?.student_id,
        year_of_study: data.user?.year_of_study
      });
      
      // Test immediate login
      console.log('\n🔐 Testing login with new user...');
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login Success:', {
          message: loginData.message,
          user_name: `${loginData.user?.first_name} ${loginData.user?.last_name}`
        });
      } else {
        console.log('❌ Login failed:', await loginResponse.text());
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Registration Failed:', error);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testRegistrationForm().catch(console.error);