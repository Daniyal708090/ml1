async function testApi() {
  const baseUrl = 'http://localhost:4000';
  
  console.log('--- 1. Register User ---');
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    })
  });
  
  if (!registerRes.ok) {
    console.error('Registration failed:', await registerRes.text());
    return;
  }
  
  const tokens = (await registerRes.json()) as any;
  console.log('Registration tokens:', tokens);
  const token = tokens.accessToken;

  console.log('--- 2. Start Interview ---');
  const startRes = await fetch(`${baseUrl}/api/interviews/start`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      track: 'FRONTEND',
      mode: 'PRACTICE'
    })
  });

  if (!startRes.ok) {
    console.error('Start interview failed:', await startRes.text());
    return;
  }

  const interviewData = (await startRes.json()) as any;
  console.log('Interview Data:', interviewData);
  const interviewId = interviewData.interview.id;

  console.log('--- 3. Submit Answer ---');
  const answerRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/answer`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content: 'React reconciliation is the process where React updates the DOM tree. It uses an O(n) heuristic diffing algorithm to compare elements. Keys are used to uniquely identify list elements so React knows which ones to reuse, update, or delete.',
      codeSnippet: 'const list = items.map(item => <li key={item.id}>{item.name}</li>);'
    })
  });

  if (!answerRes.ok) {
    console.error('Submit answer failed:', await answerRes.text());
    return;
  }

  const answerData = await answerRes.json();
  console.log('Answer analysis:', JSON.stringify(answerData, null, 2));

  console.log('--- 4. Complete Interview ---');
  const completeRes = await fetch(`${baseUrl}/api/interviews/${interviewId}/complete`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });

  if (!completeRes.ok) {
    console.error('Complete interview failed:', await completeRes.text());
    return;
  }
  
  console.log('Interview completed successfully!');
}

testApi().catch(console.error);
