import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Test functions
async function testAPI() {
  console.log('🚀 Starting API tests...\n');

  try {
    // 1. Health check
    console.log('1. Testing health check...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check:', healthResponse.data);

    // 2. Get all tasks
    console.log('\n2. Testing get all tasks...');
    const allTasksResponse = await api.get('/tasks');
    console.log('✅ All tasks:', allTasksResponse.data);

    // 3. Get tasks from specific column
    console.log('\n3. Testing get tasks from to-do column...');
    const todoResponse = await api.get('/tasks/to-do');
    console.log('✅ To-do tasks:', todoResponse.data);

    // 4. Create a new task
    console.log('\n4. Testing create new task...');
    const newTaskData = {
      title: 'Test Task from API Client',
      description: 'This is a test task created via API'
    };
    const createResponse = await api.post('/tasks/to-do', newTaskData);
    console.log('✅ Created task:', createResponse.data);
    const createdTaskId = createResponse.data.id;

    // 5. Update the task
    console.log('\n5. Testing update task...');
    const updateData = {
      title: 'Updated Test Task',
      description: 'This task has been updated via API'
    };
    const updateResponse = await api.put(`/tasks/${createdTaskId}`, updateData);
    console.log('✅ Updated task:', updateResponse.data);

    // 6. Move task to different column
    console.log('\n6. Testing move task...');
    const moveData = {
      source_column: 'to-do',
      destination_column: 'in-progress',
      task_id: createdTaskId
    };
    const moveResponse = await api.post('/tasks/move', moveData);
    console.log('✅ Moved task:', moveResponse.data);

    // 7. Verify task was moved
    console.log('\n7. Verifying task was moved...');
    const inProgressResponse = await api.get('/tasks/in-progress');
    const movedTask = inProgressResponse.data[createdTaskId];
    if (movedTask) {
      console.log('✅ Task successfully moved to in-progress:', movedTask);
    } else {
      console.log('❌ Task not found in in-progress column');
    }

    // 8. Delete the task
    console.log('\n8. Testing delete task...');
    const deleteResponse = await api.delete(`/tasks/${createdTaskId}`);
    console.log('✅ Deleted task:', deleteResponse.data);

    // 9. Verify task was deleted
    console.log('\n9. Verifying task was deleted...');
    try {
      await api.get(`/tasks/${createdTaskId}`);
      console.log('❌ Task still exists after deletion');
    } catch (error) {
      if (error.response.status === 404) {
        console.log('✅ Task successfully deleted');
      }
    }

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

async function testErrorHandling() {
  console.log('\n🔍 Testing error handling...\n');

  try {
    // Test invalid column
    console.log('1. Testing invalid column...');
    try {
      await api.get('/tasks/invalid-column');
    } catch (error) {
      console.log('✅ Correctly handled invalid column:', error.response.data);
    }

    // Test non-existent task
    console.log('\n2. Testing non-existent task...');
    try {
      await api.get('/tasks/non-existent-task');
    } catch (error) {
      console.log('✅ Correctly handled non-existent task:', error.response.data);
    }

    // Test invalid task creation (empty title)
    console.log('\n3. Testing invalid task creation...');
    try {
      await api.post('/tasks/to-do', { title: '', description: 'Test' });
    } catch (error) {
      console.log('✅ Correctly handled empty title:', error.response.data);
    }

    console.log('\n✅ Error handling tests completed!');

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testAPI();
  await testErrorHandling();
}

// Export functions for use in other files
export {
  testAPI,
  testErrorHandling,
  runAllTests
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}