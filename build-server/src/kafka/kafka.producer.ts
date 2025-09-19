import { Partitioners } from "kafkajs";
import kafka from "../config/kafka.config";

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
});

export type LogLevel = "INFO" | "ERROR" | "WARN" | "DEBUG";

export interface BuildLog {
    project_id: string;
    build_id: string;
    level: LogLevel;
    timestamp: string;
    log_message: string;
    service: string;
    status: string;
}
export const connectKafkaProducer = async () => {
    try {
        console.log("Kafka producer connecting...");
        await producer.connect();
        console.log("Kafka producer connected");
    } catch (error) {
        console.error(`Kafka producer connection error`, error);
        process.exit(1);
    }
}

export const disconnectKafkaProducer = async () => {
    try {
        console.log("Kafka producer disconnecting...");
        await producer.disconnect();
        console.log("Kafka producer disconnected");
    } catch (error) {
        console.error(`Kafka producer disconnection error`, error);
    }
}

export const sendKafkaMessage = async (topic: string, log: BuildLog) => {
    try {
        await producer.send({
            topic: topic,
            messages: [{ key: log.build_id, value: JSON.stringify(log) }]
        });
        console.log(`Message sent to topic`, topic);
    } catch (error) {
        console.error('Error sending message', error);
    }
}