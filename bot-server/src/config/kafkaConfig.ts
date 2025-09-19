import { Kafka } from "kafkajs";
import ServerConfig from "./serverConfig";

const kafka: Kafka = new Kafka({
    clientId: ServerConfig.KAFKA_CLIENT_ID,
    brokers: [ServerConfig.KAFKA_BROKER]
});

export default kafka;