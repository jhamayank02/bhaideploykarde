import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import serverConfig from './config/config';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { exec, spawn } from 'child_process';
import { BuildLog, connectKafkaProducer, disconnectKafkaProducer, sendKafkaMessage } from './kafka/kafka.producer';
import { Framework, isMalicious } from './utils/malicious.utils';

const s3Client = new S3Client({
    region: serverConfig.AWS_S3_REGION,
    credentials: {
        accessKeyId: serverConfig.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: serverConfig.AWS_S3_SECURITY_ACCESS_KEY
    }
});

async function publishLog(log: BuildLog) {
    await sendKafkaMessage(serverConfig.KAFKA_TOPIC, log);
}

function formatDate(date: Date) {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}

async function uploadFile(fileRelativePath: string) {
    try {
        publishLog({
            project_id: serverConfig.PROJECT_ID,
            build_id: serverConfig.BUILD_ID,
            level: "INFO",
            timestamp: formatDate(new Date()),
            log_message: `Uploading ${fileRelativePath}`,
            service: serverConfig.SERVICE,
            status: "RUNNING"
        });

        const filePath = path.join(process.cwd(), "git_repository", serverConfig.PROJECT_BUILD_DIRECTORY, ...fileRelativePath.split("/"));
        const command = new PutObjectCommand({
            Bucket: serverConfig.AWS_S3_BUCKET,
            Key: serverConfig.PROJECT_ID + "/" + fileRelativePath.split(path.sep).join("/"),
            Body: fs.createReadStream(filePath),
            ContentType: typeof mime.lookup(filePath) === 'string' ? mime.lookup(filePath) as string : undefined
        });

        await s3Client.send(command);
        publishLog({
            project_id: serverConfig.PROJECT_ID,
            build_id: serverConfig.BUILD_ID,
            level: "INFO",
            timestamp: formatDate(new Date()),
            log_message: `Uploaded ${fileRelativePath}`,
            service: serverConfig.SERVICE,
            status: "RUNNING"
        });
    }
    catch (err) {
        await publishLog({
            project_id: serverConfig.PROJECT_ID,
            build_id: serverConfig.BUILD_ID,
            level: "ERROR",
            timestamp: formatDate(new Date()),
            log_message: `Upload failed ${err}`,
            service: serverConfig.SERVICE,
            status: "FAILED"
        });
        throw err;
    }
}

async function uploadToS3(buildFolderPath: string) {
    publishLog({
        project_id: serverConfig.PROJECT_ID,
        build_id: serverConfig.BUILD_ID,
        level: "INFO",
        timestamp: formatDate(new Date()),
        log_message: `Starting to upload...`,
        service: serverConfig.SERVICE,
        status: "RUNNING"
    });
    try {
        const isBuildFolderExists = fs.existsSync(buildFolderPath);
        if (!isBuildFolderExists) {
            throw new Error(`Build folder ${buildFolderPath} doesn't exist`);
        }
        else {
            const contentsOfBuildFolder = fs.readdirSync(buildFolderPath, { recursive: true });
            for (const content of contentsOfBuildFolder) {
                const contentStr = typeof content === 'string' ? content : content.toString();
                const contentPath = path.join(buildFolderPath, contentStr);
                if (fs.statSync(contentPath).isDirectory()) {
                    continue;
                }

                publishLog({
                    project_id: serverConfig.PROJECT_ID,
                    build_id: serverConfig.BUILD_ID,
                    level: "INFO",
                    timestamp: formatDate(new Date()),
                    log_message: `Uploading ${contentStr}...`,
                    service: serverConfig.SERVICE,
                    status: "RUNNING"
                });
                await uploadFile(contentStr);
            }
            await publishLog({
                project_id: serverConfig.PROJECT_ID,
                build_id: serverConfig.BUILD_ID,
                level: "INFO",
                timestamp: formatDate(new Date()),
                log_message: `Upload completed`,
                service: serverConfig.SERVICE,
                status: "RUNNING"
            });
        }
    }
    catch (error) {
        throw error;
    }
}

async function cloneCode() {
    try {
        publishLog({
            project_id: serverConfig.PROJECT_ID,
            build_id: serverConfig.BUILD_ID,
            level: "INFO",
            timestamp: formatDate(new Date()),
            log_message: `Cloning from ${serverConfig.GIT_REPOSITORY_URL}...`,
            service: serverConfig.SERVICE,
            status: "RUNNING"
        });
        const outDirPath = "/home/app";

        return new Promise<void>((resolve, reject) => {
            const p = spawn("sh", ["-c", `cd ${outDirPath} && git clone ${serverConfig.GIT_REPOSITORY_URL} git_repository`], {
                stdio: ["ignore", "pipe", "pipe"],
            });
            p.stdout.on("data", (data: Buffer) => {
                const lines = data.toString().split("\n").filter(Boolean);
                for (const line of lines) {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "INFO",
                        timestamp: formatDate(new Date()),
                        log_message: line,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                }
            });
            p.stderr.on("data", (data: Buffer) => {
                const lines = data.toString().split("\n").filter(Boolean);
                for (const line of lines) {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "ERROR",
                        timestamp: formatDate(new Date()),
                        log_message: line,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                }
            });

            p.on("close", (code) => {
                if (code === 0) {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "INFO",
                        timestamp: formatDate(new Date()),
                        log_message: `Cloned successfully`,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                    resolve();
                } else {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "ERROR",
                        timestamp: formatDate(new Date()),
                        log_message: `Cloning process exited with code ${code}`,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                    reject(new Error(`Clone failed with exit code ${code}`));
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

async function buildCode() {
    try {
        publishLog({
            project_id: serverConfig.PROJECT_ID,
            build_id: serverConfig.BUILD_ID,
            level: "INFO",
            timestamp: formatDate(new Date()),
            log_message: `Build Started...`,
            service: serverConfig.SERVICE,
            status: "RUNNING"
        });
        const outDirPath = "/home/app/git_repository";

        let isMaliciousCommand = await isMalicious(serverConfig.PROJECT_DEPENDENCY_INSTALL_COMMAND, "FRAMEWORK_COMMAND", { framework: serverConfig.PROJECT_TYPE as Framework, baseWorkspace: outDirPath });
        if (isMaliciousCommand.malicious) {
            throw new Error(isMaliciousCommand.reason);
        }
        isMaliciousCommand = await isMalicious(serverConfig.PROJECT_BUILD_COMMAND, "FRAMEWORK_COMMAND", { framework: serverConfig.PROJECT_TYPE as Framework, baseWorkspace: outDirPath });
        if (isMaliciousCommand.malicious) {
            throw new Error(isMaliciousCommand.reason);
        }

        return new Promise<void>((resolve, reject) => {
            const p = spawn("sh", ["-c", `cd ${outDirPath} && ${serverConfig.PROJECT_DEPENDENCY_INSTALL_COMMAND} && ${serverConfig.PROJECT_BUILD_COMMAND}`], {
                stdio: ["ignore", "pipe", "pipe"],
            });

            p.stdout.on("data", (data: Buffer) => {
                const lines = data.toString().split("\n").filter(Boolean);
                for (const line of lines) {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "INFO",
                        timestamp: formatDate(new Date()),
                        log_message: line,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                }
            });

            p.stderr.on("data", (data: Buffer) => {
                const lines = data.toString().split("\n").filter(Boolean);
                for (const line of lines) {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "ERROR",
                        timestamp: formatDate(new Date()),
                        log_message: line,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                }
            });

            p.on("close", (code) => {
                if (code === 0) {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "INFO",
                        timestamp: formatDate(new Date()),
                        log_message: `Build completed successfully`,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                    resolve();
                } else {
                    publishLog({
                        project_id: serverConfig.PROJECT_ID,
                        build_id: serverConfig.BUILD_ID,
                        level: "ERROR",
                        timestamp: formatDate(new Date()),
                        log_message: `Build process exited with code ${code}`,
                        service: serverConfig.SERVICE,
                        status: "RUNNING"
                    });
                    reject(new Error(`Build failed with exit code ${code}`));
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

async function init() {
    try {
        await connectKafkaProducer();
        await cloneCode();
        // Folder to be uploaded on s3
        let folderPath = path.join(process.cwd(), "git_repository"); // If static site
        if (serverConfig.PROJECT_TYPE !== "STATIC_WEBSITE") {
            await buildCode();
            folderPath = path.join(process.cwd(), "git_repository", serverConfig.PROJECT_BUILD_DIRECTORY); // If react js, angular js or vue js
        }
        await uploadToS3(folderPath);
    } catch (error) {
        console.log(error);
        process.exit(1);
    } finally {
        await disconnectKafkaProducer();
    }
}

console.log('Build/upload started...');
(async () => {
    try {
        await init();
        console.log('Deployment complete');
        await publishLog({
            project_id: serverConfig.PROJECT_ID,
            build_id: serverConfig.BUILD_ID,
            level: "INFO",
            timestamp: formatDate(new Date()),
            log_message: `Deployment complete`,
            service: serverConfig.SERVICE,
            status: "FINISHED"
        });
        process.exit(0);
    } catch (error) {
        console.error('Deployment failed:', error);
        await publishLog({
            project_id: serverConfig.PROJECT_ID,
            build_id: serverConfig.BUILD_ID,
            level: "ERROR",
            timestamp: formatDate(new Date()),
            log_message: `Deployment failed`,
            service: serverConfig.SERVICE,
            status: "FAILED"
        });
        process.exit(1);
    }
})();
