var express = require('express');
var router = express.Router();
const { index, fromFile, fromYoutube } = require('../controllers/siteController');

/* GET home page. */
router.get('/', index);

// router.post('/', fromFile);

module.exports = router;
