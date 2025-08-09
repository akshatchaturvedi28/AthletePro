import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple health check response
    if (req.method === 'GET' && req.url === '/api/health') {
      return res.status(200).json({ status: 'ok', message: 'API is running' });
    }
    
    // For all other requests, return a basic response
    res.status(200).json({ 
      message: 'AthletePro API', 
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url 
    });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
