import dotenv from "dotenv";

dotenv.config();

type ServerConfig = {
    PORT: number;
    TELEGRAM_BOT_TOKEN: string;
    BOT_NAME: string;
    DATABASE_URL: string;
    SERVER_URL: string;
    TELEGRAM_BOT_WEBHOOK_PATH: string;
}

const validateEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Env variable ${key} not found`);
    }

    return value;
}

const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 9003,
    TELEGRAM_BOT_TOKEN: validateEnv("TELEGRAM_BOT_TOKEN"),
    BOT_NAME: validateEnv("BOT_NAME"),
    DATABASE_URL: validateEnv("DATABASE_URL"),
    SERVER_URL: validateEnv("SERVER_URL"),
    TELEGRAM_BOT_WEBHOOK_PATH: validateEnv("TELEGRAM_BOT_WEBHOOK_PATH")
}

export default serverConfig;