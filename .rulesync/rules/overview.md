---
root: true
targets:
  - '*'
description: ''
globs:
  - '**/*'
---
# Zenn Editor - Architecture Overview

## Project Structure

The zenn-editor is a monorepo managed by Turbo and pnpm, containing five integrated packages that work together to provide local Markdown preview and content management for Zenn content (articles and books).

### Core Packages

```
packages/
├── zenn-cli              # CLI tool and preview server
├── zenn-markdown-html    # Markdown to HTML conversion
├── zenn-model            # Data validation and types
├── zenn-content-css      # Styling for content display
└── zenn-embed-elements   # Web Components for embedded content
```

## Package Interactions

### Dependency Flow

```
zenn-cli (Entry Point)
  ├── depends on: zenn-markdown-html, zenn-model, zenn-content-css, zenn-embed-elements
  ├── Handles: CLI commands, preview server, file management
  │
├─→ zenn-markdown-html
  ├── depends on: (external markdown-it plugins)
  ├── Converts: Markdown → HTML with Zenn flavor
  │
├─→ zenn-model
  ├── depends on: (cheerio, emoji-regex)
  ├── Provides: Type definitions, validation rules
  │
├─→ zenn-content-css
  ├── Provides: Styling (SCSS → CSS)
  │
└─→ zenn-embed-elements
      Provides: Web Components (e.g., embed-katex)
```

## Main Components

### 1. zenn-cli

**Purpose**: Entry point for the Zenn CLI tool and preview server.

**Key Entry Points**:
- `src/server/zenn.ts` - CLI entry point, parses command-line arguments
- `src/server/app.ts` - Express app setup with API routes
- `src/server/lib/server.ts` - HTTP server startup with WebSocket support

**Main Commands**:
- `preview` - Start local preview server (default)
- `init` - Initialize project structure
- `new:article` - Create new article scaffold
- `new:book` - Create new book scaffold
- `list:articles` - List all articles
- `list:books` - List all books

**API Endpoints** (served by Express app):
```
GET  /api/articles              # List all articles with metadata
GET  /api/articles/:slug        # Get single article with HTML
GET  /api/books                 # List all books with metadata
GET  /api/books/:slug           # Get single book with metadata
GET  /api/books/:slug/chapters  # List chapters for a book
GET  /api/books/:slug/chapters/:filename  # Get single chapter
GET  /api/cli-version           # Get CLI version info
GET  /api/local-info            # Get local environment info
GET  /api/cli-guide/:slug       # Get CLI guide content
GET  /images/*                  # Serve local images
```

**Key Features**:
- Watches file changes in `articles/` and `books/` directories
- Broadcasts "refresh" signal via WebSocket when files change
- Port auto-increment if default port (8000) is busy
- Supports custom hostname binding
- Auto-open browser option

### 2. zenn-markdown-html

**Purpose**: Convert Zenn-flavored Markdown to HTML with built-in plugin system.

**Main Entry Point**:
- `src/index.ts` - `markdownToHtml(text, options)` function

**Architecture Pattern**: Plugin-based markdown-it processing

```
markdownToHtml(markdown)
  ├─→ markdown-it initialization with default options
  │
  ├─→ Plugin Chain (order matters):
  │   ├── mdBr - Line break handling
  │   ├── mdKatex - KaTeX math formula rendering
  │   ├── mdFootnote - Footnote support
  │   ├── mdInlineComments - Inline comment stripping
  │   ├── markdownItImSize - Image size attributes
  │   ├── mdLinkAttributes - Custom link attributes
  │   ├── mdCustomBlock - Zenn custom blocks (:::message, etc.)
  │   ├── mdRendererFence - Code fence rendering with syntax highlighting
  │   ├── mdLinkifyToCard - URL→card embedding
  │   ├── mdTaskLists - Checkbox task lists
  │   ├── mdContainer (details) - <details> elements
  │   ├── mdContainer (message) - Message boxes
  │   ├── markdownItAnchor - Header anchors with IDs
  │   ├── mdSourceMap - Source location mapping
  │   └── mdImage - Image processing
  │
  ├─→ Custom Rendering Rules
  │   └── footnote_block_open - Custom footnote section HTML
  │
  ├─→ Sanitization (sanitize-html)
  │   └── Whitelist of allowed tags and attributes
  │
  └─→ Output: Sanitized HTML string
```

**Embedded Content Types** (`embed.ts`):

The system supports two categories of embeds:

**Iframe-based** (Direct embedding):
- YouTube (with optional start time)
- Slideshare
- Speaker Deck
- Docswell
- JSFiddle
- CodePen
- CodeSandbox
- StackBlitz
- Blueprint UE
- Figma
- GitHub Gist (optional server)
- GitHub (optional server)
- Tweet (optional server)
- Card (link preview, optional server)
- Mermaid (optional server)

**Features**:
- URL validation for each embed type
- Escaping and sanitization of embed tokens
- Fallback to simple links when embed server not available
- Server mode uses iframe delegation for complex embeds

### 3. zenn-model

**Purpose**: Data modeling, type definitions, and validation rules.

**Key Components**:
- `src/types.ts` - TypeScript type definitions
- `src/utils.ts` - 45+ validation functions
- `src/index.ts` - Export validation functions

**Type System**:

```typescript
// Article structure
Article {
  slug: string
  title?: string
  bodyHtml?: string
  toc?: TocNode[]
  emoji?: string
  type?: 'tech' | 'idea'
  topics?: string[]
  tags?: string[]
  published?: boolean
  published_at?: string | null
  publication_name?: string | null
}

// Book structure
Book {
  slug: string
  title?: string
  summary?: string
  price?: number
  topics?: string[]
  tags?: string[]
  published?: boolean
  specifiedChapterSlugs?: string[]
  chapterOrderedByConfig: boolean
  coverDataUrl?: string
  coverFilesize?: number
  coverWidth?: number
  coverHeight?: number
}

// Chapter structure
Chapter {
  slug: string
  filename: string
  title?: string
  free?: boolean
  bodyHtml?: string
  toc?: TocNode[]
  position: null | number
}
```

**Validation Rules**:

Articles are validated against:
- Body content presence
- Slug format and uniqueness
- Title presence and length (1-50 chars)
- Publication status and date format
- Article type (tech/idea)
- Emoji format and presence
- Topic management (tags, count limits)
- Publication name format

Books have additional validation for:
- Cover image (size, aspect ratio, format)
- Price configuration (type, range, fractions)
- Chapter structure and slugs
- Summary length

Chapters validate:
- Slug format
- Title length
- Free/paid status

**Error System**: Each validation produces a `ValidationError` object containing:
- Type identifier
- Human-readable message
- Critical flag (blocks publishing if true)
- Optional detail URL and text

### 4. zenn-content-css

**Purpose**: Styling for Zenn Markdown content display.

**Structure**:
- Pure SCSS, compiled to CSS
- Single entry point: `src/index.scss`
- Output: `lib/index.css` (distributed)

**Design**:
- Uses short classname `.znc` as container selector
- Defines color palette (blues, grays) matching Zenn branding
- Responsive breakpoints (xs: 374px, sm: 576px, md: 768px)
- Styles for all Markdown elements: headings, lists, code, tables, etc.
- No JavaScript dependencies

**CSS Class Hierarchy**:
```
.znc (root container for Zenn content)
  └─→ All child elements inherit base styling
      ├── h1-h6 (with Zenn branding)
      ├── code-blocks (with syntax highlighting)
      ├── lists (ordered/unordered)
      ├── tables
      ├── embeds (.embed-block variants)
      ├── callout boxes (.message)
      ├── details/summary
      └── footnotes
```

### 5. zenn-embed-elements

**Purpose**: Web Components for client-side embed rendering.

**Current Implementation**:
- Minimal: Only exports `embed-katex` Web Component
- Uses TypeScript for compilation
- No runtime dependencies

**Extensibility**:
- Architecture ready for additional Web Components
- Each embed type can be isolated as custom element
- Suitable for SSR (with dynamic import on client)

## Data Flow: From Markdown File to Preview

### Read Phase (File System → Memory)

```
articles/ or books/ directory
       ↓
File discovery (listFilenames)
       ↓
Gray-matter parsing (YAML frontmatter + body)
       ↓
Data objects: {meta: ArticleMeta, bodyMarkdown: string}
```

### Processing Phase (Markdown → HTML)

```
Raw Markdown
       ↓
zenn-markdown-html (plugin chain)
       ↓
Raw HTML
       ↓
Sanitization (whitelist filtering)
       ↓
Image validation & completion (completeHtml)
       ├─→ Check image paths (/images/*)
       ├─→ Validate file existence
       ├─→ Check file size (≤3MB)
       └─→ Insert error messages for invalid images
       ↓
Final HTML with errors highlighted
```

### Serving Phase (HTTP → Client)

```
Client Request (browser)
       ↓
Express route handler (/api/articles/:slug)
       ↓
Load & parse file
       ↓
Convert markdown to HTML
       ↓
Generate table of contents
       ↓
JSON response {article: {meta, bodyHtml, toc}}
       ↓
Browser renders HTML with znc CSS class
       ↓
Web Components load (KaTeX, etc.)
       ↓
Embed server iframes render complex content
```

## File Organization Patterns

### Article Storage
```
articles/
├── article-1.md           # slug: article-1
├── my-first-post.md       # slug: my-first-post
└── ...
```

**Frontmatter Format (YAML)**:
```yaml
---
title: Article Title
emoji: 📝
type: tech                  # or 'idea'
topics: [typescript, react]
published: true
published_at: 2024-01-15
publication_name: "Company Blog"  # optional
---

# Article content in Markdown
```

### Book Storage
```
books/
└── my-book/              # slug: my-book
    ├── config.yaml       # Book metadata
    ├── cover.png         # Cover image
    ├── 1.chapter-1.md    # Position prefix optional
    ├── 2.chapter-2.md
    └── ...
```

**config.yaml Format**:
```yaml
title: Book Title
summary: Book summary text
price: 1000
topics: [learning, guide]
chapters:
  - chapter-1
  - chapter-2
```

**Chapter Ordering**:
- Can be specified in config.yaml `chapters` array
- Or inferred from filename prefix (1., 2., etc.)
- Files without prefix get position: null

## Key Design Patterns

### 1. Plugin Architecture (zenn-markdown-html)
- Markdown-it plugins chain for extensibility
- Each plugin handles specific Markdown feature
- Order of plugins matters for output correctness
- Custom renderer rules override defaults

### 2. Validator Pattern (zenn-model)
- Each validation rule is independent function
- Validator functions return boolean
- Separate getMessage() for error messages
- Composable validation chains

### 3. File-Based Content Management (zenn-cli)
- No database required
- Direct filesystem reading
- Gray-matter for parsing frontmatter
- Hot-reload via file watchers

### 4. Express/WebSocket Server (zenn-cli)
- Static file serving for client app
- RESTful API for content delivery
- WebSocket for live reload notifications
- History API fallback for SPA routing

### 5. Separation of Concerns
- **zenn-markdown-html**: Only markdown processing
- **zenn-model**: Only data modeling/validation
- **zenn-content-css**: Only styling
- **zenn-embed-elements**: Only client-side components
- **zenn-cli**: Orchestration and server

## Security Considerations

### HTML Sanitization
- Uses `sanitize-html` library with strict whitelist
- Allowed tags and attributes explicitly defined
- Disallowed tags discarded (not escaped)
- Prevents XSS attacks through user content

### Path Security
- `getWorkingPath()` prevents directory traversal (`../` check)
- Image paths must start with `/images/`
- URL encoding handled safely for image requests

### Embed Safety
- Each embed type has URL validation
- Iframe sandbox attributes restrict permissions
- NoScript versions provided for security

### Validation Prevents Invalid Content
- Critical validation errors block publishing
- Type checking enforces data structure
- Schema validation on frontmatter YAML

## Build and Distribution

### Build Process (Turbo)
- Parallel builds across packages
- TypeScript compilation with tsc
- Babel transpilation for zenn-markdown-html
- ESBuild for rapid bundling
- Vite for client assets in zenn-cli

### Output Artifacts
- zenn-cli: `dist/server/zenn.js` (CLI entry) + `dist/client/` (SPA)
- zenn-markdown-html: `lib/` (CommonJS + types)
- zenn-model: `lib/` (CommonJS + types)
- zenn-content-css: `lib/index.css` (minified)
- zenn-embed-elements: `lib/` (compiled types)

### Publishing
- All packages published to npm as public
- Version synchronization across packages
- Canary releases for testing
- Monorepo allows single-version releases

## CLI Commands Deep Dive

### preview
Starts local preview server with file watching.

```typescript
// Key flow:
1. Parse arguments (--port, --host, --no-watch, --open)
2. Create Express app with API routes
3. Start HTTP server with auto-port-increment
4. Setup WebSocket for file changes
5. Watch articles/ and books/ directories
6. Send refresh signal on file change
7. Keep server running until Ctrl-C
```

### init
Creates project scaffold with articles/ and books/ directories.

### new:article / new:book
Generates template files with prompts for metadata.

### list:articles / list:books
Outputs formatted list of content with metadata.

## Markdown Feature Support

### Standard Markdown
- Headers (h1-h6) with auto-anchor links
- Emphasis and strong text
- Lists (ordered/unordered)
- Links with custom attributes
- Images with size attributes
- Code blocks with syntax highlighting
- Tables

### Zenn-Specific Features
- KaTeX math formulas: `$equation$`
- Custom blocks: `:::message` / `:::details`
- Task lists: `- [x] completed task`
- Footnotes: `[^1]` references
- Link cards: Auto-convert URLs to cards
- Mermaid diagrams (with embed server)
- Embeds: YouTube, tweets, GitHub gists, etc.
- Inline comments: `<!-- comment -->`
- Code highlighting: Multi-language support with Prism.js

## Future Extensibility

### Adding New Embed Types
1. Add type to `EmbedType` in `embed.ts`
2. Implement generator function in `embedGenerators`
3. Add URL validator in `utils/url-matcher.ts`
4. Update error messages

### Adding New Markdown Features
1. Create utility file in `zenn-markdown-html/src/utils/md-*.ts`
2. Implement markdown-it plugin
3. Add to plugin chain in `zenn-markdown-html/src/index.ts`
4. Update sanitizer whitelist if new tags needed

### Adding Validation Rules
1. Create validator function in `zenn-model/src/utils.ts`
2. Implement `isValid()` and `getMessage()` methods
3. Add to appropriate validation function
4. Export from `zenn-model/src/index.ts`

## Development Workflow

### Local Development
```bash
# Root monorepo
pnpm install
pnpm build        # Build all packages
pnpm lint          # Lint all packages
pnpm test          # Test all packages
pnpm fix           # Auto-fix formatting

# zenn-cli specific
cd packages/zenn-cli
pnpm dev           # Concurrent: dev:server + dev:client
pnpm dev:server    # Watch server code, auto-restart
pnpm dev:client    # Vite dev server for UI

# Other packages
pnpm build         # Build that package
pnpm test          # Test that package
```

### Testing Strategy
- Unit tests with Vitest
- Server tests separate from client tests
- API integration tests
- Command execution tests

### Prompt Testing Policy
- Do not assert exact prompt wording or partial prompt text with equality or containment checks in RSpec, Vitest, or similar tests.
- Prompts are qualitative configuration. Wording-based assertions unnecessarily prevent prompt improvements without guaranteeing actual LLM judgment quality.
- Test structural and behavioral contracts instead, such as provider/model selection, structured output schemas, retry and telemetry settings, data-flow boundaries, and fail-open/fail-closed behavior.
- Evaluate prompt quality with representative LLM eval cases rather than string-matching tests.

## Performance Considerations

### Server-Side
- File I/O: Cached during request lifecycle
- Markdown → HTML: Re-computed only on file change
- WebSocket broadcasts: Lightweight "refresh" signals
- Port auto-increment: Iterative check, small impact

### Client-Side
- SPA with Vite for dev hot reload
- Static serving from dist/ in production
- Lazy loading of Web Components (embed-katex)
- CSS not bloated (single file)

### Content Handling
- Large markdown files parsed once per request
- Image processing: Size checks only on preview
- ToC generation: From HTML (fast)

## Known Limitations

### Single-Instance Content
- No multi-user editing
- No conflict resolution for simultaneous edits
- File watcher may miss rapid changes

### Embedding Constraints
- Complex embeds need embed server (VITE_EMBED_SERVER_ORIGIN)
- Some embeds degrade to plain links without server
- Mermaid rendering requires browser

### Build Environment
- zenn-markdown-html cannot run in browser (uses Node modules)
- zenn-embed-elements must be lazy-loaded (SSR incompatible)
- KaTeX needs embed-katex custom element

## Repository Organization

- Monorepo uses Lerna-lite for publishing
- Turbo for build orchestration
- pnpm workspaces for dependency management
- ESLint + Prettier for code quality
- GitHub Actions for CI/CD (implied)

---

## Quick Reference: Common Tasks

| Task | Location | Key File |
|------|----------|----------|
| Add markdown feature | `zenn-markdown-html/src/utils/` | `md-*.ts` |
| Add validation rule | `zenn-model/src/` | `utils.ts` |
| Update API endpoint | `zenn-cli/src/server/` | `api/*.ts` or `app.ts` |
| Change styling | `zenn-content-css/src/` | `index.scss` |
| Update CLI command | `zenn-cli/src/server/commands/` | `*.ts` |
| Fix type issues | `zenn-model/src/` | `types.ts` |
| Modify server setup | `zenn-cli/src/server/lib/` | `server.ts` |
| Update embed types | `zenn-markdown-html/src/` | `embed.ts` |
