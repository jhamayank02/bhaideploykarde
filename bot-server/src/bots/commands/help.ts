import { help_chat_template } from "../../templates/templates";
import bot from "../bot";

bot.help((ctx) => {
    ctx.reply(
        help_chat_template(), { parse_mode: "HTML" }
    )
});