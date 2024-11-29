const express = require('express');
const User = require('../database/schema/Schema');
const router = express.Router();

router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;