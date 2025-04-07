# Contributing to G4X Viewer

First off, thank you for considering contributing to G4X Viewer! It's people like you that make this project such a great tool.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Issues](#issues)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release Process](#release-process)
- [Community](#community)

## Code of Conduct

We expect all participants in the G4X Viewer project to interact respectfully and constructively with each other. This includes being respectful in communications, focusing on what is best for the community, and showing empathy towards other community members. Please report any unacceptable behavior to [kennethg@singulargenomics.com](mailto:kennethg@singulargenomics.com).

## Getting Started

Contributions to G4X Viewer are made via Issues and Pull Requests (PRs). A few general guidelines:

- Search for existing Issues and PRs before creating your own.
- We work hard to ensure issues are handled in a timely manner but, depending on the impact, it could take a while to investigate the root cause. A friendly ping in the comment thread to the submitter or a contributor can help draw attention if your issue is blocking.

### Issues

Issues should be used to report problems, request a new feature, or discuss potential changes before a PR is created. When you create a new Issue, our standard template will be loaded that will guide you through collecting and providing the information we need to investigate. Please make sure to fill out the template sections, especially the "Repo Steps" section which helps us reproduce and understand your issue.

If you find an Issue that addresses the problem you're having, please add your own reproduction information to the existing issue rather than creating a new one. Adding a [reaction](https://github.blog/2016-03-10-add-reactions-to-pull-requests-issues-and-comments/) can also help indicate to our maintainers that a particular problem is affecting more than just the reporter.

### Pull Requests

PRs are always welcome and can be a quick way to get your fix or improvement slated for the next release. All PRs should be created from and targeted to the `staging` branch.

In general, PRs should:

- Be based on the `staging` branch and target the `staging` branch, not `main` or any other branch.
- Only fix/add the functionality in question OR address wide-spread whitespace/style issues, not both.
- Include thorough manual testing instructions in your PR description.
- Address a single concern in the least number of changed lines as possible.
- Include documentation in the repo.
- Be accompanied by a complete Pull Request template (loaded automatically when a PR is created).

For changes that address core functionality or would require breaking changes (e.g. a major release), it's best to open an Issue to discuss your proposal first. This is not required but can save time creating and reviewing changes.

## Development Setup

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm**

### Local Development

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/G4X-viewer.git
   ```
3. Install dependencies:
   ```bash
   cd G4X-viewer
   npm install
   ```
4. Create a branch for your changes based on the staging branch:
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/your-feature-name
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   The default Vite development server runs on [http://localhost:5173](http://localhost:5173).

## Coding Standards

G4X Viewer uses TypeScript and follows specific coding standards:

- We use ESLint for linting. Run `npm run lint` to check your code.
- TypeScript strict mode is enabled.
- Follow the existing code style in the project.
- Use meaningful variable and function names.
- Write comments for complex logic.
- Keep components focused on a single responsibility.

## Commit Guidelines

We follow conventional commits for our commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

Example: `feat: add new visualization option for OME-TIFF files`

## Testing

Currently, G4X Viewer relies on manual testing. Please ensure your changes don't break existing functionality:

- Thoroughly test your changes in different scenarios and browsers.
- Document your testing process in the PR description.
- Consider edge cases and potential interactions with other features.
- In the future, we may introduce automated testing.

## Documentation

For any new feature or change, documentation should be added or updated:

- Update relevant README sections.
- Add inline code comments for complex logic.
- Consider adding examples for new features.

## Release Process

G4X Viewer follows semantic versioning. The release process is managed by the core team:

1. Features and fixes are merged into the main branch.
2. Release candidates are created for testing.
3. Once approved, a new version is released with appropriate version bump.

## Community

We encourage you to join our community and contribute to G4X Viewer:

- Star the repository if you find it useful.
- Share your success stories or use cases.
- Help others by answering questions in Issues.

Thank you for contributing to G4X Viewer! We appreciate your efforts to make this project better.
