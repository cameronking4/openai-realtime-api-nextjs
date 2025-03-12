# AI Model Configuration

This document describes how to configure the AI models used in the application.

## Overview

The application uses different Anthropic Claude models for different purposes:

1. **Suggestions Model**: Used for generating quick reply suggestions. This should be a fast model.
2. **Assessment Model**: Used for generating detailed assessments. This should be a more capable model.
3. **Default Model**: Used for general API usage.

## Configuration

The models can be configured using environment variables in your `.env` or `.env.local` file:

```
# Model for generating quick reply suggestions (should be fast)
ANTHROPIC_SUGGESTION_MODEL="claude-3-haiku-20240307"

# Model for generating assessments (should be more capable)
ANTHROPIC_ASSESSMENT_MODEL="claude-3-7-sonnet-20250219"

# Model for general API usage
ANTHROPIC_DEFAULT_MODEL="claude-3-opus-20240229"
```

You can also configure the maximum tokens and temperature for each model type:

```
# Maximum tokens for each model type
ANTHROPIC_SUGGESTION_MAX_TOKENS=150
ANTHROPIC_ASSESSMENT_MAX_TOKENS=4000
ANTHROPIC_DEFAULT_MAX_TOKENS=4000

# Temperature settings for each model type
ANTHROPIC_SUGGESTION_TEMPERATURE=0.7
ANTHROPIC_ASSESSMENT_TEMPERATURE=0.7
ANTHROPIC_DEFAULT_TEMPERATURE=0.7
```

## Default Configuration

If no environment variables are provided, the application will use the following default configuration:

| Purpose | Model | Max Tokens | Temperature |
|---------|-------|------------|------------|
| Suggestions | claude-3-haiku-20240307 | 150 | 0.7 |
| Assessments | claude-3-7-sonnet-20250219 | 4000 | 0.7 |
| Default | claude-3-opus-20240229 | 4000 | 0.7 |

## Implementation Details

The model configuration is centralized in the `app/_lib/model-config.ts` file. This file exports functions to get the configuration for each model type:

- `getSuggestionModelConfig()`: Returns the configuration for the suggestions model.
- `getAssessmentModelConfig()`: Returns the configuration for the assessment model.
- `getDefaultModelConfig()`: Returns the configuration for the default model.

These functions are used in the `app/_lib/anthropic-client.ts` file to make API calls to the Anthropic API.

## Recommended Models

- For quick reply suggestions: Use `claude-3-haiku-20240307` (fast, lower cost)
- For assessments: Use `claude-3-7-sonnet-20250219` (most capable, highest quality)
- For general API usage: Use `claude-3-opus-20240229` (very capable, high quality)

You can update these models as newer versions become available from Anthropic. 