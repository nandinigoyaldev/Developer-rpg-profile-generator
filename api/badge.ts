/* eslint-disable */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).send('Username is required');
  }

  try {
    // In a real app, we'd fetch the github profile from our own logic, but to keep it fast
    // and avoid rate limits here, we'll do a quick fetch directly from github api.
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
    const userData = await userRes.json();

    let grade = 'F';
    let title = 'Keyboard Smasher';
    
    if (userData.public_repos > 50) {
      grade = 'A';
      title = '10x Developer (Self-Proclaimed)';
    } else if (userData.public_repos > 20) {
      grade = 'B';
      title = 'StackOverflow Dependent';
    } else if (userData.public_repos > 5) {
      grade = 'C';
      title = 'Hello World Enthusiast';
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="40" viewBox="0 0 300 40">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0d1117" />
          <stop offset="100%" stop-color="#161b22" />
        </linearGradient>
      </defs>
      <rect width="300" height="40" rx="4" fill="url(#bg)" stroke="#e3b341" stroke-width="1" />
      
      <text x="12" y="25" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14" font-weight="bold" fill="#e3b341">
        DEV RPG
      </text>
      
      <line x1="85" y1="5" x2="85" y2="35" stroke="#30363d" stroke-width="1" />
      
      <text x="95" y="25" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" fill="#c9d1d9">
        Rank: <tspan font-weight="bold" fill="${grade === 'A' ? '#3fb950' : grade === 'F' ? '#f85149' : '#e3b341'}">${grade}</tspan> | ${title}
      </text>
    </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(svg);
  } catch (error: any) {
    res.status(500).send('Error generating badge');
  }
}
