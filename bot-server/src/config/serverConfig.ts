import dotenv from 'dotenv';

dotenv.config();

type ServerConfigType = {
    PORT: number;
    TELEGRAM_BOT_TOKEN: string;
    BOT_NAME: string;
    BOT_USERNAME: string;
    DATABASE_URL: string;
    SERVER_URL: string;
    TELEGRAM_BOT_WEBHOOK_PATH: string;
    KAFKA_CLIENT_ID: string;
    KAFKA_BROKER: string;
    PROJECT_ID: string
    BUILD_ID: string;
    AWS_S3_BUCKET: string;
    AWS_S3_REGION: string
    AWS_S3_ACCESS_KEY_ID: string;
    AWS_S3_SECURITY_ACCESS_KEY: string;
    GIT_REPOSITORY_URL: string;
    ECS_REGION: string;
    ECS_PORT: number;
    ECS_LAUNCH_TYPE: "FARGATE" | "EC2";
    ECS_CONTATINER_NAME: string
    ECS_CLUSTER: string;
    ECS_TASK_DEFINITION: string;
    ECS_COUNT: number;
    ECS_ASSIGN_PUBLIC_IP: "ENABLED" | "DISABLED"
    ECS_SUBNETS: string;
    ECS_SECURITY_GROUPS: string;
    REVERSE_PROXY_URL: string;
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
}

const ServerConfig: ServerConfigType = {
    PORT: Number(process.env.PORT) || 9000,
    TELEGRAM_BOT_TOKEN: checkEnvVar("TELEGRAM_BOT_TOKEN"),
    BOT_NAME: checkEnvVar("BOT_NAME"),
    BOT_USERNAME: checkEnvVar("BOT_USERNAME"),
    DATABASE_URL: checkEnvVar("DATABASE_URL"),
    SERVER_URL: checkEnvVar("SERVER_URL"),
    TELEGRAM_BOT_WEBHOOK_PATH: checkEnvVar("TELEGRAM_BOT_WEBHOOK_PATH"),
    KAFKA_CLIENT_ID: checkEnvVar("KAFKA_CLIENT_ID", "kafka-client"),
    KAFKA_BROKER: checkEnvVar("KAFKA_BROKER", "localhost:9092"),
    PROJECT_ID: checkEnvVar("PROJECT_ID"),
    BUILD_ID: checkEnvVar("BUILD_ID"),
    AWS_S3_BUCKET: checkEnvVar("AWS_S3_BUCKET"),
    AWS_S3_REGION: checkEnvVar("AWS_S3_REGION"),
    AWS_S3_ACCESS_KEY_ID: checkEnvVar("AWS_S3_ACCESS_KEY_ID"),
    AWS_S3_SECURITY_ACCESS_KEY: checkEnvVar("AWS_S3_SECURITY_ACCESS_KEY"),
    GIT_REPOSITORY_URL: checkEnvVar("GIT_REPOSITORY_URL"),
    ECS_REGION: checkEnvVar("ECS_REGION"),
    ECS_PORT: Number(process.env.ECS_PORT) || 9003,
    ECS_LAUNCH_TYPE: checkEnvVar("ECS_LAUNCH_TYPE") as "FARGATE" | "EC2",
    ECS_CONTATINER_NAME: checkEnvVar("ECS_CONTATINER_NAME"),
    ECS_CLUSTER: checkEnvVar("ECS_CLUSTER"),
    ECS_TASK_DEFINITION: checkEnvVar("ECS_TASK_DEFINITION"),
    ECS_COUNT: Number(process.env.ECS_COUNT),
    ECS_ASSIGN_PUBLIC_IP: checkEnvVar("ECS_ASSIGN_PUBLIC_IP") as "ENABLED" | "DISABLED",
    ECS_SUBNETS: checkEnvVar("ECS_SUBNETS"),
    ECS_SECURITY_GROUPS: checkEnvVar("ECS_SECURITY_GROUPS"),
    REVERSE_PROXY_URL: checkEnvVar("REVERSE_PROXY_URL")
}

export default ServerConfig;