import { generateSlug } from "random-word-slugs";
import { commands_chat_template, deploying_project_template } from "../../templates/templates";
import { DeploymentStatus, ProjectType } from "@prisma/client";
import bot from "../bot";
import { prisma } from "../../config/prisma";
// import runEcsTask, { params } from "../../utils/ecs";
import { PROJECT_TYPES } from "../../utils/constants";

bot.on('text', async (ctx) => {
    // If deploying
    if (ctx.session.deployment.step) {
        if (ctx.session.deployment.step === "isExisting") {
            const projectId = ctx.message.text;

            if (projectId.toLowerCase() === "new") {
                ctx.session.deployment.step = "projectName";
                return ctx.reply("📝 What is the name of your project?");
            }

            const isExistingProject = await prisma.project.findUnique({ where: { project_id: projectId } });
            if (!isExistingProject) {
                ctx.session.deployment = {};
                return ctx.reply("Project not found");
            }

            const deployment = await prisma.deployment.create({
                data: {
                    project_id: isExistingProject.id
                }
            });

            if (!deployment || !deployment.id) {
                ctx.session.deployment = {};
                return ctx.reply('⚠️ Something went wrong. Please try again in a few minutes.');
            }

            // Run ECS task

            return ctx.reply(
                deploying_project_template(isExistingProject.name as string, isExistingProject.project_id, isExistingProject.git_url, isExistingProject.slug, DeploymentStatus.PENDING, isExistingProject.project_type), { parse_mode: 'HTML' }
            );
        }
        else if (ctx.session.deployment.step === "projectName") {
            ctx.session.deployment.projectName = ctx.message.text;
            ctx.session.deployment.step = 'projectType';
            let projectTypeOptions = '❓Which type of project it is?\n';
            for (const entry of Object.entries(PROJECT_TYPES)) {
                projectTypeOptions += `${entry[0]}: ${entry[1]}\n`;
            }
            projectTypeOptions += 'To select a project type, reply with the option no.'
            return ctx.reply(projectTypeOptions);
        }
        else if (ctx.session.deployment.step === "projectType") {
            const selectedOption = Number(ctx.message.text);
            const projectTypes = Object.entries(PROJECT_TYPES);
            if (isNaN(selectedOption) || selectedOption <= 0 || selectedOption > projectTypes.length) {
                return ctx.reply('❌ Invalid option.');
            }
            ctx.session.deployment.projectType = projectTypes[selectedOption-1][1];
            if (ctx.session.deployment.projectType === 'STATIC_WEBSITE') {
                ctx.session.deployment.step = 'gitUrl';
                return ctx.reply('🔗 Now send your GitHub repo URL:');
            }
            ctx.session.deployment.step = 'dependencyInstallCmd';
            return ctx.reply('💻 Command to install project dependencies?');
        }
        else if (ctx.session.deployment.step === "dependencyInstallCmd") {
            ctx.session.deployment.dependency_install_command = ctx.message.text;
            ctx.session.deployment.step = 'buildCmd';
            return ctx.reply('🏗️ Command to build project?');
        }
        else if (ctx.session.deployment.step == "buildCmd") {
            ctx.session.deployment.build_command = ctx.message.text;
            ctx.session.deployment.step = 'buildDir';
            return ctx.reply('📁 What is your build directory name?');
        }
        else if (ctx.session.deployment.step == "buildDir") {
            ctx.session.deployment.build_directory = ctx.message.text;
            ctx.session.deployment.step = 'gitUrl';
            return ctx.reply('🔗 Now send your GitHub repo URL:');
        }
        else if (ctx.session.deployment.step === "gitUrl") {
            const gitUrl = ctx.message.text;
            if (!gitUrl.startsWith('https://github.com/')) {
                return ctx.reply('❌ That doesn’t look like a valid GitHub URL.');
            }

            const projectName = ctx.session.deployment.projectName;
            const userDBId = ctx.session.deployment.userDBId;
            const projectType = ctx.session.deployment.projectType;
            const dependency_install_command = ctx.session.deployment.dependency_install_command;
            const build_command = ctx.session.deployment.build_command;
            const build_directory = ctx.session.deployment.build_directory;
            ctx.session.deployment = {};

            const slug = generateSlug();
            const projectId = projectName?.split(' ').join("-") + "@" + slug;

            const createdProject = await prisma.project.create({
                data: {
                    name: projectName as string,
                    git_url: gitUrl,
                    slug,
                    user_id: Number(userDBId),
                    project_type: projectType as ProjectType,
                    project_id: projectId,
                    ...(projectType !== ProjectType.STATIC_WEBSITE && dependency_install_command ? { dependency_install_command: dependency_install_command as string } : {}),
                    ...(projectType !== ProjectType.STATIC_WEBSITE && build_command ? { build_command: build_command as string } : {}),
                    ...(projectType !== ProjectType.STATIC_WEBSITE && build_directory ? { build_directory: build_directory as string } : {})
                }
            });

            if (!createdProject || !createdProject.id) {
                return ctx.reply('⚠️ Something went wrong. Please try again in a few minutes.');
            }
            const deployment = await prisma.deployment.create({
                data: {
                    project_id: createdProject.id
                }
            });
            if (!deployment || !deployment.id) {
                ctx.session.deployment = {};
                return ctx.reply('⚠️ Something went wrong. Please try again in a few minutes.');
            }

            // Run ECS task

            return ctx.reply(
                deploying_project_template(projectName as string, projectId, gitUrl, slug, DeploymentStatus.PENDING, projectType as string), { parse_mode: 'HTML' }
            );
        }
    }
    // If checking status
    else if (ctx.session.status.step) {
        const step = ctx.session.status.step;
        const userId = ctx.session.status.userDBId;
        if (!userId || !step) {
            ctx.session.status = {};
            return ctx.reply('⚠️ Oops! Something went wrong while processing your request. Please try again shortly.');
        }

        const projectId = ctx.message.text;
        const isExistingProject = await prisma.project.findUnique({
            where: {
                project_id: projectId,
                user_id: userId
            },
            include: {
                Deployment: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1,
                },
            },
        });

        if (!isExistingProject || !isExistingProject.id) {
            return ctx.reply("❌ Project not found");
        }

        // TODO - Handle if there is no deployment found
        return ctx.reply(`🚧 Your project’s deployment is currently *${isExistingProject.Deployment?.[0]?.status}*.`)
    }

    return ctx.reply(
        commands_chat_template(), { parse_mode: "HTML" }
    )
});