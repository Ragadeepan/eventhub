import https from 'https';
import jwt from 'jsonwebtoken';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'eventhub-a1b0c';

// Fetch Google's public signing keys for Firebase tokens
let cachedKeys = null;
let keyExpiry = 0;

const getGooglePublicKeys = () => new Promise((resolve, reject) => {
  if (cachedKeys && Date.now() < keyExpiry) return resolve(cachedKeys);
  https.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        cachedKeys = JSON.parse(data);
        // Cache-Control header gives expiry; default 1 hour
        const cc = res.headers['cache-control'] || '';
        const maxAge = parseInt((cc.match(/max-age=(\d+)/) || [])[1] || '3600');
        keyExpiry = Date.now() + maxAge * 1000;
        resolve(cachedKeys);
      } catch (e) { reject(e); }
    });
  }).on('error', reject);
});

export const verifyFirebaseToken = async (idToken) => {
  const keys = await getGooglePublicKeys();
  const header = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64').toString());
  const cert = keys[header.kid];
  if (!cert) throw new Error('Invalid Firebase token: unknown key');

  const decoded = jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    audience: PROJECT_ID,
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
  });

  return {
    uid:     decoded.uid || decoded.sub,
    email:   decoded.email,
    name:    decoded.name,
    picture: decoded.picture,
  };
};

export const initFirebaseAdmin = () => null;
export default {};
