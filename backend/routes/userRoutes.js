const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, registerUser);

router.post('/login', authUser);

module.exports = router;