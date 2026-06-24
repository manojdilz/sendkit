import { z } from "zod";

export const TelegramMessageInputSchema = z.object({
    chatId: z.string().min(1, "Chat ID is required!"),
    message: z.string().min(1, "Message is required!"),
})

export const TelegramMessageOptionsSchema = TelegramMessageInputSchema.extend({
    botToken: z.string().min(1, "Telegram bot token in required"),
})

export const TelegramSendMessageRequestSchema = z.object({
    chat_id: z.string().min(1),
    text: z.string().min(1),
})

export const TelegramSendMessageResponseSchema = z.object({
    ok: z.boolean(),
    result: z.object({
        message_id: z.number(),
    }).optional(),
    description: z.string().optional(),
})

export const TelegramMessageOutputSchema = z.object({
    ok: z.literal(true),
    chatId: z.string(),
    messageId: z.number(),
})


export type TelegramMessageInput = z.infer<typeof TelegramMessageInputSchema>;
export type TelegramMessageOptions = z.infer<typeof TelegramMessageOptionsSchema>;
export type TelegramMessageOutput = z.infer<typeof TelegramMessageOutputSchema>;
