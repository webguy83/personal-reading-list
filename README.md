# Bookshelf — Product Challenge

Build a personal reading tracker where you search for books, organize them into shelves, track reading progress, set goals, and explore year-in-review statistics. Your reading life, beautifully organized.

![Bookshelf preview](./preview.jpg)

*This is a design concept image, not the intended design. There's no Figma file — you make the design decisions.*

## The Challenge

Bookshelf is a **Product Challenge**. There's no Figma file — you make the design decisions. You ship a real, deployed product with a database, authentication, and external integrations. The result is a portfolio piece that demonstrates how you think, not just what you can build.

### Four Pillars

| Pillar | What It Means for Bookshelf |
|--------|----------------------------|
| **Product Thinking** | You design the year-in-review experience, the book discovery flow, and the reading progress UX. No spec tells you exactly how — you decide. |
| **Design Taste & Craft** | The brand kit gives you colors, type, and spacing. The layouts, interactions, and visual polish are yours. |
| **AI Collaboration** | The project includes AI context files (`AGENTS.md`, `CLAUDE.md`) that give tools like Claude full project context. Lean into AI across planning, building, and polishing. |
| **Shipping Real Products** | Deploy to a live URL. Real database. Real auth. Real book API integration with real-world data inconsistencies — missing covers, varied ISBNs, duplicate editions. |

## Project Structure

```
spec/                   # Challenge requirements & design guidance
guidance/               # Accessibility, brand kit, patterns
data/                   # Sample book data (CSV + JSON)
starter/                # Base CSS tokens and Tailwind config
src/                    # Angular application source
```

## Getting Started

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## Building

```bash
ng build
```

---

*Fill in [`README-template.md`](./README-template.md) with your design decisions and ship it as your solution README when you deploy.*
