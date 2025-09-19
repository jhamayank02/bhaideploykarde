import app from "./app";
import bot from "./bots/bot";
import ServerConfig from "./config/serverConfig";

import "./bots/commands/start";
import "./bots/commands/help";
import "./bots/commands/commands";
import "./bots/commands/deploy";
import "./bots/commands/status";
import "./bots/commands/common";
import logger from "./config/loggerConfig";
import { connectKafkaProducer, disconnectKafkaProducer } from "./kafka/kafkaProducer";
import { getProject } from "./controllers/project.controllers";

app.get('/health', (req, res)=>{
    res.status(200).json({
        success: true,
        status: 200,
        message: `Bot server is up and running`
    });
});
app.get('/project', getProject);

const server = app.listen(ServerConfig.PORT, async () => {
    await connectKafkaProducer();
    bot.launch(() => logger.info("Bot launched in polling mode"));
    logger.info(`Server is running on http://localhost:${ServerConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);
});

server.on('error', async (error) => {
    await disconnectKafkaProducer();
    logger.error('Error starting server:', error);
});

// Handle shutdown signals
async function gracefulShutdown(signal: string) {
    logger.info(`Received ${signal}. Closing server...`);

    try {
        // 1. Stop accepting new HTTP connections
        if (server.listening) {
            await new Promise<void>((resolve, reject) => {
                server.close(err => (err ? reject(err) : resolve()));
            });
            logger.info("Express server closed");
        } else {
            logger.info("Express server was not running");
        }

        // 2. Stop Telegram bot
        bot.stop();
        logger.info("Telegram bot stopped");

        // 3. Disconnect Kafka producer
        await disconnectKafkaProducer();
        logger.info("Kafka producer disconnected");

    } catch (err) {
        logger.error("Error during shutdown:", err);
        process.exit(1);
    } finally {
        logger.info("Shutdown complete. Exiting process.");
        process.exit(0);
    }
}

// Listen for termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));   // Ctrl+C
process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // Docker/K8s



// const webhookURL = `${ServerConfig.SERVER_URL}${ServerConfig.TELEGRAM_BOT_WEBHOOK_PATH}`;
// const webhookURL = ` https://petite-feet-greet.loca.lt/${ServerConfig.TELEGRAM_BOT_WEBHOOK_PATH}`;

// async function start() {
//     // Tell Telegram your webhook URL
//     // await bot.telegram.setWebhook(webhookURL);
//     // console.log(`Telegram Bot Webhook set to ${webhookURL}`);

//     // Start Express server to listen for webhook POST requests
//     app.listen(ServerConfig.PORT, () => {
//         console.log(`Server running on port ${ServerConfig.PORT}`);
//     });
// }

// start().catch(console.error);