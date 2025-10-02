# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-10-02

### Changed

#### AI Provider Updates

- **Anthropic Provider**: Upgraded from Claude 3 Haiku to Claude 4 Sonnet (claude-4-sonnet-20250101)
  - Increased context window from 100K to 200K tokens (2x improvement)
  - Increased output tokens from 4K to 8K tokens (2x improvement)
  - Added function calling support
  - Doubled token rate limits from 50K to 100K tokens/minute
  - Improved multilingual performance
  - Better reasoning capabilities
  - **Note**: Claude 3 models will be deprecated in Q2 2025; migration recommended

- **OpenAI Provider**: Upgraded from GPT-3.5 Turbo to GPT-4.1 Turbo (gpt-4.1-turbo)
  - Increased context window from 4K to 128K tokens (31x improvement)
  - Increased output tokens from 1K to 4K tokens (4x improvement)
  - Enabled streaming support
  - Increased token rate limits from 40K to 150K tokens/minute
  - Superior instruction following
  - Better multilingual support
  - **Note**: GPT-3.5 is being sunset for new applications

- **Google AI Provider**: Upgraded from gemini-pro to Gemini 1.5 Pro (gemini-1.5-pro-latest)
  - Increased context window from 30K to 1M tokens (32x improvement)
  - Increased output tokens from 2K to 8K tokens (4x improvement)
  - Increased token rate limits from 32K to 1M tokens/minute
  - Enhanced multimodal capabilities
  - Improved long-context processing
  - Better code understanding
  - **Note**: `gemini-pro` naming is deprecated; versioned model names required

### Added

#### Test Coverage Improvements

- **Language Detection Tests**: Added tests for automatic language detection (English, Spanish, French)
- **Content Section Tests**: Added tests for HTML section extraction (header, main, footer, article, aside)
- **Fast Analysis Tests**: Added comprehensive tests for `analyzeFast()` method
  - Performance comparison tests
  - Metadata language tests
  - Keyword limitation tests
- **Advanced SEO Metrics Tests**:
  - Twitter Card tags extraction
  - JSON-LD structured data parsing (single and array formats)
  - Invalid JSON-LD error handling
- **URL Resolution Tests**:
  - Relative URL resolution with base URL
  - Absolute URL handling
  - Root-relative URL processing
  - Protocol-relative URL handling

#### Documentation

- **Related Projects Section**: Added links to complementary tools
  - `@rumenx/chatbot` - AI-powered chatbot integration
  - `@rumenx/sitemap` - Dynamic sitemap generation
  - `@rumenx/feed` - RSS/Atom feed generator
  - `php-seo` - PHP SEO library
  - `go-seo` - Go SEO library (planned)
- **AI Models Update Guide**: Created comprehensive documentation in `.ai/AI_MODELS_UPDATE_2025.md`
  - Migration guide for deprecated models
  - Capability comparison tables
  - Cost implications analysis
  - Future considerations

### Improved

- **Test Coverage**: Increased from 87.14% to 90.10% (+2.96%)
  - Added 16 new comprehensive test cases
  - Total test count: 129 tests (up from 113)
  - All tests passing with no breaking changes
- **AI Provider Capabilities**: Updated capability definitions to reflect actual model limits
- **Documentation**: Updated README with current AI model versions and capabilities

### Technical Details

#### Provider Capability Updates

| Provider        | Context Window | Output Tokens | Streaming | Function Calling |
| --------------- | -------------- | ------------- | --------- | ---------------- |
| Claude 4 Sonnet | 200K → 200K    | 4K → 8K       | ✅        | ❌ → ✅          |
| GPT-4.1 Turbo   | 4K → 128K      | 1K → 4K       | ❌ → ✅   | ✅               |
| Gemini 1.5 Pro  | 30K → 1M       | 2K → 8K       | ✅        | ✅               |

### Backward Compatibility

- **No Breaking Changes**: All updates are backward compatible
- **Custom Models**: Users can still specify old models via configuration:
  ```typescript
  const provider = new AnthropicProvider({
    apiKey: 'your-key',
    model: 'claude-3-haiku-20240307', // Old model still works
  });
  ```
- **Automatic Defaults**: New models are used automatically when model is not specified
- **Gradual Migration**: Users can migrate at their own pace

### Migration Guide

For users wanting to take advantage of the new AI models:

1. **Update API Keys**: Same keys work with new models (no changes needed)
2. **Review Rate Limits**: Most providers have increased rate limits
3. **Test Performance**: New models offer better performance and accuracy
4. **Monitor Costs**: Review pricing changes for your usage patterns

**Recommended Actions**:

- Test with new defaults (better performance expected)
- Update internal documentation if model names are referenced
- Plan migration away from deprecated models (Claude 3, gemini-pro)

### Notes

- All AI provider updates maintain backward compatibility
- Old models remain accessible via explicit configuration
- Test coverage improvements ensure code reliability
- Documentation updates reflect current best practices

---

## [1.0.0] - 2024-12-29

### Added

#### Core Features

- **SeoManager Class**: Main class for comprehensive SEO analysis and content optimization
- **ContentAnalyzer Class**: Standalone content analysis with HTML parsing capabilities
- **SEO Recommendations**: Automated analysis and suggestions for title, description, headings, images, and content structure
- **SEO Scoring System**: Comprehensive scoring with detailed breakdowns by category

#### Content Analysis

- **HTML Content Parsing**: Extract and analyze text content, structure, and metadata
- **Keyword Extraction**: Automatic keyword identification and density analysis
- **Reading Time Calculation**: Estimate reading time based on content length
- **Content Structure Analysis**: Extract headings, images, links, and content sections
- **SEO Metrics Extraction**: Parse title tags, meta descriptions, H1 tags, and other SEO elements

#### Utilities

- `extractTextContent()` - Clean text extraction from HTML
- `extractHeadings()` - Heading structure analysis
- `extractImages()` - Image analysis with alt text validation
- `extractLinks()` - Link analysis and validation
- `extractSeoMetrics()` - SEO-specific metadata extraction
- `calculateReadingTime()` - Reading time estimation
- `extractKeywords()` - Keyword extraction and analysis
- `calculateKeywordDensity()` - Keyword density calculation

#### TypeScript Support

- **Comprehensive Type Definitions**: Full TypeScript support with 70+ interfaces
- **Type Safety**: Strict typing with `exactOptionalPropertyTypes` enabled
- **Dual Module Support**: Both ESM and CommonJS builds with proper type declarations

#### AI Integration (Framework)

- **AI Provider Interface**: Abstract interface for AI-powered content generation
- **Multiple Provider Support**: Framework for OpenAI, Anthropic, Google AI, and Ollama
- **Content Generation**: AI-powered suggestions for titles, descriptions, and keywords
- **Fallback Mechanisms**: Graceful degradation when AI providers are unavailable

#### Framework Integration (Planned)

- **Express.js Support**: Middleware and helper functions
- **Next.js Integration**: Server-side rendering compatibility
- **Fastify Support**: Plugin architecture

#### Development Features

- **Dual Build System**: Separate ESM and CommonJS builds
- **Source Maps**: Full source map support for debugging
- **Extensive Configuration**: TypeScript configs for different targets
- **Code Quality**: ESLint, Prettier, and strict TypeScript configuration
- **Example Code**: Comprehensive usage examples

### Technical Implementation

#### Architecture

- **Modular Design**: Separate core classes, utilities, and type definitions
- **Performance Optimized**: Fast mode for performance-critical applications
- **Memory Efficient**: Optimized HTML parsing and content analysis
- **Error Handling**: Comprehensive error handling with meaningful messages

#### HTML Processing

- **DOM Parsing**: Using `node-html-parser` for efficient HTML analysis
- **Content Extraction**: Smart text extraction with context preservation
- **Structure Analysis**: Hierarchical heading analysis and content sectioning
- **Image Processing**: Alt text analysis and accessibility recommendations

#### SEO Analysis

- **Title Optimization**: Length validation and keyword integration analysis
- **Meta Description**: Length and quality assessment
- **Heading Structure**: H1-H6 hierarchy validation
- **Image Accessibility**: Alt text presence and quality checks
- **Content Quality**: Word count, reading time, and structure analysis

#### Build System

- **TypeScript Compilation**: Multiple target configurations (ESM, CJS, Types)
- **Extension Fixing**: Automatic .js extension handling for CommonJS
- **Clean Builds**: Automated cleanup and rebuild processes
- **Package Optimization**: Proper exports configuration for dual module support

### Files Structure

```
src/
├── core/
│   ├── SeoManager.ts         # Main SEO analysis class
│   └── ContentAnalyzer.ts    # Content analysis utilities
├── types/
│   ├── SeoTypes.ts          # SEO-specific type definitions
│   ├── ContentTypes.ts      # Content analysis types
│   ├── AiTypes.ts          # AI provider interfaces
│   ├── AdapterTypes.ts     # Framework adapter types
│   └── index.ts            # Type exports
├── utils/
│   └── HtmlParser.ts       # HTML parsing utilities
└── index.ts                # Main package exports
```

### Documentation

- **Comprehensive README**: Installation, usage, and API documentation
- **TypeScript Examples**: Fully typed usage examples
- **Type Documentation**: Extensive inline documentation for all types
- **API Reference**: Complete method and class documentation

### Package Configuration

- **NPM Package**: Properly configured for npm registry publishing
- **Peer Dependencies**: Optional AI provider dependencies
- **File Inclusion**: Optimized package size with selective file inclusion
- **Funding**: GitHub Sponsors integration

## [Unreleased]

### Planned Features

- **AI Provider Implementations**: Concrete implementations for major AI providers
- **Framework Adapters**: Express, Next.js, and Fastify integrations
- **Test Suite**: Comprehensive unit and integration tests
- **Performance Benchmarks**: Performance testing and optimization
- **Documentation Site**: Dedicated documentation website
- **CLI Tool**: Command-line interface for SEO analysis

### Future Enhancements

- **Real-time Analysis**: WebSocket-based real-time SEO monitoring
- **Batch Processing**: Bulk analysis capabilities
- **Custom Rules**: User-defined SEO rules and validations
- **Analytics Integration**: Google Analytics and Search Console integration
- **Competitor Analysis**: SEO comparison tools
- **Internationalization**: Multi-language SEO support
