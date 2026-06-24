import { Command } from "commander"

type TelegramResponse = {
    ok: boolean;
    result?: { message_id: number };
    description?: string;
};

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

        const res = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                }),
            }
        );

        const data = (await res.json()) as TelegramResponse;

        if (!res.ok || !data.ok) {
            const detail = data.description ?? res.statusText;
            console.error(`Telegram API request failed: ${detail}`);
            process.exit(1);
        }

        const messageId = data.result?.message_id;

        console.log(`Sent Telegram message to chat ${chatId}.`);

        if (messageId !== undefined) {
            console.log(`Telegram message ID: ${messageId}`);
        }
    });

program.parseAsync(process.argv);





// https://api.telegram.org/bot8820083457:AAH9oqnC99G7dGqqpuJNk5Z6blwtXvKinSA/getUpdates