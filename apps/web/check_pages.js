const pages = [
  '/',
  '/dashboard',
  '/dashboard/admin/settings',
  '/dashboard/admin/users',
  '/dashboard/alerts',
  '/dashboard/ask',
  '/dashboard/audit',
  '/dashboard/capture',
  '/dashboard/events',
  '/dashboard/governance',
  '/dashboard/memory',
  '/dashboard/projects',
  '/dashboard/projects/1',
  '/dashboard/projects/1/activities',
  '/dashboard/projects/1/schedule',
  '/dashboard/review',
  '/dashboard/variances',
  '/login'
];

async function checkPages() {
  console.log('Checking pages on http://localhost:3000...\n');
  const broken = [];
  
  for (const page of pages) {
    try {
      const res = await fetch(`http://localhost:3000${page}`);
      const text = await res.text();
      
      // Next.js sometimes returns 200 but renders an error overlay in dev
      const hasError = text.includes('Next.js - Error') || text.includes('404: This page could not be found');
      
      if (!res.ok || hasError) {
        console.log(`❌ ${page} -> Status: ${res.status} (Error: ${hasError})`);
        broken.push(page);
      } else {
        console.log(`✅ ${page} -> Status: ${res.status}`);
      }
    } catch (e) {
      console.log(`❌ ${page} -> Failed to fetch: ${e.message}`);
      broken.push(page);
    }
  }
  
  console.log('\n--- SUMMARY ---');
  console.log(`Broken pages to fix: \n${broken.join('\n')}`);
}

checkPages();
