# AGENTS.md

This file provides guidance to AI agents and contributors working on this Capacitor plugin.

## Quick Start

```bash
bun install
bun run build
bun run verify
bun run fmt
bun run lint
```

## Development Workflow

1. Install dependencies with `bun install`.
2. Build with `bun run build`.
3. Verify iOS, Android, and Web with `bun run verify`.
4. Format with `bun run fmt`.
5. Check lint with `bun run lint`.

Use Bun for local development commands. Documentation intended for plugin consumers should use standard `npm` and `npx` commands.

### Individual Platform Verification

```bash
bun run verify:ios
bun run verify:android
bun run verify:web
```

### Example App

The `example-app/` directory references the plugin via `file:..`.

```bash
cd example-app
bun install
bun run start
```

Use `bunx cap sync <platform>` to sync native platforms while developing.

## Project Structure

- `src/definitions.ts` - TypeScript interfaces and types
- `src/index.ts` - Plugin registration
- `src/web.ts` - Web implementation
- `ios/Sources/` - iOS native code
- `android/src/main/` - Android native code
- `dist/` - Generated output
- `Package.swift` - SwiftPM definition
- `*.podspec` - CocoaPods spec

## iOS Package Management

Keep both CocoaPods and Swift Package Manager support working. Every plugin release must ship a valid podspec and `Package.swift`.

## API Documentation

API docs in the README are generated from JSDoc in `src/definitions.ts`. Do not edit the `<docgen-index>` or `<docgen-api>` sections directly. Update `src/definitions.ts` and run `bun run docgen`.

## Versioning

The plugin major version follows the Capacitor major version. Breaking changes belong to the matching Capacitor major migration.

## Changelog

`CHANGELOG.md` is managed automatically by CI/CD. Do not edit it manually.
