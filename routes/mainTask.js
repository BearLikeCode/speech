const express = require('express');
const router = express.Router();
const { fromFile, fromYoutube } = require('../controllers/siteController');
const { setTimeout } = require('../middleware/setTimeout.js');

router.route('/file')
	.post(setTimeout)
	.post(fromFile);


router.route('/youtube')
	.post(setTimeout)
	.post(fromYoutube);

module.exports = router;
