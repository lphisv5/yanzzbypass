import { bypassUrl } from '../lib/rtaoClient.js';

export default async function handler(req, res) {
  const start = Date.now();
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const data = await bypassUrl(url);
    const time = ((Date.now() - start) / 1000).toFixed(3) + 's';

    const result =
      data?.result ||
      data?.data?.result ||
      null;

    if (!result) {
      return res.status(502).json({ error: 'INVALID_UPSTREAM_RESPONSE' });
    }

    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json({
      result,
      time_taken: time
    });

  } catch (err) {
    const code =
      err.message === 'CIRCUIT_OPEN' ? 503 :
      err.message === 'URL_REQUIRED' ? 400 :
      502;

    return res.status(code).json({
      error: err.message
    });
  }
}
