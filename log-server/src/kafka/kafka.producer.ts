import kafka from "../config/kafka.config.js";

const producer = kafka.producer();

export const connectKafkaProducer = async () => {
    await producer.connect();
    console.log("Kafka producer connected");
}

export const disconnectKafkaProducer = async () => {
    await producer.disconnect();
    console.log("Kafka producer disconnected");
}

export const sendKafkaMessage = async (topic: string, messages: any) => {
    try {
        await producer.send({
            topic: topic,
            messages: messages.map((msg: any) => ({ value: JSON.stringify(msg) }))
        });
        console.log(`Message sent to topic ${topic}`);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}