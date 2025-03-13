'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [promptFilter, setPromptFilter] = useState('all');
  
  // Load dashboard data
  useEffect(() => {
    // In a real app, you would fetch the dashboard data from an API
    // For now, we'll create mock data
    setTimeout(() => {
      const mockDashboardData = {
        summary: {
          totalTests: 42,
          averageScore: 0.78,
          testsThisWeek: 12,
          improvementRate: 0.08
        },
        promptVersions: [
          { id: 'v1.2', name: 'Assessment Prompt v1.2', tests: 24 },
          { id: 'v1.1', name: 'Assessment Prompt v1.1', tests: 15 },
          { id: 'v1.0', name: 'Assessment Prompt v1.0', tests: 3 }
        ],
        metrics: {
          accuracy: [0.65, 0.68, 0.72, 0.75, 0.76, 0.78, 0.79],
          empathy: [0.58, 0.62, 0.65, 0.68, 0.70, 0.72, 0.74],
          clarity: [0.70, 0.72, 0.75, 0.78, 0.80, 0.82, 0.85],
          overall: [0.64, 0.67, 0.71, 0.74, 0.75, 0.77, 0.79]
        },
        recentTests: [
          {
            id: 'test-1',
            date: '2023-11-17T15:30:00Z',
            persona: 'Margaret Wilson, 62, Breast Cancer Stage II',
            promptVersion: 'v1.2',
            scores: {
              accuracy: 0.82,
              empathy: 0.75,
              clarity: 0.88,
              overallScore: 0.81
            }
          },
          {
            id: 'test-2',
            date: '2023-11-16T16:45:00Z',
            persona: 'Robert Johnson, 58, Prostate Cancer Stage III',
            promptVersion: 'v1.2',
            scores: {
              accuracy: 0.76,
              empathy: 0.70,
              clarity: 0.84,
              overallScore: 0.77
            }
          },
          {
            id: 'test-3',
            date: '2023-11-15T09:15:00Z',
            persona: 'Sarah Chen, 45, Colorectal Cancer Stage I',
            promptVersion: 'v1.2',
            scores: {
              accuracy: 0.79,
              empathy: 0.73,
              clarity: 0.82,
              overallScore: 0.78
            }
          },
          {
            id: 'test-4',
            date: '2023-11-14T11:20:00Z',
            persona: 'James Miller, 71, Lung Cancer Stage III',
            promptVersion: 'v1.1',
            scores: {
              accuracy: 0.72,
              empathy: 0.68,
              clarity: 0.75,
              overallScore: 0.72
            }
          },
          {
            id: 'test-5',
            date: '2023-11-13T14:10:00Z',
            persona: 'Emily Davis, 39, Ovarian Cancer Stage II',
            promptVersion: 'v1.1',
            scores: {
              accuracy: 0.70,
              empathy: 0.65,
              clarity: 0.78,
              overallScore: 0.71
            }
          }
        ],
        personaPerformance: [
          { name: 'High Anxiety', count: 12, avgScore: 0.76 },
          { name: 'Low Support Network', count: 8, avgScore: 0.72 },
          { name: 'Newly Diagnosed', count: 10, avgScore: 0.81 },
          { name: 'Advanced Stage', count: 7, avgScore: 0.75 },
          { name: 'Elderly', count: 5, avgScore: 0.69 }
        ]
      };
      
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 1500);
  }, []);
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    // In a real app, you would fetch new data based on the time range
  };
  
  const handlePromptFilterChange = (filter: string) => {
    setPromptFilter(filter);
    // In a real app, you would filter the data based on the prompt version
  };
  
  // Helper function to render a simple bar chart
  const renderBarChart = (data: number[], labels: string[] = []) => {
    const max = Math.max(...data);
    
    return (
      <div className="flex items-end h-40 space-x-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-8 bg-blue-500 rounded-t"
              style={{ height: `${(value / max) * 100}%` }}
            ></div>
            {labels.length > 0 && (
              <div className="text-xs mt-1 text-gray-500">{labels[index]}</div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Helper function to render a line chart for metrics
  const renderLineChart = () => {
    if (!dashboardData) return null;
    
    const { metrics } = dashboardData;
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    
    return (
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
          <div>100%</div>
          <div>75%</div>
          <div>50%</div>
          <div>25%</div>
          <div>0%</div>
        </div>
        
        {/* Chart area */}
        <div className="absolute left-8 right-0 top-0 bottom-16 bg-gray-50 border border-gray-200 rounded">
          {/* Grid lines */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-200"></div>
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200"></div>
          
          {/* Lines */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {/* Overall line */}
            <polyline
              points={metrics.overall.map((value: number, index: number) => 
                `${(index / (metrics.overall.length - 1)) * 100}%,${(1 - value) * 100}%`
              ).join(' ')}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Accuracy line */}
            <polyline
              points={metrics.accuracy.map((value: number, index: number) => 
                `${(index / (metrics.accuracy.length - 1)) * 100}%,${(1 - value) * 100}%`
              ).join(' ')}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />
            
            {/* Empathy line */}
            <polyline
              points={metrics.empathy.map((value: number, index: number) => 
                `${(index / (metrics.empathy.length - 1)) * 100}%,${(1 - value) * 100}%`
              ).join(' ')}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />
            
            {/* Clarity line */}
            <polyline
              points={metrics.clarity.map((value: number, index: number) => 
                `${(index / (metrics.clarity.length - 1)) * 100}%,${(1 - value) * 100}%`
              ).join(' ')}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute left-8 right-0 bottom-0 h-16 flex justify-between text-xs text-gray-500">
          {days.map((day, index) => (
            <div key={index} className="text-center">
              <div>{day}</div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="absolute left-8 right-0 bottom-8 flex justify-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span>Overall</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Accuracy</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
            <span>Empathy</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></div>
            <span>Clarity</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Dashboard</h2>
          
          <div className="flex space-x-4">
            <div>
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="promptFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Version
              </label>
              <select
                id="promptFilter"
                value={promptFilter}
                onChange={(e) => handlePromptFilterChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Versions</option>
                {dashboardData?.promptVersions.map((version: any) => (
                  <option key={version.id} value={version.id}>
                    {version.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      ) : dashboardData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Tests</div>
              <div className="text-3xl font-bold">{dashboardData.summary.totalTests}</div>
              <div className="text-sm text-gray-500 mt-2">
                {dashboardData.summary.testsThisWeek} this week
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Average Score</div>
              <div className="text-3xl font-bold">{(dashboardData.summary.averageScore * 100).toFixed(0)}%</div>
              <div className="text-sm text-green-500 mt-2">
                +{(dashboardData.summary.improvementRate * 100).toFixed(0)}% improvement
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Best Performing Prompt</div>
              <div className="text-xl font-bold">Assessment v1.2</div>
              <div className="text-sm text-gray-500 mt-2">
                {dashboardData.promptVersions[0].tests} tests run
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Best Performing Metric</div>
              <div className="text-xl font-bold">Clarity</div>
              <div className="text-sm text-gray-500 mt-2">
                {(Math.max(...dashboardData.metrics.clarity) * 100).toFixed(0)}% score
              </div>
            </div>
          </div>
          
          {/* Metrics Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Performance Metrics Over Time</h2>
            {renderLineChart()}
          </div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tests */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Recent Tests</h2>
              
              <div className="space-y-4">
                {dashboardData.recentTests.map((test: any) => (
                  <div key={test.id} className="p-3 rounded-md border border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium">{test.persona}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(test.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-xs text-gray-500">Version:</div>
                      <div className="text-xs font-medium bg-gray-200 px-1.5 py-0.5 rounded-full">
                        {test.promptVersion}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">Score:</div>
                      <div 
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          test.scores.overallScore >= 0.8 ? 'bg-green-100 text-green-800' :
                          test.scores.overallScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(test.scores.overallScore * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <Link 
                      href={`/admin/llm-test/evaluator?simulationId=${test.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View details
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Link 
                  href="/admin/llm-test/run"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <span>Run new tests</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Persona Performance */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Performance by Persona Type</h2>
              
              <div className="space-y-4">
                {dashboardData.personaPerformance.map((persona: any) => (
                  <div key={persona.name} className="flex items-center">
                    <div className="w-32 text-sm">{persona.name}</div>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            persona.avgScore >= 0.8 ? 'bg-green-500' :
                            persona.avgScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${persona.avgScore * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium">
                      {(persona.avgScore * 100).toFixed(0)}%
                    </div>
                    <div className="w-16 text-right text-xs text-gray-500">
                      {persona.count} tests
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Areas for Improvement</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    <span>Elderly patients (69% score) - Consider simplifying language</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    <span>Low support network (72% score) - Add more resource recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-1">•</span>
                    <span>Advanced stage (75% score) - Improve empathy in responses</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center py-8 text-gray-500">
            <p>No dashboard data available.</p>
            <p className="text-sm mt-2">Run some tests to generate dashboard data.</p>
            <Link 
              href="/admin/llm-test/run"
              className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Run Tests
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 