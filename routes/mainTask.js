const express = require('express');
const router = express.Router();
const { fromFile, fromYoutube } = require('../controllers/siteController');
const { setTimeout } = require('../middleware/setTimeout.js');

router.route('/file')
	.post(fromFile);


router.route('/youtube')
	.post(fromYoutube);

module.exports = router;
