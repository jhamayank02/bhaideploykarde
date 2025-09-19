import { prisma } from "../../config/prisma";
import bot from "../bot";

bot.command("status", async (ctx) => {
    const telgramUser = ctx.from;
    if (!ctx.from) {
        return ctx.reply("Unable to identify youSorry, I couldn't identify you. Please try again in few minutes.");
    }

    // If request from bot, reject it
    if (telgramUser?.is_bot) {
        return ctx.reply('🤖 Sorry, I only talk to humans!');
    }

    // Check if user exists in the db
    const isExistingUser = await prisma.user.findUnique({
        where: {
            user_id: telgramUser.id
        }
    });

    if (!isExistingUser || !isExistingUser.id) {
        return ctx.reply("⚠️ It looks like you haven't created any projects yet.");
    }
    ctx.session.status.userDBId = isExistingUser.id;
    ctx.session.status.step = "projectId";
    return ctx.reply("📝 What is the id of your project?");
});