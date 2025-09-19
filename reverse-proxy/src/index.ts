import express from 'express';
import ServerConfig from './config/config';
import logger from './config/logger.config';
import httpProxy from 'http-proxy';
import serverConfig from './config/config';

const app = express();

const port = ServerConfig.PORT;

const proxy = httpProxy.createProxy();

app.use((req, res) => {
    // Req URL - http://project_id.localhost:9002

    const hostname = req.hostname; // project_id.localhost
    const subdomain = hostname.split('.')[0]; // project_id

    const BASE_URL = `${serverConfig.CLOUDFRONT_DISTRIBUTION_URL}/${subdomain}`;

    return proxy.web(req, res, { target: BASE_URL, changeOrigin: true });
});

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/') {
        proxyReq.path += 'index.html';
    }
});

app.listen(port, () => {
    logger.info(`Reverse proxy app listening at http://localhost:${port}`);
});
