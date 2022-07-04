import { getRegisters, postRegister } from "../controllers/registersController.js"
import validateUser from '../middlewares/validateUser.js';
import { Router } from 'express';

const router = Router();

router.get('/userdata', validateUser, getRegisters);
router.post('/insert-value', postRegister);

export default router;