const express = require('express');
const router = express.Router();
const { fromFile, fromYoutube } = require('../controllers/siteController');
const { setTimeout } = require('../middleware/setTimeout.js');

router.route('/file')
	.post(fromFile)
	.post(setTimeout);

router.route('/youtube')
	.post(fromYoutube)
	.post(setTimeout);

module.exports = router;
