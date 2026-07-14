# Sendkit Documentation

This document describes Sendkit’s architecture, packages, APIs, development workflow, and deployment requirements.

## Project Overview

Sendkit is a monorepo built with Bun and TypeScript. It provides:

- a reusable core library for Telegram messaging,
- a CLI for bot configuration and message sending,
- a local MCP server for tool integrations,
- a remote MCP server with Clerk OAuth protection.

## Package Definitions

### `packages/core`

The core package is the shared foundation.

- Entry point: `packages/core/src/index.ts`
- Main exported function: `sendTelegramMessage`
- Validation: `zod` schemas in `packages/core/src/schemas.ts`
- Supported payload:
  - `botToken`: Telegram bot token
  - `chatId`: Telegram chat ID
  - `message`: message text

#### Core behavior

`sendTelegramMessage` validates input, constructs a Telegram API request to `https://api.telegram.org/bot<token>/sendMessage`, and returns a normalized response payload.

### `packages/cli`

The CLI package exposes a simple command interface.

- Entry point: `packages/cli/src/index.ts`
- Commands:
  - `sendkit init --telegram-bot-token <botToken>`
  - `sendkit telegram <chatId> <message>`
- Config location: `~/.config/sendkit/config.json`
- Runtime dependencies: `commander`, `zod`

#### CLI flow

1. `init` saves bot credentials to a secure config file.
2. `telegram` reads bot credentials from the config file.
3. `telegram` delegates send logic to `@manoj_dilz/sendkit-core`.

### `packages/local-mcp`

The local MCP package exposes the Telegram tool over a STDIO-based MCP server.

- Entry point: `packages/local-mcp/src/index.ts`
- Uses: `@modelcontextprotocol/sdk`
- Required env var: `TELEGRAM_BOT_TOKEN`

#### Tool registration

The server registers a `Telegram` tool with the following metadata:

- `title`: `Telegram`
- `description`: `Send a Telegram message.`
- `inputSchema`: `TelegramMessageInputSchema.shape`

On execution, the tool calls `sendTelegramMessage` with the configured bot token and returns a text result plus structured response.

### `apps/remote-mcp`

The remote MCP application serves Telegram messaging over HTTP and Clerk-protected OAuth.

- Entry point: `apps/remote-mcp/src/index.ts`
- Uses: `hono`, `@clerk/backend`, `@clerk/mcp-tools`, `@modelcontextprotocol/sdk`
- Required env vars:
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Optional env var:
  - `PORT` (defaults to `3000`)

#### Remote flow

- `GET /.well-known/oauth-protected-resource/:botToken/mcp`
  - returns Clerk protected resource metadata
- `POST /:botToken/mcp`
  - authenticates incoming requests using Clerk
  - starts a new MCP server instance for the requested bot token
  - proxies the MCP request through `WebStandardStreamableHTTPServerTransport`

The remote server dynamically creates a tool instance for each request and closes the MCP server after handling.

## Usage Examples

### CLI Example

```bash
sendkit init --telegram-bot-token <your-bot-token>
sendkit telegram <chatId> "Hello from Sendkit"
```

### Local MCP Example

```bash
TELEGRAM_BOT_TOKEN=<your-bot-token> bun run dev:local-mcp
```

### Remote MCP Example

```bash
CLERK_PUBLISHABLE_KEY=<key> \
CLERK_SECRET_KEY=<key> \
PORT=3000 bun run dev:remote-mcp
```

### Programmatic Example

```ts
import { sendTelegramMessage } from "@manoj_dilz/sendkit-core";

await sendTelegramMessage({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: "123456789",
  message: "Hello from Sendkit Core",
});
```

## Development Workflow

### Install

```bash
bun install
```

### Code quality

- Format: `bun run format`
- Check formatting: `bun run format:check`
- Lint: `bun run lint`
- Fix lint issues: `bun run lint:fix`
- Typecheck: `bun run typecheck`

### Build packages

- `bun run build:core`
- `bun run build:cli`
- `bun run build:local-mcp`

### Dry-pack publish checks

- `bun run --filter @manoj_dilz/sendkit-core pack:dry`
- `bun run --filter @manoj_dilz/sendkit-cli pack:dry`
- `bun run --filter @manoj_dilz/sendkit-mcp pack:dry`

## Architecture Notes

- All packages use `type: "module"` and ESM-style exports.
- `packages/cli` and `packages/local-mcp` depend on the shared `@manoj_dilz/sendkit-core` package.
- `apps/remote-mcp` relies on Clerk to authenticate MCP HTTP requests and then connects the MCP server to a web transport.

## File Layout

- `package.json` - root workspace config and scripts
- `packages/core` - shared Telegram API implementation
- `packages/cli` - CLI tool
- `packages/local-mcp` - local MCP server
- `apps/remote-mcp` - remote MCP service

## Troubleshooting

- If `sendkit telegram` fails, verify that `~/.config/sendkit/config.json` exists and contains `telegramBotToken`.
- If local MCP fails, confirm `TELEGRAM_BOT_TOKEN` is set.
- If remote MCP fails, verify Clerk env vars and that incoming requests include a valid `Authorization: Bearer ...` token.
