import axios from 'axios';

const BASE_URL = 'https://rtao.lol/free/v2';
const TIMEOUT = 8000;
const MAX_RETRY = 2;
const FAIL_LIMIT = 5;
const COOLDOWN_MS = 60_000;

let failCount = 0;
let circuitOpenUntil = 0;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'User-Agent': 'Bypass-API-Vercel/1.0'
  }
});

/* ---------- Circuit Breaker ---------- */
const isCircuitOpen = () => Date.now() < circuitOpenUntil;

const recordFail = () => {
  failCount++;
  if (failCount >= FAIL_LIMIT) {
    circuitOpenUntil = Date.now() + COOLDOWN_MS;
    failCount = 0;
  }
};

const recordSuccess = () => {
  failCount = 0;
};

/* ---------- Retry Wrapper ---------- */
async function fetchWithRetry(config, retry = 0) {
  try {
    const res = await client(config);
    recordSuccess();
    return res.data;
  } catch (err) {
    if (retry < MAX_RETRY) {
      return fetchWithRetry(config, retry + 1);
    }
    recordFail();
    throw err;
  }
}

/* ---------- Public API ---------- */

export async function getSupported() {
  if (isCircuitOpen()) {
    throw new Error('CIRCUIT_OPEN');
  }

  return await fetchWithRetry({ url: '/supported' });
}

export async function bypassUrl(url) {
  if (!url) throw new Error('URL_REQUIRED');
  if (isCircuitOpen()) {
    throw new Error('CIRCUIT_OPEN');
  }

  return await fetchWithRetry({
    url: '/bypass',
    params: { url }
  });
}
