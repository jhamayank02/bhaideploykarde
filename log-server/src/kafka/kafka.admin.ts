import kafka from "../config/kafka.config.js";

const kafkaAdmin = kafka.admin();

async function createTopic(topic: string, numPartitions: number) {
    try {
        console.log("Connecting kafka admin...");
        await kafkaAdmin.connect();
        console.log("Connected kafka admin...");

        console.log(`Creating kafka topic [${topic}]...`);
        await kafkaAdmin.createTopics({
            topics: [{
                topic: topic,
                numPartitions: numPartitions
            }]
        });
        console.log(`Created kafka topic [${topic}]`);

        console.log("Disconnecting admin...");
        await kafkaAdmin.disconnect();
        console.log("Disconnected admin");
    } catch (error) {
        console.error(`Error during kafka topic [${topic}] creation. Error: ${error}`);
        process.exit(1);
    }
}

export { createTopic };