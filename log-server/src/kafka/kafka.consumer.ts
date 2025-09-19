import kafka from "../config/kafka.config.js";
import ServerConfig from "../config/server.config.js";
import { io } from "../index.js";
import { writeInDB } from "../utils/clickhouse.utils.js";

const consumer = kafka.consumer({ groupId: ServerConfig.KAFKA_CONSUMER_GROUP });

export const connectKafkaConsumer = async (topic: string, messageHandler: (topic: string, partition: string, parsedMessage: string) => void) => {
    try {
        console.log("Connecting kafka consumer...");
        await consumer.connect();
        console.log("Connected kafka consumer");

        console.log(`Subscribing to kafka topic [${topic}]...`);
        await consumer.subscribe({ topic, fromBeginning: true });
        console.log(`Subscribed to kafka topic [${topic}]`);

        await consumer.run({
            eachBatch: async ({ batch, resolveOffset, heartbeat, commitOffsetsIfNecessary }) => {
                try {
                    console.log("BATCH:", batch.firstOffset, batch.messages.length);
                    const messages = batch.messages.map(m => {
                        return JSON.parse(m.value?.toString() || '');
                    });
                    console.log(messages)

                    await writeInDB(messages);

                    // Stream logs to WebSocket clients
                    for (const parsedMessage of messages) {
                        const { project_id, build_id } = parsedMessage;
                        io.to(`${project_id}:${build_id}`).emit("log-response", { logs: [parsedMessage] });
                    }

                    for (const message of batch.messages) {
                        resolveOffset(message.offset);
                    }

                    await commitOffsetsIfNecessary();
                    await heartbeat();
                } catch (err) {
                    console.error("DB insert failed", err);
                }
            }
        });
    } catch (error) {
        console.error(`Error during kafka admin connection. Error: ${error}`);
    }
}

export const disconnectKafkaConsumer = async () => {
    try {
        await consumer.disconnect();
        console.log('Kafka Consumer disconnected');
    } catch (error) {
        console.error(`Error during kafka admin disconnection. Error: ${error}`);
    }
}