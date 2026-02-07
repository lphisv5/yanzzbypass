import { bypassUrl } from '../lib/rtaoClient.js';

export default async function handler(req, res) {
  const start = Date.now();
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url' });
  }

  try {
    const data = await bypassUrl(url);

    const result =
      data?.result ||
      data?.data?.result ||
      null;

    if (!result) {
      return res.status(502).json({ error: 'INVALID_UPSTREAM' });
    }

    const time = ((Date.now() - start) / 1000).toFixed(3) + 's';

    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json({
      result,
      time_taken: time
    });
  } catch (err) {
    return res.status(503).json({
      error: err.message
    });
  }
}
