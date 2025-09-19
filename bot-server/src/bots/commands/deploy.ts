import { prisma } from "../../config/prisma";
import bot from "../bot";

bot.command('deploy', async (ctx) => {
    const telgramUser = ctx.from;
    if (!ctx.from) {
        return ctx.reply("Unable to identify you. Sorry, I couldn't identify you. Please try again in few minutes.");
    }

    // If request from bot, reject it
    if (telgramUser?.is_bot) {
        return ctx.reply('🤖 Sorry, I only talk to humans!');
    }

    // Check if user already exists
    const isExistingUser = await prisma.user.findUnique({ where: { user_id: telgramUser.id } });

    if (!isExistingUser) {
        // Store user data in db
        const createdUser = await prisma.user.create({
            data: {
                first_name: telgramUser.first_name,
                ...(telgramUser.last_name ? { last_name: telgramUser.last_name } : {}),
                user_id: telgramUser.id as number
            }
        });
        if (!createdUser || !createdUser.id) {
            return ctx.reply('⚠️ Something went wrong. Please try again in a few minutes.');
        }
        ctx.session.deployment.userDBId = createdUser.id;
    }
    else {
        ctx.session.deployment.userDBId = isExistingUser.id;
    }
    ctx.session.deployment.step = "isExisting";
    ctx.reply("📝 Please provide a project ID if you have one, or type \"new\" to start a new project")
});