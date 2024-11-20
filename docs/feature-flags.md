# Feature Flags Management

## Overview

The AI Tax Preparation Platform includes a robust feature flags management system that allows administrators to enable or disable specific features without deploying new code. This document provides an overview of the system and instructions for developers on how to use feature flags in the application.

## Key Components

1. **Admin Interface**: Located at `/admin/feature-flags`, this page allows administrators to create, edit, and toggle feature flags.
2. **API Endpoints**: 
   - `/api/admin/feature-flags`: For CRUD operations on feature flags
   - `/api/admin/feature-flags/bulk`: For bulk actions on multiple feature flags (enable/disable)
   - `/api/admin/feature-flags/[id]/changelog`: For retrieving the change log of a specific feature flag
   - `/api/feature-flags/[name]`: For checking the status of a feature flag by name
3. **Database Models**: 
   - `FeatureFlag`: Stores feature flag information
   - `FeatureFlagChangeLog`: Tracks changes made to feature flags
4. **React Hook**: `useFeatureFlag` for easy integration in React components

// Rest of the content remains the same...