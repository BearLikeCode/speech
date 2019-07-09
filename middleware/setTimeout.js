module.exports = (req, res, next) => {
	const space = ' ';
	let isFinished = false;
	let isDataSent = false;

	if (!req.url.includes('/main/youtube')) {
		next();
		return
	}

	res.once('finish', () => {
		isFinished = true
	});

	res.once('end', () => {
		isFinished = true
	});

	res.once('close', () => {
		isFinished = true
	});

	res.on('data', (data) => {
		if (data !== space) {
			isDataSent = true
		}
	});

	const waitAndSend = () => {
		setTimeout(() => {
			if (!isFinished && !isDataSent) {
				if (!res.headersSent) {
					res.writeHead(202)
				}

				res.write(space);

				waitAndSend()
			}
		}, 15000)
	};

	waitAndSend();
	next()
};
