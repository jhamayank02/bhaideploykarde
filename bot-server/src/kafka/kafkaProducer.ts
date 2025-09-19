import kafka from "../config/kafkaConfig";
import logger from "../config/loggerConfig";

const producer = kafka.producer();

export const connectKafkaProducer = async () => {
    try {
        logger.info("Kafka producer connecting...");
        await producer.connect();
        logger.info("Kafka producer connected");
    } catch (error) {
        logger.error(`Kafka producer connection error`, error);
        process.exit(1);
    }
}

export const disconnectKafkaProducer = async () => {
        try {
        logger.info("Kafka producer disconnecting...");
        await producer.disconnect();
        logger.info("Kafka producer disconnected");
    } catch (error) {
        logger.error(`Kafka producer disconnection error`, error);
    }
}

export const sendKafkaMessage = async (topic: string, messages: any) => {
    try {
        await producer.send({
            topic: topic,
            messages: messages.map((msg: any) => ({ value: JSON.stringify(msg) }))
        });
        logger.info(`Message sent to topic`, topic);
    } catch (error) {
        logger.error('Error sending message', error);
    }
}