var express = require('express');
var router = express.Router();
var ffmpeg = require('ffmpeg');

router.get('/', async function(req, res, next) {
    try {
        var process = new ffmpeg('./public/files/test.mp4');
        process.then(function (video) {
            // video.setAudioCodec('FLAC');
            x
            video.fnExtractSoundToMP3('./public/files/test.flac', function (error, file) {
                if (!error)
                    console.log('Audio file: ' + file);
            });
        }, function (err) {
            console.log('Error: ' + err);
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
    }
});

module.exports = router;
