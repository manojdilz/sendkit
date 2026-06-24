import { Command } from "commander";
import { sendTelegramMessage } from "sendkit-core";


const program = new Command();

program
    .name("sendkit")
    .description("Sendkit CLI")
    .version("1.0.0")
    .command("telegram")
    .description("Send a Telegram message")
    .argument("<chatId>", "Telegram chat ID")
    .argument("<message>", "Message to send")
    .action(async (chatId: string, message: string) => {

        const token = process.env.TELEGRAM_BOT_TOKEN;

        if (!token) {
            console.error("TELEGRAM_BOT_TOKEN is not set");
            process.exit(1);
        }

        if (!chatId || !message) {
            console.error("Chat ID and message are required");
            process.exit(1);
        }

        try {
            const result = await sendTelegramMessage({
                botToken: token,
                chatId,
                message,
            });

            console.log(`Sent Telegram message to chat: ${result.chatId}`);
            console.log(`Telegram message ID: ${result.messageId}`);
        } catch (error) {
            const details = error instanceof Error ? error.message : String(error);
            console.error("Failed to send Telegram message:", details);
            process.exit(1);
        }

    });

program.parseAsync(process.argv);