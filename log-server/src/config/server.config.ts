import { configDotenv } from "dotenv";

configDotenv();

type ServerConfigType = {
    PORT: number;
    KAFKA_TOPIC: string;
    KAFKA_CONSUMER_GROUP: string;
    KAFKA_PARTITIONS: number;
    KAFKA_CLIENT_ID: string;
    KAFKA_BROKER: string;
    DB_URL: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    REVERSE_PROXY_SERVER_URL: string;
    CONSUL_HOST: string;
    CONSUL_PORT: string;
    BOT_SERVER_CONSUL_SERVICE_NAME: string;
    CIRCUIT_BREAKER_TIMEOUT: string;
    CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: string;
    CIRCUIT_BREAKER_RESET_TIMEOUT: string;
}

const checkEnvVar = (name: string, fallback?: string): string => {
    const value = process.env[name];

    if (value) {
        return value;
    }

    if (fallback !== undefined) {
        return fallback;
    }

    throw new Error(`Environment variable "${name}" is required but was not found.`);
};

const ServerConfig: ServerConfigType = {
    PORT: Number(process.env.PORT) || 9001,
    KAFKA_TOPIC: checkEnvVar("KAFKA_TOPIC"),
    KAFKA_CONSUMER_GROUP: checkEnvVar("KAFKA_CONSUMER_GROUP"),
    KAFKA_PARTITIONS: Number(process.env.PORT) || 1,
    KAFKA_CLIENT_ID: checkEnvVar("KAFKA_CLIENT_ID"),
    KAFKA_BROKER: checkEnvVar("KAFKA_BROKER"),
    DB_URL: checkEnvVar("DB_URL", "http://localhost:8123"),
    DB_USER: checkEnvVar("DB_USER", "root"),
    DB_PASSWORD: checkEnvVar("DB_PASSWORD", "password"),
    DB_DATABASE: checkEnvVar("DB_DATABASE", "default"),
    REVERSE_PROXY_SERVER_URL: checkEnvVar("REVERSE_PROXY_SERVER_URL", "http://localhost:9002/"),
    CONSUL_HOST: checkEnvVar("CONSUL_HOST"),
    CONSUL_PORT: checkEnvVar("CONSUL_PORT"),
    BOT_SERVER_CONSUL_SERVICE_NAME: checkEnvVar("BOT_SERVER_CONSUL_SERVICE_NAME"),
    CIRCUIT_BREAKER_TIMEOUT: checkEnvVar("CIRCUIT_BREAKER_TIMEOUT"),
    CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: checkEnvVar("CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE"),
    CIRCUIT_BREAKER_RESET_TIMEOUT: checkEnvVar("CIRCUIT_BREAKER_RESET_TIMEOUT")
}

export default ServerConfig;