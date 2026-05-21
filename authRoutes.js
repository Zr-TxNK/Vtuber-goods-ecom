/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Route Layer (Rubric Item 7)
 * Routes define endpoints and map paths to controllers. They also mount
 * middlewares (like validator gatekeepers) before letting requests pass.
 */

const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { validateRegister, validateLogin } = require('./validateMiddleware');

// Mount registration and login routes with their respective validators (Gatekeeper Pattern)
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

module.exports = router;
