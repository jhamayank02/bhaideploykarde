import { Kafka } from "kafkajs";
import serverConfig from "./config";

const kafka: Kafka = new Kafka({
    clientId: serverConfig.KAFKA_CLIENT_ID,
    brokers: [serverConfig.KAFKA_BROKER]
});

export default kafka;