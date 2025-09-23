import express from 'express';
import csrf from 'csurf';
import { startOidc, oidcCallback } from '../controllers/authController.js';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get('/oidc/start', startOidc);
router.get('/oidc/callback', oidcCallback);

export default router;


