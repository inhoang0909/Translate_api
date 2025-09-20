export class QwenTimeoutError extends Error {
  constructor(message = "Ollama request timed out") {
    super(message);
    this.name = "QwenTimeoutError";
  }
}

export class QwenCircuitBreakerError extends Error {
  constructor(message = "Ollama circuit breaker: too many failures") {
    super(message);
    this.name = "QwenCircuitBreakerError";
  }
}

export class QwenResponseError extends Error {
  constructor(message = "Invalid response from Ollama") {
    super(message);
    this.name = "QwenResponseError";
  }
}
