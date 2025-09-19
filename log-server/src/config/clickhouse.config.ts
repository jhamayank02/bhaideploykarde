import ServerConfig from './server.config.js';
import { createClient } from '@clickhouse/client';

export const clickHouseClient = createClient({
    host: ServerConfig.DB_URL,
    username: ServerConfig.DB_USER,
    password: ServerConfig.DB_PASSWORD,
    database: ServerConfig.DB_DATABASE
});
