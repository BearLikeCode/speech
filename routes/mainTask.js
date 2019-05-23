const express = require('express');
const router = express.Router();
const { fromFile, fromYoutube } = require('../controllers/siteController');

router.post('/file', fromFile);

router.post('/youtube', fromYoutube);

module.exports = router;
