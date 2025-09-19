import dotenv from "dotenv";

dotenv.config();

type ServerConfig = {
    PORT: number;
    SERVICE: string;
    GIT_REPOSITORY_URL: string;
    AWS_S3_BUCKET: string;
    AWS_S3_REGION: string;
    AWS_S3_ACCESS_KEY_ID: string;
    AWS_S3_SECURITY_ACCESS_KEY: string;
    PROJECT_ID: string;
    BUILD_ID: string;
    KAFKA_CLIENT_ID: string;
    KAFKA_BROKER: string;
    KAFKA_TOPIC: string;
    PROJECT_TYPE: string;
    PROJECT_DEPENDENCY_INSTALL_COMMAND: string;
    PROJECT_BUILD_COMMAND: string;
    PROJECT_BUILD_DIRECTORY: string;
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
    PORT: Number(process.env.PORT) || 9003,
    SERVICE: validateEnv("SERVICE", "build-service"),
    GIT_REPOSITORY_URL: validateEnv("GIT_REPOSITORY_URL"),
    AWS_S3_BUCKET: validateEnv("AWS_S3_BUCKET"),
    AWS_S3_REGION: validateEnv("AWS_S3_REGION"),
    AWS_S3_ACCESS_KEY_ID: validateEnv("AWS_S3_ACCESS_KEY_ID"),
    AWS_S3_SECURITY_ACCESS_KEY: validateEnv("AWS_S3_SECURITY_ACCESS_KEY"),
    PROJECT_ID: validateEnv("PROJECT_ID"),
    BUILD_ID: validateEnv("BUILD_ID"),
    KAFKA_CLIENT_ID: validateEnv("KAFKA_CLIENT_ID", "log-service"),
    KAFKA_BROKER: validateEnv("KAFKA_BROKER", "localhost:9092"),
    KAFKA_TOPIC: validateEnv("KAFKA_TOPIC", "build-logs"),
    PROJECT_TYPE: validateEnv("PROJECT_TYPE"),
    PROJECT_DEPENDENCY_INSTALL_COMMAND: validateEnv("PROJECT_DEPENDENCY_INSTALL_COMMAND"),
    PROJECT_BUILD_COMMAND: validateEnv("PROJECT_BUILD_COMMAND"),
    PROJECT_BUILD_DIRECTORY: validateEnv("PROJECT_BUILD_DIRECTORY")
}

export default serverConfig;