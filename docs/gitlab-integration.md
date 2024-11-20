# GitLab Integration and CI/CD Documentation

This document provides detailed information about the GitLab integration and Continuous Integration/Continuous Deployment (CI/CD) setup for the AI Tax Preparation Platform.

## Table of Contents

1. [GitLab CI/CD Pipeline](#gitlab-cicd-pipeline)
2. [Configuration Files](#configuration-files)
3. [Environment Variables](#environment-variables)
4. [Issue Templates](#issue-templates)
5. [Merge Request Template](#merge-request-template)
6. [Best Practices](#best-practices)

## GitLab CI/CD Pipeline

Our GitLab CI/CD pipeline is defined in the `.gitlab-ci.yml` file and consists of three stages:

1. **Test**: Runs the test suite to ensure code quality and functionality.
2. **Build**: Builds the Next.js application for production.
3. **Deploy**: Deploys the application to Vercel (only on the main branch).

### Pipeline Stages

#### Test Stage
- Uses Node.js 18
- Installs dependencies with `npm ci`
- Runs the test suite with `npm run test`

#### Build Stage
- Uses Node.js 18
- Installs dependencies with `npm ci`
- Builds the application with `npm run build`
- Artifacts: The `.next/` directory is saved for use in the deploy stage

#### Deploy Stage
- Uses Node.js 18
- Installs dependencies with `npm ci`
- Builds the application with `npm run build`
- Deploys to Vercel using the Vercel CLI
- Only runs on the `main` branch

## Configuration Files

### .gitlab-ci.yml

This file defines the CI/CD pipeline. Key features:

- Uses Node.js 18 for all stages
- Caches `node_modules/` to speed up subsequent runs
- Defines separate jobs for test, build, and deploy stages
- Uses `npm ci` for consistent, clean installs
- Deploys to Vercel only on the `main` branch

### .gitignore

The `.gitignore` file is updated to include GitLab-specific entries:

```
# GitLab
.gitlab-ci-local/
```

## Environment Variables

The following environment variable needs to be set in your GitLab CI/CD settings:

- `VERCEL_TOKEN`: Your Vercel deployment token

To set this:
1. Go to your GitLab project
2. Navigate to Settings > CI/CD
3. Expand the "Variables" section
4. Click "Add Variable"
5. Set the key as `VERCEL_TOKEN` and the value as your Vercel token
6. Make sure to mask this variable for security

## Issue Templates

We provide two issue templates to standardize issue reporting:

1. **Bug Report** (`.gitlab/issue_templates/bug_report.md`):
   - Description of the bug
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots (if applicable)
   - Environment details
   - Additional context

2. **Feature Request** (`.gitlab/issue_templates/feature_request.md`):
   - Problem description (if applicable)
   - Proposed solution
   - Alternative solutions considered
   - Additional context

## Merge Request Template

The merge request template (`.gitlab/merge_request_templates/default.md`) helps standardize merge requests and includes:

- Description of changes
- Related issues
- Checklist for tests, documentation, and code quality
- Space for additional notes

## Best Practices

1. **Branching**: Create feature branches for all new work. Use the format `feature/your-feature-name` or `bugfix/your-bugfix-name`.

2. **Commits**: Write clear, concise commit messages. Use the present tense and be descriptive.

3. **Testing**: Always add or update tests for your changes. Ensure all tests pass before creating a merge request.

4. **Code Review**: All merge requests should be reviewed by at least one other team member before merging.

5. **CI/CD**: Pay attention to the CI/CD pipeline results. Fix any issues that arise during the pipeline execution.

6. **Documentation**: Update relevant documentation when making changes, including this GitLab integration doc if necessary.

7. **Security**: Never commit sensitive information like API keys or passwords. Always use GitLab CI/CD variables for such data.

By following these practices and utilizing the provided GitLab integration, we can maintain a high-quality, efficient development process for our AI Tax Preparation Platform.