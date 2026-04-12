# Claude Context — Habit Tracker

This folder contains project documentation for use as context in Claude (macOS app or claude.ai/code).

Upload or reference these files to give Claude a full understanding of the project without relying on memory storage.

## Files

| File | Contents |
|---|---|
| [overview.md](./overview.md) | Project summary, stack, features, dev commands |
| [architecture.md](./architecture.md) | Layer structure, directory tree, responsibilities |
| [data-model.md](./data-model.md) | Database tables, domain types, date key systems |
| [data-flow.md](./data-flow.md) | How data moves: dashboard load, logging, auth, state |
| [key-files.md](./key-files.md) | Quick reference — what every important file does |
| [coding-standards.md](./coding-standards.md) | Conventions, rules, what to avoid |

## How to Use

In Claude (macOS app), add these files as project knowledge or attach them at the start of a conversation. They give Claude enough context to:

- Understand where to find and modify any piece of functionality
- Follow the project's architectural boundaries (domain / infrastructure / presentation)
- Know which utilities and patterns to use or reuse
- Avoid common mistakes (date handling, auth, optimistic UI patterns)

## Keeping This Up to Date

Update these docs when:
- New tables or domain types are added
- The folder structure changes significantly
- New conventions or patterns are established
- New major features are added (new route groups, new API endpoints, etc.)
