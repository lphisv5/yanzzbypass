import { getSupported } from '../lib/rtaoClient.js';

export default async function handler(req, res) {
  try {
    const data = await getSupported();

    const services =
      data?.data?.services ||
      data?.services ||
      [];

    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json({
      Supported: services
    });
  } catch (err) {
    return res.status(503).json({
      error: err.message
    });
  }
}
