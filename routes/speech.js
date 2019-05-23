var express = require('express');
var router = express.Router();
const speech = require('@google-cloud/speech');
const fs = require('fs');
const client = new speech.SpeechClient();

router.get('/', async function(req, res) {
  // Creates a client
  const client = new speech.SpeechClient();

  // The name of the audio file to transcribe
  const fileName = './3.flac';
  console.log(__dirname);
  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync('./public/uploads/.flac');
  const audioBytes = file.toString('base64');
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
    // uri: 'gs://spechtemp/3.flac'
  };
  const config = {
    enableAutomaticPunctuation: false,
    encoding: 'FLAC',
    sampleRateHertz: 44100,
    languageCode: 'fi-FI',
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
  console.log(`Transcription: ${transcription}`);
});

module.exports = router;
