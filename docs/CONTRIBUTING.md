# Contributing to MusicVerse Pro

Thank you for your interest in contributing to MusicVerse Pro! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/musicverse-pro.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add: your feature description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## Code Style

- Follow existing code style
- Use ESLint for JavaScript: `npm run lint`
- Use Prettier for formatting: `npm run format`
- Write clear, descriptive commit messages
- Add comments for complex logic

## Commit Messages

Follow the conventional commits format:

```
Type: Short description

Longer description if needed

Fixes #issue_number
```

Types:
- `Add:` - New feature
- `Fix:` - Bug fix
- `Update:` - Update existing feature
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes
- `Test:` - Adding or updating tests
- `Style:` - Code style changes (formatting, etc.)

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update documentation in `docs/` folder
3. Ensure all tests pass
4. Ensure code follows style guidelines
5. Update CHANGELOG.md if applicable
6. Request review from maintainers

## Testing

- Write tests for new features
- Ensure existing tests pass: `npm test`
- Test on different platforms if possible
- Test both bot and Mini App functionality

## Documentation

- Update API documentation for new endpoints
- Update bot specification for new commands
- Add comments to complex code
- Update README.md for significant changes

## Reporting Bugs

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

## Feature Requests

When suggesting features:
- Provide clear description
- Explain use case
- Consider impact on existing functionality
- Be open to discussion

## Code Review

All contributions will be reviewed by maintainers. Please be patient and responsive to feedback.

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for contributing to MusicVerse Pro! 🎵
