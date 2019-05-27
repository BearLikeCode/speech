const express = require('express');
const router = express.Router();
const { fromFile, fromYoutube } = require('../controllers/siteController');
const { timeout } = require('../middleware/setTimeout.js');

router.route('/file')
	.post(fromFile)
	// .post(timeout);

router.route('/youtube')
	.post(fromYoutube)
	// .post(timeout);

module.exports = router;
