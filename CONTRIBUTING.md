# Contributing to wb-mqtt-ui

Thank you for considering contributing to wb-mqtt-ui! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible
* Include details about your configuration and environment

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

Before creating enhancement suggestions, please check the issue list as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please include as many details as possible:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful
* List some other applications where this enhancement exists, if applicable

### Pull Requests

* Fill in the required template
* Follow the style guidelines
* Document new code
* Update the documentation if needed
* Create a branch for each feature/fix
* Keep pull requests specific to one issue

## Development Environment

### Setup

Follow these steps to set up your development environment:

1. Fork the repository
2. Clone your fork
3. Install dependencies with `npm install`
4. Create a branch with `git checkout -b your-branch-name`
5. Make your changes
6. Test your changes
7. Push your branch with `git push origin your-branch-name`
8. Create a pull request

### Development Workflow

1. Find or create an issue that you want to work on
2. Make your changes in a new branch
3. Test your changes
4. Push your branch and create a pull request
5. Wait for review
6. Make any requested changes
7. Repeat until approved
8. Merge (maintainer will do this)

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 🚱 `:non-potable_water:` when plugging memory leaks
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies
    * 👕 `:shirt:` when removing linter warnings

### JavaScript/TypeScript Styleguide

* Use 2 spaces for indentation
* Prefer template literals to string concatenation
* Use camelCase for variables, object properties, and function names
* Use PascalCase for classes, interfaces, enums, and type aliases
* Use UPPER_CASE for constants
* Use single quotes for strings
* Add trailing commas
* Prefer arrow functions
* Prefer const over let
* Avoid var
* Use explicit return types for functions

### Vue Styleguide

* Use Composition API
* Follow the official [Vue Style Guide](https://vuejs.org/style-guide/)
* Use SFC (Single File Component) structure
* Use kebab-case for component filenames
* Use self-closing tags when a component has no content

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 