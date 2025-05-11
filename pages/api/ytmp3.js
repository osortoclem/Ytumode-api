import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ID3Writer from 'node-id3';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'Missing YouTube URL' });

  try {
    const apiUrl = `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}`;
    const { data } = await axios.get(apiUrl);
    const { url: mp3Url, thumb: thumbnailUrl, title } = data.result;

    const id = uuidv4();
    const tmp = '/tmp'; // solo esta carpeta es escribible en Vercel
    const mp3Path = path.join(tmp, `${id}.mp3`);
    const coverPath = path.join(tmp, `${id}.jpg`);

    // Descargar MP3
    const mp3Response = await axios({ url: mp3Url, responseType: 'arraybuffer' });
    writeFileSync(mp3Path, mp3Response.data);

    // Descargar imagen
    const imgResponse = await axios({ url: thumbnailUrl, responseType: 'arraybuffer' });
    writeFileSync(coverPath, imgResponse.data);

    // Insertar portada en el MP3
    const tags = {
      image: {
        mime: 'image/jpeg',
        type: { id: 3, name: 'front cover' },
        description: 'Thumbnail',
        imageBuffer: imgResponse.data
      }
    };

    // Usamos update para modificar sin sobrescribir mal
    const tagged = ID3Writer.update(tags, mp3Path);

    const finalBuffer = await fs.readFile(mp3Path);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.send(finalBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process MP3' });
  }
}