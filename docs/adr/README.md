# Architecture Decision Records (ADRs)

This directory records architectural decisions for Origin-v3 / MetaMyth.

## ADR Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-privy-auth.md) | Use Privy for authentication | Accepted |
| [0002](0002-cloudflare-stack.md) | Use Cloudflare Workers + D1 + R2 + Pages | Accepted |
| [0003](0003-ai-fallback-chain.md) | Anthropic-first with browser AI fallback | Accepted |
| [0004](0004-r2-media-storage.md) | R2 for binary media, D1 for metadata | Accepted |
| [0005](0005-local-whisper.md) | Local Whisper for speech-to-text | Accepted |

## Format

Each ADR follows the Michael Nygard template:
- **Title**: short noun phrase
- **Status**: Proposed / Accepted / Deprecated / Superseded
- **Context**: why this decision is being made
- **Decision**: what we decided
- **Consequences**: what results
