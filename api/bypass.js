import { bypassUrl } from '../lib/rtaoClient.js';

export default async function handler(req, res) {
  const start = Date.now();

  const url = typeof req.query.url === 'string'
    ? req.query.url.trim()
    : '';

  if (!url) {
    return res.status(400).json({
      error: 'URL_REQUIRED'
    });
  }

  const response = await bypassUrl(url);

  if (!response.ok) {
    return res.status(502).json({
      error: response.error
    });
  }

  const result =
    response.data?.result ||
    response.data?.data?.result ||
    null;

  if (!result) {
    return res.status(502).json({
      error: 'INVALID_UPSTREAM_RESPONSE'
    });
  }

  const time = ((Date.now() - start) / 1000).toFixed(3) + 's';

  res.setHeader('Cache-Control', 'no-store');

  return res.status(200).json({
    result,
    time_taken: time
  });
}
