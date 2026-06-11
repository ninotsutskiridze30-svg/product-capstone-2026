# Technical Architecture — Component 2

Files in this directory satisfy Component 2 of the Combined Checkpoint 2+3 rubric (3 pts).

| File | Rubric requirement |
|---|---|
| [system-design.md](system-design.md) | Architecture pattern + component breakdown + data flow |
| [tech-stack.md](tech-stack.md) | Every technology choice justified |
| [architecture-diagram.mmd](architecture-diagram.mmd) | Mermaid source for the architecture diagram |
| [architecture-diagram.png](architecture-diagram.png) | Rendered diagram (1600×1200, generated from the `.mmd` source) |
| [risk-spikes.md](risk-spikes.md) | Risk spikes resolved during Sprint 1 (mesh→SFU, whiteboard transport) |

AI tool annotations are embedded inline in `system-design.md` §5 and cross-reference [../../docs/ai-usage-log.md](../../docs/ai-usage-log.md).

## Regenerating the diagram

```bash
# Option A: mermaid CLI (npm i -g @mermaid-js/mermaid-cli)
mmdc -i architecture-diagram.mmd -o architecture-diagram.png -w 1600 -H 1200

# Option B: paste the .mmd contents into https://mermaid.live and export PNG
```
