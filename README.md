# Sendkit

Sendkit is a TypeScript monorepo for sending Telegram messages and exposing the capability through CLI and Model Context Protocol (MCP) services.

## Repository Structure

- `packages/core` - shared library with Telegram message validation and delivery logic.
- `packages/cli` - command-line interface for configuring a bot token and sending messages.
- `packages/local-mcp` - local MCP server that exposes Telegram messaging via STDIO transport.
- `apps/remote-mcp` - remote MCP service protected by Clerk OAuth and HTTP transport.

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the CLI locally:
   ```bash
   bun run dev:cli
   ```

3. Start the local MCP server:
   ```bash
   bun run dev:local-mcp
   ```

4. Start the remote MCP server:
   ```bash
   bun run dev:remote-mcp
   ```

## CLI Usage

The `sendkit` CLI includes two commands:

- `sendkit init --telegram-bot-token <botToken>`
- `sendkit telegram <chatId> <message>`

### Configure CLI

```bash
sendkit init --telegram-bot-token <your-bot-token>
```

Config is stored at `~/.config/sendkit/config.json`.

### Send a Telegram Message

```bash
sendkit telegram <chatId> "Hello from Sendkit"
```

The CLI loads the bot token from the saved config and sends the message via the core library.

## Local MCP Server

The local MCP server is implemented in `packages/local-mcp/src/index.ts`.

### Requirements

- `TELEGRAM_BOT_TOKEN` environment variable

### Run locally

```bash
TELEGRAM_BOT_TOKEN=<your-bot-token> bun run dev:local-mcp
```

This server registers a `Telegram` tool using `@modelcontextprotocol/sdk` and accepts MCP input via STDIO transport.

## Remote MCP Server

The remote MCP server is implemented in `apps/remote-mcp/src/index.ts`.

### Requirements

- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Run remotely

```bash
CLERK_PUBLISHABLE_KEY=<key> \
CLERK_SECRET_KEY=<key> \
PORT=3000 bun run dev:remote-mcp
```

The service exposes OAuth-protected MCP endpoints and forwards Telegram requests through the core package.

## Core Library

`packages/core` exports the shared Telegram tooling and validation schemas.

### Example

```ts
import { sendTelegramMessage } from "@manoj_dilz/sendkit-core";

await sendTelegramMessage({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: "123456789",
  message: "Hello from Sendkit Core",
});
```

## Build & Release

Root scripts:

- `bun run format`
- `bun run format:check`
- `bun run lint`
- `bun run lint:fix`
- `bun run typecheck`
- `bun run build:core`
- `bun run build:cli`
- `bun run build:local-mcp`

Package-specific publish/pack scripts:

- `bun run --filter @manoj_dilz/sendkit-core pack:dry`
- `bun run --filter @manoj_dilz/sendkit-cli pack:dry`
- `bun run --filter @manoj_dilz/sendkit-mcp pack:dry`

## Notes

- The root workspace is private.
- `packages/cli` and `packages/local-mcp` depend on `@manoj_dilz/sendkit-core` via workspace references.
- The remote app uses Clerk for request authentication and HTTP transport.
