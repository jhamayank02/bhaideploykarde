// index.js
import express from 'express';
import { connectKafkaProducer, disconnectKafkaProducer, sendKafkaMessage } from './kafka/kafka.producer.js';
import { disconnectKafkaConsumer, connectKafkaConsumer } from './kafka/kafka.consumer.js';
import ServerConfig from './config/server.config.js';
import { readFromDB } from './utils/clickhouse.utils.js';
import logger from './config/logger.config.js';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fetchProjectStatus } from './utils/project.utils.js';

const app = express();
const server = http.createServer(app);
export const io = new Server(server)

const port = ServerConfig.PORT;
const KAFKA_TOPIC = ServerConfig.KAFKA_TOPIC;

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

// Start Kafka Consumer on app start
connectKafkaConsumer(KAFKA_TOPIC, (topic, partition, message) => {
    console.log(`Received message from ${topic}:${partition}:`, message);
    // Process the consumed message here
}).catch(console.error);

// Start Kafka Producer on app start
connectKafkaProducer().catch(console.error);

app.get('/project', async (req, res) => {
    const project_id = Array.isArray(req.query.project_id) ? req.query.project_id[0] : req.query.project_id;
    const build_id = Array.isArray(req.query.build_id) ? req.query.build_id[0] : req.query.build_id;

    if (!project_id || typeof project_id !== 'string') {
        return res.status(400).json({
            status: 400,
            success: false,
            error: "Invalid project_id"
        });
    }
    if (!build_id || isNaN(Number(build_id))) {
        return res.status(400).json({
            status: 400,
            success: false,
            error: "Invalid build_id"
        });
    }

    const response: any = await fetchProjectStatus(project_id, Number(build_id));
    if (!response.success) {
        return res.render('logs', { project_id, build_id, error: response.error || 'Something went wrong. Please try again later' });
    }

    const reverse_proxy_url = new URL(ServerConfig.REVERSE_PROXY_SERVER_URL);
    reverse_proxy_url.hostname = `${project_id}.${reverse_proxy_url.hostname}`;

    res.render('logs', { project_id, build_id, live_url: reverse_proxy_url });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 200,
        message: `Log server is up and running`
    });
});


server.listen(port, async () => {
    logger.info(`Express app listening at http://localhost:${port}`);
});




io.on('connection', (socket) => {
    console.log("A new user connectd", socket.id);

    // User queries for the logs
    socket.on('log-query', async (message) => {
        const { project_id, build_id } = message;

        // Fetch logs from the db (if any)
        const logs = await readFromDB(project_id, build_id);

        // TODO -> MAKE API CALL TO BOT SERVER TO CHECK IF THERE IS ANY PROJECT_ID AND BUILD_ID REGISTERED

        // if no logs then check kafka for logs [Join the room (project_id:build_id) for realtime logs]
        if (logs?.length === 0) {
            io.to(socket.id).emit("log-response", { logs });
            socket.join(`${project_id}:${build_id}`);
            console.log(`${socket.id} joined ${project_id}:${build_id}`);
        }
        // if last log is running then combine the db logs and get more logs from kafka [Join the room (project_id:build_id) for realtime logs]
        else if (logs && logs.length > 0 && logs[logs.length - 1].status === 'RUNNING') {
            io.to(socket.id).emit("log-response", { logs });
            socket.join(`${project_id}:${build_id}`);
            console.log(`${socket.id} joined ${project_id}:${build_id}`);
        }
        // if last log is failed or finished then return the logs [It means the deployment process is already finished]
        else {
            socket.join(`${project_id}:${build_id}`);
            console.log(`${socket.id} joined ${project_id}:${build_id}`);
            io.to(socket.id).emit("log-response", { logs });
        }
    });

    socket.on('disconnect', () => {
        console.log("A user disconnectd", socket.id);
    });
});




// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await disconnectKafkaConsumer();
    await disconnectKafkaProducer();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await disconnectKafkaConsumer();
    await disconnectKafkaProducer();
    process.exit(0);
});