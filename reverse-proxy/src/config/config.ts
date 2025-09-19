import dotenv from "dotenv";

dotenv.config();

type ServerConfig = {
    PORT: number;
    CLOUDFRONT_DISTRIBUTION_URL: string;
}

const validateEnv = (name: string, fallback?: string): string => {
    const value = process.env[name];

    if (value) {
        return value;
    }

    if (fallback !== undefined) {
        return fallback;
    }

    throw new Error(`Environment variable "${name}" is required but was not found.`);
}

const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 9002,
    CLOUDFRONT_DISTRIBUTION_URL: validateEnv("CLOUDFRONT_DISTRIBUTION_URL")
}

export default serverConfig;