import { getSupported } from '../lib/rtaoClient.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const result = await getSupported();
    const services = result?.data?.services || [];

    return res.status(200).json({
      Supported: services
    });

  } catch (e) {
    return res.status(503).json({
      Supported: []
    });
  }
}
