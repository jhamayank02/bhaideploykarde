import CircuitBreaker, { Options } from 'opossum';
import ServerConfig from '../config/server.config.js';

type BreakerOptions = {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
};

const breakerDefaultOptions: BreakerOptions = {
    timeout: Number(ServerConfig.CIRCUIT_BREAKER_TIMEOUT),
    errorThresholdPercentage: Number(ServerConfig.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE),
    resetTimeout: Number(ServerConfig.CIRCUIT_BREAKER_RESET_TIMEOUT)
};

export function createBreaker<T>(
    action: (...args: any[]) => Promise<T>,
    options: BreakerOptions = breakerDefaultOptions
) {
    const breaker = new CircuitBreaker(action, {
        timeout: options.timeout ?? 3000,
        errorThresholdPercentage: options.errorThresholdPercentage ?? 50,
        resetTimeout: options.resetTimeout ?? 10000,
    });


    breaker.on("open", () => console.warn("Breaker OPENED"));
    breaker.on("halfOpen", () => console.warn("Breaker HALF-OPEN"));
    breaker.on("close", () => console.info("Breaker CLOSED"));

    return breaker;
}