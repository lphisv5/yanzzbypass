import axios from 'axios';

const BASE_URL = 'https://rtao.lol/free/v2';
const API_KEY = process.env.RTAO_API_KEY;

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
    'x-api-key': API_KEY,
    'User-Agent': 'yanz-bypass/1.0'
  }
});

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

async function fetchWithRetry(config, retry = 0) {
  try {
    const res = await client(config);
    recordSuccess();
    return { ok: true, data: res.data };
  } catch (err) {
    if (retry < MAX_RETRY) {
      return fetchWithRetry(config, retry + 1);
    }
    recordFail();
    return {
      ok: false,
      error: err.response?.status || 'UPSTREAM_ERROR'
    };
  }
}

export async function getSupported() {
  if (!API_KEY) {
    return { ok: false, error: 'API_KEY_MISSING' };
  }
  if (isCircuitOpen()) {
    return { ok: false, error: 'CIRCUIT_OPEN' };
  }
  return fetchWithRetry({ url: '/supported' });
}

export async function bypassUrl(url) {
  if (!API_KEY) {
    return { ok: false, error: 'API_KEY_MISSING' };
  }
  if (!url) {
    return { ok: false, error: 'URL_REQUIRED' };
  }
  if (isCircuitOpen()) {
    return { ok: false, error: 'CIRCUIT_OPEN' };
  }

  return fetchWithRetry({
    url: '/bypass',
    params: { url }
  });
}
