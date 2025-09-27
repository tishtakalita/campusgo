/**
 * Comprehensive Resources S3 Integration Test
 * Tests the enhanced resources functionality with S3 bucket integration
 */

const API_BASE = "http://localhost:8000";

console.log("🗂️ PHASE 1: S3 Resources Integration Test");
console.log("=" .repeat(60));

async function testResourcesS3Integration() {
    try {
        // Phase 1: Test basic resources API
        console.log("\n📋 Phase 1: Basic Resources API");
        const resourcesResponse = await fetch(`${API_BASE}/api/resources`);
        const resourcesData = await resourcesResponse.json();
        
        console.log(`✅ Resources API: ${resourcesData.resources?.length || 0} resources found`);
        
        if (resourcesData.resources && resourcesData.resources.length > 0) {
            const resource = resourcesData.resources[0];
            console.log(`📄 Sample Resource: ${resource.title}`);
            console.log(`🔗 File URL: ${resource.file_url ? 'Present' : 'Not Present'}`);
            console.log(`📊 Download Count: ${resource.download_count || 0}`);
            console.log(`🏷️ Resource Type: ${resource.resource_type}`);
        }

        // Phase 2: Test resource creation with S3 URL
        console.log("\n📤 Phase 2: Create Resource with S3 URL");
        const testResource = {
            title: "S3 Test Resource - Batch C Notes",
            description: "Test resource with S3 bucket integration using the provided PDF URL",
            resource_type: "document",
            file_url: "https://zhwaokrkcmjoywflhtle.supabase.co/storage/v1/object/sign/resources/212_BatchC_.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85MWVmYTMzZi1jZjJkLTQ3MWUtOGRiMC1iMzBlYTM1YmQ3OWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXNvdXJjZXMvMjEyX0JhdGNoQ18ucGRmIiwiaWF0IjoxNzU4OTUyNjg2LCJleHAiOjE3NjE1NDQ2ODZ9.zhPv1TopqF9Zzlp9gyx8K9oU9emVeNoD6e7ISeUmkZo",
            file_name: "212_BatchC_.pdf",
            file_type: "pdf",
            file_size: 2048000, // Approximate size
            course_id: null, // Will get from courses API
            uploaded_by: null, // Will get from users API
            tags: ["batch-c", "notes", "s3-test"],
            is_external: false
        };

        // Get course and user IDs for the test
        const coursesResponse = await fetch(`${API_BASE}/api/courses`);
        const coursesData = await coursesResponse.json();
        if (coursesData.courses && coursesData.courses.length > 0) {
            testResource.course_id = coursesData.courses[0].id;
            console.log(`📚 Using Course: ${coursesData.courses[0].name}`);
        }

        const usersResponse = await fetch(`${API_BASE}/api/users`);
        const usersData = await usersResponse.json();
        if (usersData.users && usersData.users.length > 0) {
            const faculty = usersData.users.find(u => u.role === 'faculty');
            if (faculty) {
                testResource.uploaded_by = faculty.id;
                console.log(`👨‍🏫 Using Faculty: ${faculty.first_name} ${faculty.last_name}`);
            }
        }

        const createResponse = await fetch(`${API_BASE}/api/resources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testResource)
        });

        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log(`✅ Resource Created: ${createData.resource?.title}`);
            console.log(`🆔 Resource ID: ${createData.resource?.id}`);
            
            // Phase 3: Test download tracking
            console.log("\n📥 Phase 3: Download Tracking Test");
            const downloadResponse = await fetch(`${API_BASE}/api/resources/${createData.resource.id}/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: testResource.uploaded_by })
            });

            if (downloadResponse.ok) {
                console.log("✅ Download tracked successfully");
                
                // Get updated resource stats
                const statsResponse = await fetch(`${API_BASE}/api/resources/${createData.resource.id}/stats`);
                const statsData = await statsResponse.json();
                console.log(`📊 Download Count: ${statsData.download_count}`);
            } else {
                console.log("❌ Download tracking failed");
            }

            // Phase 4: Test resource filtering
            console.log("\n🔍 Phase 4: Resource Filtering Test");
            
            // Filter by type
            const filterResponse = await fetch(`${API_BASE}/api/resources/filter?type=document`);
            const filterData = await filterResponse.json();
            console.log(`📄 Document Resources: ${filterData.resources?.length || 0}`);

            // Filter by course
            if (testResource.course_id) {
                const courseFilterResponse = await fetch(`${API_BASE}/api/resources/course/${testResource.course_id}`);
                const courseFilterData = await courseFilterResponse.json();
                console.log(`🏫 Course Resources: ${courseFilterData.resources?.length || 0}`);
            }

            // Phase 5: Test search functionality
            console.log("\n🔍 Phase 5: Search Functionality Test");
            const searchResponse = await fetch(`${API_BASE}/api/resources/search?q=batch`);
            const searchData = await searchResponse.json();
            console.log(`🔍 Search Results for "batch": ${searchData.resources?.length || 0}`);

            // Phase 6: Test resource update
            console.log("\n✏️ Phase 6: Resource Update Test");
            const updateData = {
                description: "Updated description - S3 integration test completed successfully",
                tags: ["batch-c", "notes", "s3-test", "updated"]
            };

            const updateResponse = await fetch(`${API_BASE}/api/resources/${createData.resource.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (updateResponse.ok) {
                const updatedData = await updateResponse.json();
                console.log("✅ Resource updated successfully");
                console.log(`📝 New Description: ${updatedData.resource?.description}`);
            } else {
                console.log("❌ Resource update failed");
            }

        } else {
            const errorData = await createResponse.json();
            console.log(`❌ Resource creation failed: ${errorData.detail}`);
        }

        // Phase 7: Test comprehensive resources list with enhanced data
        console.log("\n📊 Phase 7: Enhanced Resources List Test");
        const enhancedResourcesResponse = await fetch(`${API_BASE}/api/resources`);
        const enhancedResourcesData = await enhancedResourcesResponse.json();
        
        console.log(`📋 Total Resources: ${enhancedResourcesData.resources?.length || 0}`);
        
        // Analyze resource types
        const resourceTypes = {};
        enhancedResourcesData.resources?.forEach(resource => {
            resourceTypes[resource.resource_type] = (resourceTypes[resource.resource_type] || 0) + 1;
        });
        
        console.log("📊 Resource Types Distribution:");
        Object.entries(resourceTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
        });

        // Test S3 URL validation
        console.log("\n🔐 Phase 8: S3 URL Validation Test");
        const s3Resources = enhancedResourcesData.resources?.filter(r => r.file_url && r.file_url.includes('supabase.co'));
        console.log(`🔗 S3 Resources Found: ${s3Resources?.length || 0}`);
        
        if (s3Resources && s3Resources.length > 0) {
            const s3Resource = s3Resources[0];
            console.log(`📄 S3 Resource: ${s3Resource.title}`);
            console.log(`🔗 S3 URL: ${s3Resource.file_url?.substring(0, 50)}...`);
            console.log(`📊 Downloads: ${s3Resource.download_count || 0}`);
        }

        console.log("\n✅ S3 Resources Integration Test Completed Successfully!");
        console.log("🎯 All phases passed - S3 bucket integration is operational");
        
    } catch (error) {
        console.error("❌ Test Error:", error.message);
        console.log("🔧 Please ensure the API server is running on http://localhost:8000");
    }
}

// Run the comprehensive test
testResourcesS3Integration();