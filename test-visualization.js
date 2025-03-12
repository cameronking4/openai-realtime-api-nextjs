const fs = require('fs');
const path = require('path');

// Read the test assessment data
const testFilePath = path.join(__dirname, 'test-assessment-data.json');
const assessmentData = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));

// Log the structure to verify it matches what we expect
console.log('Assessment Data Structure:');
console.log('- domainAssessments:', Object.keys(assessmentData.domainAssessments).join(', '));
console.log('- generalMetrics:', Object.keys(assessmentData.generalMetrics).join(', '));
console.log('- communication:', Object.keys(assessmentData.communication).join(', '));
console.log('- supportResources:', assessmentData.supportResources.length, 'items');
console.log('- supportGaps:', assessmentData.supportGaps.length, 'items');
console.log('- riskFactors:', assessmentData.riskFactors.length, 'items');
console.log('- recommendations:', Object.keys(assessmentData.recommendations).join(', '));
console.log('- summaries:', Object.keys(assessmentData.summaries).join(', '));
console.log('- assessmentCompleteness:', Object.keys(assessmentData.assessmentCompleteness).join(', '));

// Check for N/A values
const naValues = [];
Object.entries(assessmentData.domainAssessments).forEach(([domain, data]) => {
  if (data.score === 'N/A' || data.confidence === 'N/A') {
    naValues.push(domain);
  }
});

console.log('\nDomains with N/A values:', naValues.join(', '));

// Verify completeness tracking
console.log('\nCompleteness Tracking:');
console.log('- Domains with sufficient data:', assessmentData.assessmentCompleteness.domainsWithSufficientData.length);
console.log('- Domains with insufficient data:', assessmentData.assessmentCompleteness.domainsWithInsufficientData.join(', '));
console.log('- Overall completeness score:', assessmentData.assessmentCompleteness.overallCompletenessScore);

console.log('\nThe AssessmentVisualization component has been updated to handle this new structure.');
console.log('Key changes include:');
console.log('1. Support for both old and new JSON formats');
console.log('2. Display of domain-specific assessments');
console.log('3. Proper handling of N/A values');
console.log('4. Visualization of assessment completeness');
console.log('5. Improved error handling and fallbacks');

console.log('\nTo manually test the component:');
console.log('1. Start the application');
console.log('2. Create a new assessment using the updated AI_ASSESSMENT_PROMPT');
console.log('3. Verify that the visualization correctly displays all sections');
console.log('4. Check that N/A values are properly handled');
console.log('5. Confirm that completeness tracking is visible'); 