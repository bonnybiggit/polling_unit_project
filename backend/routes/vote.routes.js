const express = require('express');
const { castVote } = require('../controllers/vote.controller');
const router = express.Router();
router.post('/', castVote);
module.exports = router;
