import express from 'express';
import axios from 'axios';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/ytmp3', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    const apiUrl = `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}`;
    const { data } = await axios.get(apiUrl);
    const { url: mp3Url, thumb: thumbnailUrl, title } = data.result;

    const id = uuidv4();
    const tmpDir = '/tmp'; // En Render, puedes escribir a /tmp
    const mp3Path = path.join(tmpDir, `${id}.mp3`);
    const coverPath = path.join(tmpDir, `${id}.jpg`);

    // Descargar MP3 y miniatura
    const [mp3Res, imgRes] = await Promise.all([
      axios.get(mp3Url, { responseType: 'arraybuffer' }),
      axios.get(thumbnailUrl, { responseType: 'arraybuffer' }),
    ]);

    fs.writeFileSync(mp3Path, mp3Res.data);
    fs.writeFileSync(coverPath, imgRes.data);

    // Incrustar la portada usando ffmpeg
    const outputPath = path.join(tmpDir, `${id}_with_cover.mp3`);

    ffmpeg(mp3Path)
      .input(coverPath)
      .inputOptions('-f image2')
      .outputOptions('-map 0 -map 1')
      .output(outputPath)
      .on('end', () => {
        // Leer el archivo final y devolverlo
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
        const finalBuffer = fs.readFileSync(outputPath);
        res.send(finalBuffer);
      })
      .on('error', (err) => {
        console.error('Error al procesar MP3:', err);
        res.status(500).json({ error: 'Failed to process MP3' });
      })
      .run();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch MP3 or Thumbnail' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});