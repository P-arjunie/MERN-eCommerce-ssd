import { Issuer, generators } from 'openid-client';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import { generateToken } from '../utils/generateToken.js';



let oidcClient = null;
let codeVerifierStore = new Map();

// Get or create OIDC client for Google
async function getClient() {
  if (oidcClient) return oidcClient;

  const issuerUrl = process.env.OIDC_ISSUER || 'https://accounts.google.com';
  const issuer = await Issuer.discover(issuerUrl);

  oidcClient = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: [process.env.OIDC_REDIRECT_URI],
    response_types: ['code']
  });

  return oidcClient;
}

// Start OIDC login
export const startOidc = async (req, res, next) => {
  try {
    const client = await getClient();

    // Generate PKCE and state
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const state = generators.state();
    const redirect = req.query.redirect || '/';

    // Build Google login URL
    const url = client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      prompt: 'select_account'
    });

    // Save codeVerifier + redirect for later
    codeVerifierStore.set(state, { codeVerifier, redirect });

    // Redirect user to Google
    res.redirect(url);
  } catch (err) {
    next(err);
  }
};

// Handle callback from Google
export const oidcCallback = async (req, res, next) => {
  try {
    const client = await getClient();
    const params = client.callbackParams(req);

    // Get stored codeVerifier and redirect
    const store = codeVerifierStore.get(params.state);
    if (!store) {
      res.statusCode = 400;
      throw new Error('Invalid OIDC state');
    }
    codeVerifierStore.delete(params.state);

    // Exchange code for tokens
    const tokenSet = await client.callback(process.env.OIDC_REDIRECT_URI, params, {
      code_verifier: store.codeVerifier,
      state: params.state
    });

    const claims = tokenSet.claims();
    const email = claims.email;
    const name = claims.name || email;
    const providerId = claims.sub;

    if (!email) {
      res.statusCode = 400;
      throw new Error('OIDC provider did not return email');
    }

    // Find existing user or create new one
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = await bcrypt.hash(generators.nonce(), 10);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        provider: 'oidc',
        providerId
      });
    }

    // Issue JWT cookie
    generateToken(req, res, user._id);

    // Redirect back to frontend
    const rawRedirect = store.redirect || '/';
    const safePath = typeof rawRedirect === 'string' && rawRedirect.startsWith('/') ? rawRedirect : '/';
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
    res.redirect(`${frontendOrigin}${safePath}`);
  } catch (err) {
    next(err);
  }
};
