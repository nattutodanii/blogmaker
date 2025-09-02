import { useState } from 'react';

const GEMINI_API_KEYS = [
  'AIzaSyAAk-o1ZQIxHos0ixXdm59qt8jOOEsc_0M',
  'AIzaSyBZcxKcFkMLUBXtYRp5UHoXwGB5mQ1MJVI',
  'AIzaSyDc60zrn69_ofEXMdU4gCOT5QUphrPgiBM',
  'AIzaSyAmh6oy770fHumwmpE7_tyT1cjwiV4jtcA',
  'AIzaSyAIb8_yMe4eBJi0zM-ltIr36VpbIYBrduE',
  'AIzaSyDtYCBEUhsJQoOYtT8AUOHGlicNYyyvdZw',
  'AIzaSyD4C7drU0i3yg9vCx_UyN1kgYaNWnV3K4E',
  'AIzaSyCLaG3KK6BpziM1Uj57Ja9GfnOnqi1o4s8',
  'AIzaSyBHBIe0n4-7tCjfPsRVgNYgUQOznFHfMHw'
];

let currentKeyIndex = 0;
let failedKeys = new Set<number>();

const getNextApiKey = () => {
  let attempts = 0;
  while (attempts < GEMINI_API_KEYS.length) {
    if (!failedKeys.has(currentKeyIndex)) {
      const key = GEMINI_API_KEYS[currentKeyIndex];
      const keyIndex = currentKeyIndex;
      currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
      return { key, keyIndex };
    }
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    attempts++;
  }
  // If all keys failed, reset and try again
  failedKeys.clear();
  const key = GEMINI_API_KEYS[currentKeyIndex];
  const keyIndex = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return { key, keyIndex };
};

function getDetailedPrompt(component: string, examName: string, courseName?: string, length: string = 'medium'): string {
  const baseContext = courseName 
    ? `${courseName} course at ${examName}` 
    : `${examName} exam/institution`;

  const lengthInstructions = {
    short: "Keep response concise (10-50 words max). Include relevant images using ![alt text](https://images.pexels.com/photos/IMAGE_ID/pexels-photo-IMAGE_ID.jpeg) format.",
    medium: "Provide detailed information (200-500 words). Include relevant images using ![alt text](https://images.pexels.com/photos/IMAGE_ID/pexels-photo-IMAGE_ID.jpeg) format and tables in markdown.",
    large: "Create comprehensive content (2-4 pages with tables, images, detailed sections). Include multiple relevant images using ![alt text](https://images.pexels.com/photos/IMAGE_ID/pexels-photo-IMAGE_ID.jpeg) format, tables in markdown, and detailed sections."
  };

  const componentPrompts: { [key: string]: string } = {
    short_description: `Write a brief 10-20 word description highlighting the main aspects of ${baseContext}. Focus only on the most important facts. Include a relevant education/campus image. ${lengthInstructions.short}`,
    
    location: `List all campus locations and cities where ${baseContext} is available. Include specific campus names and addresses if multiple locations exist. Include a campus/location image. ${lengthInstructions.short}`,
    
    established_year: `Provide the establishment year of ${baseContext}. Just the year number. ${lengthInstructions.short}`,
    
    detailed_description: `Write a comprehensive 200-300 word description about ${baseContext}, covering its legacy, reputation, and key features. Include relevant campus/education images. ${lengthInstructions.medium}`,
    
    introduction: `Create a detailed 400-500 word introduction to ${baseContext}. Highlight key achievements, reputation, unique features, and what makes it special. Use engaging language and include important statistics. Include relevant campus/education images. ${lengthInstructions.medium}`,
    
    history: `Write a comprehensive 3-4 page history of ${baseContext}. Include:
    - Founding story and key milestones
    - Important historical events and achievements
    - Evolution over the years
    - Notable alumni and their contributions
    - Historical significance in education
    Use proper headings, include tables for timeline, mention specific years and events, and add historical/campus images. ${lengthInstructions.large}`,
    
    recognition: `Create a detailed 2-3 page section on why ${baseContext} is famous and recognized. Include:
    - National and international recognition
    - Awards and accreditations
    - Unique programs and specializations
    - Industry partnerships
    - Media coverage and reputation
    Format with headings, bullet points, and include award/achievement images. ${lengthInstructions.large}`,
    
    campuses: `Provide comprehensive details about all campuses of ${baseContext}. Include:
    - Campus names and locations
    - Facilities at each campus
    - Campus size and infrastructure
    - Unique features of each campus
    - Contact information and websites
    Create tables, use proper formatting, and include multiple campus images. ${lengthInstructions.large}`,
    
    rankings: `Create comprehensive ranking tables for ${baseContext}. Include:
    - NIRF Rankings (last 5 years)
    - QS World Rankings
    - Times Higher Education Rankings
    - Subject-specific rankings
    - Other notable rankings
    Present in table format with years and positions. Include ranking/achievement images. ${lengthInstructions.large}`,
    
    infrastructure: `Write a detailed 3-4 page description of infrastructure and facilities at ${baseContext}. Include:
    - Academic buildings and classrooms
    - Libraries and research facilities
    - Laboratories and equipment
    - Sports and recreational facilities
    - Hostels and accommodation
    - Medical facilities
    - Transportation
    - Technology infrastructure
    Use headings, bullet points, mention specific facilities, and include multiple infrastructure/facility images. ${lengthInstructions.large}`,
    
    placements: `Create a comprehensive 3-4 page placement analysis for ${baseContext}. Include:
    - Placement statistics (last 5 years)
    - Top recruiting companies
    - Average and highest packages
    - Sector-wise placement breakdown
    - Placement trends and growth
    - Notable alumni in industry
    - Career support services
    Use tables, charts descriptions, statistical data, and include placement/career images. Add note: "For more detailed placement information, visit your specific program page." ${lengthInstructions.large}`,
    
    global_collaborations: `Write a comprehensive 3-4 page section on global collaborations of ${baseContext}. Include:
    - International university partnerships
    - Student exchange programs
    - Joint degree programs
    - Research collaborations
    - International conferences and events
    - Global alumni network
    - International internship opportunities
    Organize with proper headings, detailed descriptions, and include international/collaboration images. ${lengthInstructions.large}`,
    
    fees_scholarships: `Provide detailed information about fees structure and scholarships for ${baseContext}. Include:
    - Detailed fee breakdown
    - Scholarship opportunities
    - Financial aid programs
    - Merit-based scholarships
    - Need-based assistance
    - Government scholarships applicable
    Be truthful about availability. Include scholarship/financial aid images. ${lengthInstructions.medium}`,
    
    preparation_tips: `Create a comprehensive 2-3 page preparation strategy guide for ${baseContext}. Include:
    - Study plan and timeline
    - Subject-wise preparation tips
    - Recommended study materials
    - Mock test strategies
    - Time management techniques
    - Common mistakes to avoid
    - Success stories and tips from toppers
    Add note: "For program-specific preparation, visit your detailed program page." Include study/preparation images. ${lengthInstructions.large}`,
    
    why_choose: `Write a detailed explanation of why students should choose ${baseContext}. Cover unique advantages, opportunities, and benefits in 300-400 words. Include motivational/success images. ${lengthInstructions.medium}`,
    
    syllabus: `Create a comprehensive syllabus breakdown for ${baseContext}. Include:
    - Subject-wise detailed syllabus
    - Topic weightage and importance
    - Exam pattern alignment
    - Reference materials for each topic
    Present in organized tables and sections. Include study/academic images. If multiple courses exist, add note: "For program-specific syllabus, visit your program page." ${lengthInstructions.large}`,
    
    campus: `Write a detailed 2-3 page description of campus life at ${baseContext}. Include:
    - Campus environment and culture
    - Student activities and clubs
    - Events and festivals
    - Sports and recreation
    - Dining and accommodation
    - Campus facilities and amenities
    Include multiple campus life and facility images. ${lengthInstructions.large}`,
    
    admission_procedure: `Provide detailed admission procedure for ${baseContext}. Include:
    - Application process step-by-step
    - Required documents
    - Selection criteria
    - Interview process (if any)
    - Important deadlines
    - Fee payment process
    Include admission/application process images. If multiple courses exist, add note: "For program-specific procedures, visit your program page." ${lengthInstructions.medium}`,
    
    exam_pattern: `Create a detailed exam pattern analysis for ${baseContext}. Include:
    - Paper structure and sections
    - Question types and marking scheme
    - Time duration and distribution
    - Difficulty level analysis
    - Recent pattern changes
    Present in table format with clear sections. Include exam/study images. ${lengthInstructions.medium}`,
    
    pyqs: `Explain the types of questions asked in ${baseContext}. Include:
    - Question pattern analysis
    - Topic-wise question distribution
    - Difficulty level trends
    - Important topics based on previous years
    Include study/exam preparation images. Add note: "For structured practice tests and detailed PYQs, explore your program page or visit our platform." ${lengthInstructions.medium}`,
    
    cutoff_trends: `Create comprehensive cutoff trend analysis for ${baseContext}. Include:
    - Year-wise cutoff data (last 5-7 years)
    - Category-wise cutoffs (General, OBC, SC, ST)
    - Course-wise cutoffs if applicable
    - Trend analysis and predictions
    - Factors affecting cutoffs
    Present in detailed tables with proper formatting. Include statistical/chart images. ${lengthInstructions.large}`,
    
    short_notes: `Briefly explain that comprehensive short notes are available. Write: "For interactive short notes and quick revision materials, visit Masters Up platform for structured content." Include study notes images. ${lengthInstructions.short}`,
    
    important_dates: `Create a comprehensive timeline of important dates for ${baseContext}. Include:
    - Application start and end dates
    - Exam dates
    - Result declaration
    - Counseling and admission dates
    - Fee payment deadlines
    Present in table format with detailed timeline. Include calendar/timeline images. ${lengthInstructions.medium}`,
    
    eligibility_criteria: `Provide detailed eligibility criteria for ${baseContext}. Include:
    - Educational qualifications required
    - Age limits (if any)
    - Subject requirements
    - Minimum marks criteria
    - Category-wise relaxations
    - Special eligibility conditions
    Cover all courses if multiple exist. Include eligibility/qualification images. ${lengthInstructions.large}`,
    
    exam_centers: `List all exam centers and cities where ${baseContext} is conducted. Include:
    - State-wise center distribution
    - Major cities and locations
    - Center allocation process
    - Special arrangements if any
    Organize by regions and states. Include exam center/location images. ${lengthInstructions.medium}`,
    
    scholarships_stipends: `Detail all scholarships and stipends available for ${baseContext}. Include:
    - Merit-based scholarships
    - Need-based financial aid
    - Government scholarships
    - Private scholarships
    - Stipend amounts and criteria
    Be truthful about availability. Include scholarship/financial aid images. ${lengthInstructions.medium}`,
    
    recommended_books: `Briefly mention: "While there are many books available for preparation, we have compiled comprehensive notes with examples and practice questions. Sign up to Masters Up and enjoy free quality content designed by experts." Include books/study material images. ${lengthInstructions.short}`,
    
    // Course-specific prompts
    duration: `Specify the duration of ${baseContext} (e.g., "4 years", "2 years", etc.). Include academic timeline images. ${lengthInstructions.short}`,
    
    intake_capacity: `Provide the total intake capacity/seats available for ${baseContext}. Include category-wise breakdown if available. Include capacity/admission images. ${lengthInstructions.short}`,
    
    average_package: `State the average placement package for ${baseContext}. Include recent year data. Include salary/career images. ${lengthInstructions.short}`,
    
    degree_type: `Specify the type of degree offered (e.g., "Bachelor of Technology", "Master of Science", etc.). Include degree/graduation images. ${lengthInstructions.short}`,
    
    course_overview: `Write a comprehensive 2-3 page overview of ${baseContext}. Include:
    - Course objectives and goals
    - What students will learn
    - Career prospects
    - Industry relevance
    - Unique features of the program
    - Faculty expertise
    Use proper headings, detailed sections, and include multiple course/education images. ${lengthInstructions.large}`,
    
    entrance_exam_details: `Provide detailed information about entrance exams for ${baseContext}. Include exam pattern, syllabus, and preparation tips. Include exam/study images. ${lengthInstructions.medium}`,
    
    placement_statistics: `Create detailed placement statistics for ${baseContext}. Include:
    - Placement percentage (last 5 years)
    - Company-wise hiring data
    - Package distribution
    - Sector-wise placements
    - Internship opportunities
    Present in tables and charts descriptions. Include placement/career images. ${lengthInstructions.large}`,
    
    skills_learning_outcomes: `Detail the skills and learning outcomes students gain from ${baseContext}. Include technical and soft skills development. Include skills/learning images. ${lengthInstructions.medium}`,
    
    preparation_strategy: `Create a comprehensive preparation strategy guide for ${baseContext}. Include study plans, resources, and tips. Include study/preparation images. ${lengthInstructions.large}`,
    
    notes: `Briefly state: "Comprehensive study notes are available on Masters Up platform with interactive content and examples." Include study notes images. ${lengthInstructions.short}`,
    
    chapter_wise_questions: `Briefly mention: "Chapter-wise practice questions are available on Masters Up platform for structured learning." Include practice/question images. ${lengthInstructions.short}`,
    
    full_length_mocks: `Briefly state: "Full-length mock tests are available on Masters Up platform for comprehensive practice." Include mock test images. ${lengthInstructions.short}`,
    
    course_curriculum: `Create detailed semester-wise curriculum for ${baseContext}. Include:
    - Semester-wise subjects
    - Credit distribution
    - Core and elective subjects
    - Practical/lab components
    - Project work
    Present in organized tables. Include curriculum/academic images. ${lengthInstructions.large}`,
    
    projects_assignments: `Describe typical projects and assignments in ${baseContext}. Include types of projects, industry collaborations, and research opportunities. Include project/research images. ${lengthInstructions.medium}`,
    
    day_in_life: `Write about a typical day in the life of a ${baseContext} student. Include classes, activities, and campus life. Include student life images. ${lengthInstructions.medium}`,
    
    campus_life: `Describe campus life experience for ${baseContext} students. Include clubs, events, and social activities. Include campus life/student activity images. ${lengthInstructions.medium}`,
    
    alumni_stories: `Share success stories of notable alumni from ${baseContext}. Include their achievements and career paths. Include success/achievement images. ${lengthInstructions.medium}`,
    
    global_exposure: `Detail global exposure opportunities for ${baseContext} students. Include exchange programs and international collaborations. Include international/global images. ${lengthInstructions.medium}`,
    
    course_comparison: `Compare ${baseContext} with similar courses at other institutions. Highlight unique advantages and differences. Include comparison/analysis images. ${lengthInstructions.medium}`,
    
    quick_facts: `Provide key quick facts about ${baseContext} in bullet points. Include important statistics and highlights. Include fact/statistic images. ${lengthInstructions.short}`
  };

  return componentPrompts[component] || `Provide detailed information about ${component} for ${baseContext}. ${lengthInstructions[length as keyof typeof lengthInstructions]}`;
}

export const useGeminiAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (prompt: string, maxRetries = 3): Promise<string> => {
    setLoading(true);
    setError(null);

    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const { key: apiKey, keyIndex } = getNextApiKey();
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API request failed (attempt ${attempts + 1}) with key ${keyIndex}:`, response.status, errorText);
          
          // Mark this key as failed if it's a quota/auth error
          if (response.status === 429 || response.status === 403) {
            failedKeys.add(keyIndex);
            console.log(`Marking key ${keyIndex} as failed due to ${response.status}`);
          }
          
          attempts++;
          if (attempts >= maxRetries) {
            throw new Error(`API request failed after ${maxRetries} attempts: ${response.status}`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (!content.trim()) {
          throw new Error('Empty response from API');
        }
        
        setLoading(false);
        return content;
      } catch (err) {
        console.error(`Error on attempt ${attempts + 1}:`, err);
        
        attempts++;
        if (attempts >= maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          setLoading(false);
          throw new Error(errorMessage);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('All retry attempts failed');
  };

  return { generateContent, loading, error };
};