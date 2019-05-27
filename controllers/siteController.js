const fs = require('fs');
const youtubedl = require('youtube-dl');
const crypto = require('crypto');
const async = require('async');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'spechtemp';
const lang = require('../public/lang/lang');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

exports.index = (req, res, next) => {
	res.render('index', { lang: lang });
};

exports.fromFile = (req, res, next) => {
	let imageFile, filename, dot, filelength, filenameor, ext, filenamemd5, fileFull, lang;

	let dir = './public/uploads/';

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}

	lang = req.body.lang;
	imageFile = req.files.file;
	filename = req.files.file.name; //common with extension
	dot = filename.indexOf(".", 0);
	filelength = filename.length;
	filenameor = filename.substring(0, dot); //only name
	ext = filename.substring(dot, filelength + 1);
	filenamemd5 = crypto.createHash('md5').update(filenameor + Date.now()).digest("hex");
	fileFull = filenamemd5 + ext;

		async.auto({
				move: cb => move(imageFile, fileFull, cb),
				ffmpegWork: ['move', (data, cb) => ffmpegFunc({ fileFull, filenamemd5 }, cb)],
				cloudIn: ['ffmpegWork', (data, cb) => cloudInFunc(filenamemd5, cb)],
				transcription: ['cloudIn', (data, cb) => speechFunc(lang, filenamemd5, cb)],
				cloudOut: ['transcription', (data, cb) => cloudOutFunc(filenamemd5, cb)],
			},

			// optional callback
			function(err, data) {
				if (err) {
					console.log(err);
					return next(res.status(500).json(err));
				}

				return next(res.status(200).json({ text: data.transcription }));
			});
};

exports.fromYoutube = async (req, res, next) => {
	const filenamemd5 = `${crypto.createHash('md5').update('test' + Date.now()).digest("hex")}`;;

	let { link, lang } = req.body;

	if (link === '^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+') {

		let dir = './public/uploads/';

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		async.auto({
			fileFull: cb => videoConfig({filenamemd5, link}, cb),
			ffmpegWork: ['fileFull', ({fileFull}, cb) => ffmpegFunc({fileFull, filenamemd5}, cb)],
			cloudIn: ['ffmpegWork', (data, cb) => cloudInFunc(filenamemd5, cb)],
			transcription: ['cloudIn', (data, cb) => speechFunc(lang, filenamemd5, cb)],
			cloudOut: ['transcription', (data, cb) => cloudOutFunc(filenamemd5, cb)]
		}, (err, data) => {
			if (err) {
				console.log(err);
				return next(res.status(500).json(err));
			}
			console.log(`Transcription: ${data.transcription}`);
			return next(res.status(200).json({text: data.transcription}));
		});
	} else {
		return next(res.status(200).json({text: 'you paste non youtube url'}));
	}
};

function videoConfig({ filenamemd5, link }, cb) {
	const fileFull = filenamemd5 + '.mp3';

	let video = youtubedl(`${link}`,
		['-x', '--audio-format', 'mp3'],
		{cwd: __dirname});
	video.on('info', function (info) {
		console.log('Download started');
		console.log('filename: ' + info._filename);
		console.log('size: ' + info.size);
	});
	video.pipe(fs.createWriteStream(`./public/uploads/${fileFull}`));
	video.on('error', console.log);
	video.on('complete', () => {
		console.log('Complete');
		cb(null, fileFull);
	});
	video.on('end', () => {
		console.log('Finish');
		cb(null, fileFull);
	})
}

function move(imageFile, fileFull, cb) {
	imageFile.mv(`./public/uploads/${fileFull}`, (err) => {
		if (err) {
			console.log(err);
			return cb(err);
		}
		cb();
	})
}

function ffmpegFunc({ fileFull, filenamemd5 }, cb) {
	console.log(fileFull);
	ffmpeg(`./public/uploads/${fileFull}`)
		.audioCodec('flac')
		.noVideo()
		.withAudioChannels(1)
		.withAudioFrequency(44100)
		.toFormat('flac')
		.save(`./public/uploads/${filenamemd5}.flac`)
		.on('end', cb)
		.on('error', cb);
}

function cloudInFunc(filenamemd5, cb) {
	const filenameCloud = `./public/uploads/${filenamemd5}.flac`;
	storage.bucket(bucketName).upload(filenameCloud, {
		metadata: {
			cacheControl: 'public, max-age=31536000',
		},
	}, cb);
}

function speechFunc(lang, filenamemd5, cb) {
	const speech = require('@google-cloud/speech').v1p1beta1;
	const client = new speech.SpeechClient();
	let gcsUri = `gs://spechtemp/${filenamemd5}.flac`;
	const audio = {
		uri: gcsUri,
	};
	const config = {
		enableAutomaticPunctuation: true,
		encoding: 'FLAC',
		sampleRateHertz: 44100,
		languageCode: `${lang}`,
	};
	const request = {
		audio: audio,
		config: config,
	};

	return async.auto({
		operation: cb => client.longRunningRecognize(request, {}, (err, data) => {
			if (err) {
				return cb(err)
			}

			return cb(null, data);
		}),
		response: ['operation', ({ operation }, cb) => operation
			.promise()
			.catch(cb)
			.then(item => cb(null, item[0]))
		],
		transcription: ['response', ({ response }, cb) => cb(
			null,
			response.results
				.map(result => result.alternatives[0].transcript)
				.join('\n'),
		)],

	}, (err, data) => {
		if (err) {
			return console.log(err);
		}

		console.log(`Transcription: ${data.transcription}`);

		return cb(null, data.transcription);
	})

}

function cloudOutFunc(filenamemd5, cb) {
	storage.bucket(bucketName).file(`${filenamemd5}.flac`).delete(cb);
}
