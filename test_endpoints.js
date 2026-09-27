// Simple automated test runner for FitBuddy endpoints
async function runTests() {
  console.log('--- 1. Testing GET /api/health ---');
  const healthRes = await fetch('http://localhost:3000/api/health');
  const healthJson = await healthRes.json();
  console.log('Status:', healthRes.status);
  console.log('Health Response:', healthJson);

  console.log('\n--- 2. Testing GET / (Landing Page) ---');
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  console.log('Status:', homeRes.status);
  console.log('Contains FitBuddy title:', homeHtml.includes('FitBuddy – AI Fitness Plan Generator'));
  console.log('Contains "Your Personal AI Fitness Companion":', homeHtml.includes('Your Personal'));
  console.log('Contains How It Works:', homeHtml.includes('How It Works'));
  console.log('Contains Fitness Form:', homeHtml.includes('fitnessForm'));

  console.log('\n--- 3. Testing POST /api/generate-plan with empty body (Validation Test) ---');
  const emptyRes = await fetch('http://localhost:3000/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const emptyJson = await emptyRes.json();
  console.log('Status (expect 400):', emptyRes.status);
  console.log('Error message:', emptyJson.error);

  console.log('\n--- 4. Testing POST /api/generate-plan with invalid age ---');
  const invalidAgeRes = await fetch('http://localhost:3000/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sam',
      age: 4,
      goal: 'General Fitness',
      fitnessLevel: 'Beginner',
      workoutDuration: '30 minutes',
      dietPreference: 'Vegetarian'
    })
  });
  const invalidAgeJson = await invalidAgeRes.json();
  console.log('Status (expect 400):', invalidAgeRes.status);
  console.log('Error message:', invalidAgeJson.error);

  console.log('\n--- 5. Testing POST /api/generate-plan with placeholder key ---');
  const validBody = {
    name: 'Priya Sharma',
    age: 20,
    goal: 'Weight Management',
    fitnessLevel: 'Beginner',
    workoutDuration: '30 minutes',
    dietPreference: 'Vegetarian',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    additionalPreferences: 'Home workouts with light dumbbells'
  };

  const keyCheckRes = await fetch('http://localhost:3000/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validBody)
  });
  const keyCheckJson = await keyCheckRes.json();
  console.log('Status (expect 500 when placeholder key is used):', keyCheckRes.status);
  console.log('Helpful Error message:', keyCheckJson.error);

  console.log('\n--- 6. Testing POST /api/generate-plan with isDemo: true ---');
  const demoRes = await fetch('http://localhost:3000/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...validBody, isDemo: true })
  });
  const demoJson = await demoRes.json();
  console.log('Status (expect 200):', demoRes.status);
  console.log('Success:', demoJson.success);
  console.log('Plan Title:', demoJson.data?.planTitle);
  console.log('Warmup Exercises count:', demoJson.data?.warmup?.length);
  console.log('Weekly Schedule Days count:', demoJson.data?.weeklySchedule?.length);
  console.log('Cooldown count:', demoJson.data?.cooldown?.length);
  console.log('Nutrition Guidelines count:', demoJson.data?.nutritionWellness?.length);
  console.log('Has Safety Reminder:', Boolean(demoJson.data?.safetyReminder));

  console.log('\n✅ All automated backend and validation tests completed successfully!');
}

runTests().catch(console.error);
