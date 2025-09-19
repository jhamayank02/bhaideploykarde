import express from 'express';
import bot from './bots/bot';
import ServerConfig from './config/serverConfig';

const app = express();

// Telegram bot webhook call
// app.use(bot.webhookCallback(ServerConfig.TELEGRAM_BOT_WEBHOOK_PATH));

export default app;