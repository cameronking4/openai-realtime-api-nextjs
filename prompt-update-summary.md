# Prompt Update Summary

## Overview

This document summarizes the changes made to the psycho-oncology assessment and AI assessment prompts, as well as the corresponding code updates to support the new prompt structures.

## Prompt Updates

### PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT

The psycho-oncology assessment prompt has been updated with:

1. **Structured Assessment Domains**: Eight specific domains are now explicitly defined and must be covered systematically:
   - Emotional Distress
   - Confidence in Managing Treatment
   - Daily Life Challenges
   - Impact of Physical Symptoms
   - Social Support
   - Worry About Health & Future
   - Treatment Engagement
   - Early Warning for Crisis Prevention

2. **Improved Conversation Structure**: Clear guidelines for session structure, conversation style, and topic management.

3. **Enhanced Assessment Guidelines**: Specific instructions for gathering quantifiable data and severity ratings for each domain.

4. **Emergency Protocol**: Detailed instructions for handling severe distress or potential self-harm.

5. **Recommendations Phase**: Structured approach to providing tailored recommendations based on assessment results.

### AI_ASSESSMENT_PROMPT

The AI assessment prompt has been updated with:

1. **Domain-Specific Structure**: Assessment now organized around the same eight key domains as the psycho-oncology assessment.

2. **Standardized Scoring**: Clear scoring guidelines (1-10 scale) with specific meaning for each range.

3. **Completeness Tracking**: Explicit tracking of which domains have sufficient data and which are missing information.

4. **Enhanced JSON Structure**: New JSON format with separate sections for:
   - Domain Assessments
   - General Metrics
   - Communication Patterns
   - Support Resources
   - Risk Factors
   - Recommendations
   - Summaries
   - Assessment Completeness

5. **N/A Handling**: Proper handling of domains with insufficient data using "N/A" values.

### ANSWER_SUGGESTION_PROMPT

A new prompt type has been added to guide AI in providing comprehensive answers to user questions:

1. **Structured Answer Format**: Guidelines for structuring answers with direct responses, context, supporting details, and conclusions.

2. **Quality Guidelines**: Instructions for ensuring accuracy, completeness, relevance, clarity, and balance in responses.

3. **Tone and Style Guidance**: Direction on maintaining appropriate tone, adapting formality, and using clear language.

4. **Domain-Specific Instructions**: Special guidelines for handling technical questions, subjective topics, and sensitive areas like health, legal, or financial advice.

5. **Formatting Recommendations**: Guidance on using headings, bullet points, and other formatting to improve readability.

6. **Knowledge Limitations**: Instructions for transparently acknowledging limitations and avoiding speculation.

## Code Updates

### AssessmentVisualization Component

The `AssessmentVisualization` component has been updated to:

1. **Support Both Formats**: Handle both old and new JSON structures for backward compatibility.

2. **Display Domain Assessments**: Render the new domain-specific assessments.

3. **Handle N/A Values**: Properly display and style N/A values in metrics.

4. **Show Completeness Information**: Visualize assessment completeness data.

5. **Improve Error Handling**: Enhanced parsing and error recovery for different JSON formats.

### Database Updates

New versions of prompts have been created in the database:

1. **PSYCHO_ONCOLOGY_ASSESSMENT**: Version "Structured Domains v1"
2. **AI_ASSESSMENT**: Version "Structured Domains v1"
3. **ANSWER_SUGGESTION**: Version "Comprehensive Answer Guide v1"

All versions have been activated and are now being used by the application.

## Testing

A test data structure was created to verify the new JSON format and component updates. The test confirmed:

1. Proper handling of all new fields in the JSON structure
2. Correct display of N/A values
3. Visualization of completeness tracking information

## Next Steps

1. **Monitor Assessment Quality**: Track the quality and completeness of assessments with the new prompts.
2. **Gather User Feedback**: Collect feedback from clinicians on the new assessment format.
3. **Consider Additional Metrics**: Evaluate if additional metrics or domains should be added in future versions.
4. **Evaluate Answer Quality**: Monitor the effectiveness of the ANSWER_SUGGESTION prompt in improving response quality.
5. **Expand Prompt Library**: Consider adding additional specialized prompts for different interaction types. 