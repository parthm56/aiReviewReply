import express from 'express';
import { validateRigster, validateLogin } from '../validators/index.js';
import { register,login } from '../Controllers/index.js';
const router = express.Router();

router.get('/health',(req, res) => {
    res.json({'status': 'ok'});
});
router.post('/register',validateRigster, register);
router.post('/login', validateLogin, login);
export default router;