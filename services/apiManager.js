import dotenv from "dotenv";
dotenv.config();

const OLLAMA_API_URLS = [
  process.env.OLLAMA_API_URL_1 || "http://10.13.34.181:11434/api/generate",
  process.env.OLLAMA_API_URL_2 || "http://10.13.34.181:11435/api/generate"
];

const apiBusyStatus = OLLAMA_API_URLS.map(() => null);

export function getAvailableApiIndex() {
  for (let i = 0; i < apiBusyStatus.length; i++) {
    if (!apiBusyStatus[i]) {
      return i;
    }
  }
  return -1;
}

export function markApiBusy(index, clientId = "unknown", model = "unknown") {
  apiBusyStatus[index] = {
    busy: true,
    clientId,
    model,
    startedAt: Date.now(),
  };
  console.log(`[apiManager] 🟡 API ${index} marked busy by ${clientId}`);
}

export function markApiFree(index) {
  if (apiBusyStatus[index]) {
    const { clientId, startedAt } = apiBusyStatus[index];
    const duration = Date.now() - startedAt;
    console.log(`[apiManager] 🟢 API ${index} freed by ${clientId} after ${duration}ms`);
  }
  apiBusyStatus[index] = null;
}

export function getApiUrl(index) {
  return OLLAMA_API_URLS[index];
}

export function logApiStatus() {
  console.log("📊 Current API status:");
  apiBusyStatus.forEach((status, i) => {
    if (status) {
      const age = Date.now() - status.startedAt;
      console.log(` - API ${i}: BUSY by ${status.clientId}, model: ${status.model}, age: ${age}ms`);
    } else {
      console.log(` - API ${i}: ✅ FREE`);
    }
  });
}
