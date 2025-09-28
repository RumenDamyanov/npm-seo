# Contributing to @rumenx/seo

Thank you for your interest in contributing to @rumenx/seo! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/npm-seo.git
   cd npm-seo
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build the Project**

   ```bash
   npm run build
   ```

4. **Run Tests**

   ```bash
   npm test
   ```

## 📝 Development Workflow

### Branch Strategy

- `master` - Main branch, always stable
- `develop` - Development branch for new features
- `feature/feature-name` - Feature branches
- `fix/bug-description` - Bug fix branches
- `docs/documentation-update` - Documentation updates

### Making Changes

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**

   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   Follow [Conventional Commits](https://conventionalcommits.org/) format:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions/changes
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

5. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

## 🏗️ Project Structure

```text
npm-seo/
├── src/
│   ├── core/           # Main classes (SeoManager, ContentAnalyzer)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Main exports
├── dist/               # Compiled output
├── examples/           # Usage examples
├── docs/               # Documentation
└── tests/              # Test files
```

## 🎯 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Provide comprehensive type definitions
- Use meaningful interface and type names
- Document complex types with JSDoc comments

```typescript
/**
 * Configuration options for SEO analysis
 */
export interface SeoConfig {
  /** Base URL for the website */
  baseUrl: string;
  /** Analysis mode - 'fast' or 'comprehensive' */
  mode: 'fast' | 'comprehensive';
  /** Optional AI provider for content generation */
  aiProvider?: AiProvider;
}
```

### Code Style

- Use Prettier for formatting (configured in `.prettierrc`)
- Follow ESLint rules (configured in `.eslintrc.js`)
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multiline structures

### Documentation

- Add JSDoc comments for public APIs
- Include usage examples in documentation
- Update README.md for significant changes
- Keep inline comments concise and meaningful

## 🧪 Testing Guidelines

### Test Structure

- Write unit tests for all new functionality
- Use descriptive test names
- Group related tests with `describe` blocks
- Test both success and error cases

```typescript
describe('ContentAnalyzer', () => {
  describe('analyze', () => {
    it('should extract text content from HTML', () => {
      // Test implementation
    });

    it('should handle malformed HTML gracefully', () => {
      // Test implementation
    });
  });
});
```

### Test Categories

- **Unit Tests** - Test individual functions and methods
- **Integration Tests** - Test component interactions
- **End-to-End Tests** - Test complete workflows

### Coverage Requirements

- Maintain minimum 80% code coverage
- Cover all public APIs
- Test error handling paths
- Include edge cases

## 📚 Documentation

### README Updates

- Keep examples current and working
- Update feature lists for new functionality
- Maintain accurate installation instructions
- Include breaking changes in upgrade guides

### API Documentation

- Document all public methods and properties
- Include parameter descriptions and types
- Provide usage examples
- Note any breaking changes

### Changelog

- Update `CHANGELOG.md` for all changes
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Categorize changes appropriately
- Include migration notes for breaking changes

## 🎨 Design Principles

### API Design

- **Simplicity** - Keep APIs intuitive and easy to use
- **Consistency** - Follow established patterns
- **Performance** - Optimize for common use cases
- **Extensibility** - Design for future enhancements

### Architecture

- **Modularity** - Keep components focused and decoupled
- **Type Safety** - Leverage TypeScript for reliability
- **Error Handling** - Provide meaningful error messages
- **Backward Compatibility** - Minimize breaking changes

## 🚨 Pull Request Process

### Before Submitting

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Changelog is updated
- [ ] No breaking changes (or properly documented)

### PR Requirements

- **Clear Title** - Describe the change concisely
- **Detailed Description** - Explain what and why
- **Linked Issues** - Reference related issues
- **Test Coverage** - Include relevant tests
- **Documentation** - Update docs as needed

### Review Process

1. **Automated Checks** - CI/CD pipeline runs tests
2. **Code Review** - Maintainer reviews code
3. **Feedback** - Address review comments
4. **Approval** - PR approved by maintainer
5. **Merge** - Squash and merge to main branch

## 🏷️ Release Process

### Version Management

- Follow [Semantic Versioning](https://semver.org/)
- `MAJOR.MINOR.PATCH` format
- Breaking changes increment MAJOR
- New features increment MINOR
- Bug fixes increment PATCH

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Tag release after merge
5. Publish to npm registry

## 🤝 Community Guidelines

### Communication

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Share knowledge and best practices

### Issue Reporting

- Use provided issue templates
- Include minimal reproduction cases
- Provide system information
- Search existing issues first

### Feature Requests

- Explain the use case clearly
- Consider backward compatibility
- Discuss implementation approach
- Be open to feedback and alternatives

## 📞 Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and community help
- **Documentation** - Check README and inline docs
- **Examples** - Review example code

## 🎉 Recognition

Contributors are recognized in:

- `CHANGELOG.md` for significant contributions
- GitHub contributor graphs
- Release notes for major features
- Community discussions and mentions

Thank you for contributing to @rumenx/seo! Your efforts help make this library better for everyone.
