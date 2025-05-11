import axios from 'axios';
import nodeID3 from 'node-id3';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    const apiUrl = `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}`;
    const { data } = await axios.get(apiUrl);
    const { url: mp3Url, thumb: thumbnailUrl, title } = data.result;

    // Descargar MP3 y miniatura como buffer
    const [mp3Res, imgRes] = await Promise.all([
      axios.get(mp3Url, { responseType: 'arraybuffer' }),
      axios.get(thumbnailUrl, { responseType: 'arraybuffer' })
    ]);

    const mp3Buffer = Buffer.from(mp3Res.data);
    const imageBuffer = Buffer.from(imgRes.data);

    // Agregar portada
    const tags = {
      title: title,
      APIC: imageBuffer // Esto es lo mínimo para portada
    };

    const taggedBuffer = nodeID3.write(tags, mp3Buffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.send(taggedBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process MP3' });
  }
}