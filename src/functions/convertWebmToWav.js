import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg();

async function convertWebmToWav(webmBlob) {
  // Load ffmpeg
  await ffmpeg.load();

  // Write the file to the ffmpeg virtual file system
  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));

  // Run the ffmpeg command to convert WebM to WAV
  await ffmpeg.run('-i', 'input.webm', 'output.wav');

  // Read the converted WAV file from the ffmpeg virtual file system
  const wavData = ffmpeg.FS('readFile', 'output.wav');

  // Convert the Uint8Array to Blob
  const wavBlob = new Blob([wavData.buffer], { type: 'audio/wav' });

  return wavBlob;
}

export default convertWebmToWav;