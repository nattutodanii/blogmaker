import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGeminiAPI } from '../hooks/useGeminiAPI';
import BlogPreview from './BlogPreview';
import { BookOpen, GraduationCap, Loader2, Save, Sparkles, Play, Pause, RotateCcw, Eye } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  description: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  exam_id: string;
}

const EXAM_COMPONENTS = [
  { key: 'short_description', label: 'Short Description', length: 'short' },
  { key: 'location', label: 'Location', length: 'short' },
  { key: 'established_year', label: 'Established Year', length: 'short' },
  { key: 'detailed_description', label: 'Detailed Description', length: 'medium' },
  { key: 'introduction', label: 'Introduction', length: 'medium' },
  { key: 'history', label: 'History and Legacy', length: 'medium' },
  { key: 'recognition', label: 'Ranking and Recognition', length: 'medium' },
  { key: 'campuses', label: 'Campus Locations', length: 'large' },
  { key: 'rankings', label: 'Rankings', length: 'medium' },
  { key: 'infrastructure', label: 'Infrastructure and Facilities', length: 'medium' },
  { key: 'placements', label: 'Placements & Career Opportunities', length: 'large' },
  { key: 'global_collaborations', label: 'Global Collaborations', length: 'medium' },
  { key: 'fees_scholarships', label: 'Fees & Financial Support', length: 'medium' },
  { key: 'preparation_tips', label: 'Preparation Strategy', length: 'large' },
  { key: 'why_choose', label: 'Why Choose', length: 'medium' },
  { key: 'syllabus', label: 'Syllabus', length: 'medium' },
  { key: 'campus', label: 'Campus', length: 'medium' },
  { key: 'admission_procedure', label: 'Admission Procedure', length: 'large' },
  { key: 'exam_pattern', label: 'Exam Pattern', length: 'large' },
  { key: 'pyqs', label: 'PYQs', length: 'medium' },
  { key: 'cutoff_trends', label: 'Cut-off Trends', length: 'medium' },
  { key: 'short_notes', label: 'Short Notes', length: 'medium' },
  { key: 'important_dates', label: 'Important Dates & Notifications', length: 'medium' },
  { key: 'eligibility_criteria', label: 'Eligibility Criteria', length: 'large' },
  { key: 'exam_centers', label: 'Exam Centers / Cities', length: 'medium' },
  { key: 'scholarships_stipends', label: 'Scholarships & Stipends', length: 'medium' },
  { key: 'recommended_books', label: 'Recommended Books & Resources', length: 'medium' }
];

const COURSE_COMPONENTS = [
  { key: 'duration', label: 'Duration', length: 'short' },
  { key: 'intake_capacity', label: 'Intake Capacity', length: 'short' },
  { key: 'average_package', label: 'Average Package', length: 'short' },
  { key: 'degree_type', label: 'Degree Type', length: 'short' },
  { key: 'course_overview', label: 'Course Overview', length: 'large' },
  { key: 'entrance_exam_details', label: 'Entrance Exam & Admission', length: 'medium' },
  { key: 'placement_statistics', label: 'Placement Statistics', length: 'large' },
  { key: 'exam_pattern', label: 'Exam Pattern', length: 'medium' },
  { key: 'skills_learning_outcomes', label: 'Skills & Learning Outcomes', length: 'medium' },
  { key: 'admission_procedure', label: 'Admission Procedure', length: 'medium' },
  { key: 'preparation_strategy', label: 'Preparation Strategy', length: 'large' },
  { key: 'syllabus', label: 'Syllabus', length: 'large' },
  { key: 'notes', label: 'Notes', length: 'medium' },
  { key: 'short_notes', label: 'Short Notes', length: 'medium' },
  { key: 'chapter_wise_questions', label: 'Chapter-wise Questions', length: 'medium' },
  { key: 'full_length_mocks', label: 'Full-length Mock Tests', length: 'medium' },
  { key: 'course_curriculum', label: 'Course Curriculum (Semester-wise)', length: 'large' },
  { key: 'projects_assignments', label: 'Projects & Assignments', length: 'medium' },
  { key: 'day_in_life', label: 'Day in the Life of a Student', length: 'medium' },
  { key: 'campus_life', label: 'Campus Life', length: 'medium' },
  { key: 'alumni_stories', label: 'Alumni Success Stories', length: 'medium' },
  { key: 'global_exposure', label: 'Global Exposure / Collaborations', length: 'medium' },
  { key: 'course_comparison', label: 'Comparison with Other Courses', length: 'medium' },
  { key: 'quick_facts', label: 'Quick Facts', length: 'medium' }
];

function getDetailedPrompt(component: string, examName: string, courseName?: string, length: string = 'medium'): string {
  const baseContext = courseName 
    ? `${courseName} course at ${examName}` 
    : `${examName} exam/institution`;

  const lengthInstructions = {
    short: "Keep response concise (10-50 words max).",
    medium: "Provide detailed information (200-500 words). can include tables",
    large: "Create comprehensive content (2-4 pages with tables, images, detailed sections) include tables, charts and images."
  };

  const componentPrompts: { [key: string]: string } = {
    short_description: `Write a brief 10-20 word description highlighting the main aspects of ${baseContext}. Focus only on the most important facts. ${lengthInstructions.short}`,
    
    location: `List all campus locations and cities where ${baseContext} is available. Include specific campus names and addresses if multiple locations exist. ${lengthInstructions.short}`,
    
    established_year: `Provide the establishment year of ${baseContext}. Just the year number. ${lengthInstructions.short}`,
    
    detailed_description: `Write a comprehensive 200-300 word description about ${baseContext}, covering its legacy, reputation, and key features. ${lengthInstructions.medium}`,
    
    introduction: `Create a detailed 400-500 word introduction to ${baseContext}. Highlight key achievements, reputation, unique features, and what makes it special. Use engaging language and include important statistics. ${lengthInstructions.medium}`,
    
    history: `Write a comprehensive 3-4 page history of ${baseContext}. Include:
    - Founding story and key milestones
    - Important historical events and achievements
    - Evolution over the years
    - Notable alumni and their contributions
    - Historical significance in education
    Use proper headings, include tables for timeline, and mention specific years and events. ${lengthInstructions.large}`,
    
    recognition: `Create a detailed 2-3 page section on why ${baseContext} is famous and recognized. Include:
    - National and international recognition
    - Awards and accreditations
    - Unique programs and specializations
    - Industry partnerships
    - Media coverage and reputation
    Format with headings and bullet points. ${lengthInstructions.large}`,
    
    campuses: `Provide comprehensive details about all campuses of ${baseContext}. Include:
    - Campus names and locations
    - Facilities at each campus
    - Campus size and infrastructure
    - Unique features of each campus
    - Contact information and websites
    Create tables and use proper formatting. ${lengthInstructions.large}`,
    
    rankings: `Create comprehensive ranking tables for ${baseContext}. Include:
    - NIRF Rankings (last 5 years)
    - QS World Rankings
    - Times Higher Education Rankings
    - Subject-specific rankings
    - Other notable rankings
    Present in table format with years and positions. ${lengthInstructions.large}`,
    
    infrastructure: `Write a detailed 3-4 page description of infrastructure and facilities at ${baseContext}. Include:
    - Academic buildings and classrooms
    - Libraries and research facilities
    - Laboratories and equipment
    - Sports and recreational facilities
    - Hostels and accommodation
    - Medical facilities
    - Transportation
    - Technology infrastructure
    Use headings, bullet points, and mention specific facilities. ${lengthInstructions.large}`,
    
    placements: `Create a comprehensive 3-4 page placement analysis for ${baseContext}. Include:
    - Placement statistics (last 5 years)
    - Top recruiting companies
    - Average and highest packages
    - Sector-wise placement breakdown
    - Placement trends and growth
    - Notable alumni in industry
    - Career support services
    Use tables, charts descriptions, and statistical data. Add note: "For more detailed placement information, visit your specific program page." ${lengthInstructions.large}`,
    
    global_collaborations: `Write a comprehensive 3-4 page section on global collaborations of ${baseContext}. Include:
    - International university partnerships
    - Student exchange programs
    - Joint degree programs
    - Research collaborations
    - International conferences and events
    - Global alumni network
    - International internship opportunities
    Organize with proper headings and detailed descriptions. ${lengthInstructions.large}`,
    
    fees_scholarships: `Provide detailed information about fees structure and scholarships for ${baseContext}. Include:
    - Detailed fee breakdown
    - Scholarship opportunities
    - Financial aid programs
    - Merit-based scholarships
    - Need-based assistance
    - Government scholarships applicable
    Be truthful about availability. ${lengthInstructions.medium}`,
    
    preparation_tips: `Create a comprehensive 2-3 page preparation strategy guide for ${baseContext}. Include:
    - Study plan and timeline
    - Subject-wise preparation tips
    - Recommended study materials
    - Mock test strategies
    - Time management techniques
    - Common mistakes to avoid
    - Success stories and tips from toppers
    Add note: "For program-specific preparation, visit your detailed program page." ${lengthInstructions.large}`,
    
    why_choose: `Write a detailed explanation of why students should choose ${baseContext}. Cover unique advantages, opportunities, and benefits in 300-400 words. ${lengthInstructions.medium}`,
    
    syllabus: `Create a comprehensive syllabus breakdown for ${baseContext}. Include:
    - Subject-wise detailed syllabus
    - Topic weightage and importance
    - Exam pattern alignment
    - Reference materials for each topic
    Present in organized tables and sections. If multiple courses exist, add note: "For program-specific syllabus, visit your program page." ${lengthInstructions.large}`,
    
    campus: `Write a detailed 2-3 page description of campus life at ${baseContext}. Include:
    - Campus environment and culture
    - Student activities and clubs
    - Events and festivals
    - Sports and recreation
    - Dining and accommodation
    - Campus facilities and amenities
    Include descriptions of campus images and facilities. ${lengthInstructions.large}`,
    
    admission_procedure: `Provide detailed admission procedure for ${baseContext}. Include:
    - Application process step-by-step
    - Required documents
    - Selection criteria
    - Interview process (if any)
    - Important deadlines
    - Fee payment process
    If multiple courses exist, add note: "For program-specific procedures, visit your program page." ${lengthInstructions.medium}`,
    
    exam_pattern: `Create a detailed exam pattern analysis for ${baseContext}. Include:
    - Paper structure and sections
    - Question types and marking scheme
    - Time duration and distribution
    - Difficulty level analysis
    - Recent pattern changes
    Present in table format with clear sections. ${lengthInstructions.medium}`,
    
    pyqs: `Explain the types of questions asked in ${baseContext}. Include:
    - Question pattern analysis
    - Topic-wise question distribution
    - Difficulty level trends
    - Important topics based on previous years
    Add note: "For structured practice tests and detailed PYQs, explore your program page or visit our platform." ${lengthInstructions.medium}`,
    
    cutoff_trends: `Create comprehensive cutoff trend analysis for ${baseContext}. Include:
    - Year-wise cutoff data (last 5-7 years)
    - Category-wise cutoffs (General, OBC, SC, ST)
    - Course-wise cutoffs if applicable
    - Trend analysis and predictions
    - Factors affecting cutoffs
    Present in detailed tables with proper formatting. ${lengthInstructions.large}`,
    
    short_notes: `Briefly explain that comprehensive short notes are available. Write: "For interactive short notes and quick revision materials, visit Masters Up platform for structured content." ${lengthInstructions.short}`,
    
    important_dates: `Create a comprehensive timeline of important dates for ${baseContext}. Include:
    - Application start and end dates
    - Exam dates
    - Result declaration
    - Counseling and admission dates
    - Fee payment deadlines
    Present in table format with detailed timeline. ${lengthInstructions.medium}`,
    
    eligibility_criteria: `Provide detailed eligibility criteria for ${baseContext}. Include:
    - Educational qualifications required
    - Age limits (if any)
    - Subject requirements
    - Minimum marks criteria
    - Category-wise relaxations
    - Special eligibility conditions
    Cover all courses if multiple exist. ${lengthInstructions.large}`,
    
    exam_centers: `List all exam centers and cities where ${baseContext} is conducted. Include:
    - State-wise center distribution
    - Major cities and locations
    - Center allocation process
    - Special arrangements if any
    Organize by regions and states. ${lengthInstructions.medium}`,
    
    scholarships_stipends: `Detail all scholarships and stipends available for ${baseContext}. Include:
    - Merit-based scholarships
    - Need-based financial aid
    - Government scholarships
    - Private scholarships
    - Stipend amounts and criteria
    Be truthful about availability. ${lengthInstructions.medium}`,
    
    recommended_books: `Briefly mention: "While there are many books available for preparation, we have compiled comprehensive notes with examples and practice questions. Sign up to Masters Up and enjoy free quality content designed by experts." ${lengthInstructions.short}`,
    
    // Course-specific prompts
    duration: `Specify the duration of ${baseContext} (e.g., "4 years", "2 years", etc.). ${lengthInstructions.short}`,
    
    intake_capacity: `Provide the total intake capacity/seats available for ${baseContext}. Include category-wise breakdown if available. ${lengthInstructions.short}`,
    
    average_package: `State the average placement package for ${baseContext}. Include recent year data. ${lengthInstructions.short}`,
    
    degree_type: `Specify the type of degree offered (e.g., "Bachelor of Technology", "Master of Science", etc.). ${lengthInstructions.short}`,
    
    course_overview: `Write a comprehensive 2-3 page overview of ${baseContext}. Include:
    - Course objectives and goals
    - What students will learn
    - Career prospects
    - Industry relevance
    - Unique features of the program
    - Faculty expertise
    Use proper headings and detailed sections. ${lengthInstructions.large}`,
    
    entrance_exam_details: `Provide detailed information about entrance exams for ${baseContext}. Include exam pattern, syllabus, and preparation tips. ${lengthInstructions.medium}`,
    
    placement_statistics: `Create detailed placement statistics for ${baseContext}. Include:
    - Placement percentage (last 5 years)
    - Company-wise hiring data
    - Package distribution
    - Sector-wise placements
    - Internship opportunities
    Present in tables and charts descriptions. ${lengthInstructions.large}`,
    
    skills_learning_outcomes: `Detail the skills and learning outcomes students gain from ${baseContext}. Include technical and soft skills development. ${lengthInstructions.medium}`,
    
    preparation_strategy: `Create a comprehensive preparation strategy guide for ${baseContext}. Include study plans, resources, and tips. ${lengthInstructions.large}`,
    
    notes: `Briefly state: "Comprehensive study notes are available on Masters Up platform with interactive content and examples." ${lengthInstructions.short}`,
    
    chapter_wise_questions: `Briefly mention: "Chapter-wise practice questions are available on Masters Up platform for structured learning." ${lengthInstructions.short}`,
    
    full_length_mocks: `Briefly state: "Full-length mock tests are available on Masters Up platform for comprehensive practice." ${lengthInstructions.short}`,
    
    course_curriculum: `Create detailed semester-wise curriculum for ${baseContext}. Include:
    - Semester-wise subjects
    - Credit distribution
    - Core and elective subjects
    - Practical/lab components
    - Project work
    Present in organized tables. ${lengthInstructions.large}`,
    
    projects_assignments: `Describe typical projects and assignments in ${baseContext}. Include types of projects, industry collaborations, and research opportunities. ${lengthInstructions.medium}`,
    
    day_in_life: `Write about a typical day in the life of a ${baseContext} student. Include classes, activities, and campus life. ${lengthInstructions.medium}`,
    
    campus_life: `Describe campus life experience for ${baseContext} students. Include clubs, events, and social activities. ${lengthInstructions.medium}`,
    
    alumni_stories: `Share success stories of notable alumni from ${baseContext}. Include their achievements and career paths. ${lengthInstructions.medium}`,
    
    global_exposure: `Detail global exposure opportunities for ${baseContext} students. Include exchange programs and international collaborations. ${lengthInstructions.medium}`,
    
    course_comparison: `Compare ${baseContext} with similar courses at other institutions. Highlight unique advantages and differences. ${lengthInstructions.medium}`,
    
    quick_facts: `Provide key quick facts about ${baseContext} in bullet points. Include important statistics and highlights. ${lengthInstructions.short}`
  };

  return componentPrompts[component] || `Provide detailed information about ${component} for ${baseContext}. ${lengthInstructions[length as keyof typeof lengthInstructions]}`;
}

export function BlogGenerator() {
  const [blogType, setBlogType] = useState<'exam' | 'course'>('exam');
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isAutomated, setIsAutomated] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationProgress, setAutomationProgress] = useState<{
    currentComponent: string;
    completedComponents: number;
    totalComponents: number;
    currentCourse?: string;
    completedCourses?: number;
    totalCourses?: number;
  }>({
    currentComponent: '',
    completedComponents: 0,
    totalComponents: 0
  });
  const [showPreview, setShowPreview] = useState(false);

  const { generateContent } = useGeminiAPI();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam && blogType === 'course') {
      fetchCourses(selectedExam);
    }
  }, [selectedExam, blogType]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setMessage('Error fetching exams');
    }
  };

  const fetchCourses = async (examId: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('exam_id', examId)
        .order('name');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage('Error fetching courses');
    }
  };

  const handleGenerateComponent = async () => {
    if (!selectedExam || !selectedComponent) {
      setMessage('Please select exam and component');
      return;
    }

    if (blogType === 'course' && !selectedCourse) {
      setMessage('Please select a course');
      return;
    }

    setIsGenerating(true);
    setMessage('');

    try {
      const examName = exams.find(e => e.id === selectedExam)?.name || '';
      const courseName = blogType === 'course' 
        ? courses.find(c => c.id === selectedCourse)?.name || ''
        : undefined;

      const component = blogType === 'exam' 
        ? EXAM_COMPONENTS.find(c => c.key === selectedComponent)
        : COURSE_COMPONENTS.find(c => c.key === selectedComponent);

      const prompt = getDetailedPrompt(
        selectedComponent, 
        examName, 
        courseName,
        component?.length || 'medium'
      );

      const content = await generateContent(prompt);
      setGeneratedContent(content);
      setMessage('Component generated successfully!');
    } catch (error) {
      console.error('Error generating component:', error);
      setMessage('Error generating component. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!generatedContent || !selectedExam || !selectedComponent) {
      setMessage('No content to save');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const examName = exams.find(e => e.id === selectedExam)?.name || '';
      
      if (blogType === 'exam') {
        // Check if exam blog exists
        const { data: existingBlogs } = await supabase
          .from('exam_blog')
          .select('id')
          .eq('exam_id', selectedExam);

        const updateData = {
          [selectedComponent]: generatedContent,
          name: examName,
          exam_id: selectedExam
        };

        if (existingBlogs && existingBlogs.length > 0) {
          // Update existing blog
          const { error } = await supabase
            .from('exam_blog')
            .update(updateData)
            .eq('id', existingBlogs[0].id);
          
          if (error) throw error;
        } else {
          // Create new blog
          const { error } = await supabase
            .from('exam_blog')
            .insert(updateData);
          
          if (error) throw error;
        }
      } else {
        // Course blog
        if (!selectedCourse) {
          setMessage('Please select a course');
          return;
        }

        const courseName = courses.find(c => c.id === selectedCourse)?.name || '';

        // Check if course blog exists
        const { data: existingBlogs } = await supabase
          .from('course_blog')
          .select('id')
          .eq('course_id', selectedCourse);

        const updateData = {
          [selectedComponent]: generatedContent,
          name: courseName,
          course_id: selectedCourse,
          exam_id: selectedExam
        };

        if (existingBlogs && existingBlogs.length > 0) {
          // Update existing blog
          const { error } = await supabase
            .from('course_blog')
            .update(updateData)
            .eq('id', existingBlogs[0].id);
          
          if (error) throw error;
        } else {
          // Create new blog
          const { error } = await supabase
            .from('course_blog')
            .insert(updateData);
          
          if (error) throw error;
        }
      }

      setMessage('Content saved to database successfully!');
      setGeneratedContent('');
      setSelectedComponent('');
    } catch (error) {
      console.error('Error saving to database:', error);
      setMessage('Error saving to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const saveComponentToDatabase = async (
    component: string, 
    content: string, 
    examId: string, 
    courseId?: string
  ): Promise<boolean> => {
    try {
      const examName = exams.find(e => e.id === examId)?.name || '';
      
      if (blogType === 'exam') {
        // Check if exam blog exists
        const { data: existingBlogs } = await supabase
          .from('exam_blog')
          .select('id')
          .eq('exam_id', examId);

        const updateData = {
          [component]: content,
          name: examName,
          exam_id: examId
        };

        if (existingBlogs && existingBlogs.length > 0) {
          const { error } = await supabase
            .from('exam_blog')
            .update(updateData)
            .eq('id', existingBlogs[0].id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('exam_blog')
            .insert(updateData);
          
          if (error) throw error;
        }
      } else {
        // Course blog
        if (!courseId) return false;

        const courseName = courses.find(c => c.id === courseId)?.name || '';

        const { data: existingBlogs } = await supabase
          .from('course_blog')
          .select('id')
          .eq('course_id', courseId);

        const updateData = {
          [component]: content,
          name: courseName,
          course_id: courseId,
          exam_id: examId
        };

        if (existingBlogs && existingBlogs.length > 0) {
          const { error } = await supabase
            .from('course_blog')
            .update(updateData)
            .eq('id', existingBlogs[0].id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('course_blog')
            .insert(updateData);
          
          if (error) throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving to database:', error);
      return false;
    }
  };

  const generateSingleComponent = async (
    component: { key: string; label: string; length: string },
    examId: string,
    courseId?: string
  ): Promise<string | null> => {
    try {
      const examName = exams.find(e => e.id === examId)?.name || '';
      const courseName = courseId 
        ? courses.find(c => c.id === courseId)?.name || ''
        : undefined;

      const prompt = getDetailedPrompt(
        component.key, 
        examName, 
        courseName,
        component.length
      );

      const content = await generateContent(prompt);
      return content;
    } catch (error) {
      console.error(`Error generating ${component.key}:`, error);
      return null;
    }
  };

  const handleAutomateExamBlog = async () => {
    if (!selectedExam) {
      setMessage('Please select an exam first');
      return;
    }

    setIsAutomating(true);
    setMessage('Starting automated exam blog generation...');
    
    const components = EXAM_COMPONENTS;
    let completedCount = 0;
    let failedComponents: string[] = [];

    setAutomationProgress({
      currentComponent: '',
      completedComponents: 0,
      totalComponents: components.length
    });

    // Get existing blog data to check which components are empty
    let existingBlog: any = null;
    try {
      const { data: existingBlogs } = await supabase
        .from('exam_blog')
        .select('*')
        .eq('exam_id', selectedExam);
      
      if (existingBlogs && existingBlogs.length > 0) {
        existingBlog = existingBlogs[0];
      }
    } catch (error) {
      console.log('No existing blog found');
    }

    for (const component of components) {
      if (!isAutomating) break; // Allow stopping automation

      // Skip if component already has content
      if (existingBlog && existingBlog[component.key] && 
          String(existingBlog[component.key]).trim().length > 0) {
        completedCount++;
        setAutomationProgress(prev => ({
          ...prev,
          completedComponents: completedCount
        }));
        setMessage(`⏭️ Skipped: ${component.label} (already has content)`);
        await sleep(500);
        continue;
      }

      setAutomationProgress(prev => ({
        ...prev,
        currentComponent: component.label
      }));

      setMessage(`Generating: ${component.label}...`);

      const content = await generateSingleComponent(component, selectedExam);
      
      if (content) {
        const saved = await saveComponentToDatabase(component.key, content, selectedExam);
        if (saved) {
          completedCount++;
          setMessage(`✅ Completed: ${component.label}`);
        } else {
          failedComponents.push(component.label);
          setMessage(`❌ Failed to save: ${component.label}`);
        }
      } else {
        failedComponents.push(component.label);
        setMessage(`❌ Failed to generate: ${component.label}`);
      }

      setAutomationProgress(prev => ({
        ...prev,
        completedComponents: completedCount
      }));

      // 3 second break between components
      if (isAutomating) {
        await sleep(3000);
      }
    }

    setIsAutomating(false);
    setMessage(
      `Automation completed! ✅ ${completedCount}/${components.length} components generated. ${
        failedComponents.length > 0 ? `Failed: ${failedComponents.join(', ')}` : ''
      }`
    );
  };

  const handleAutomateCourseBlog = async () => {
    if (!selectedExam) {
      setMessage('Please select an exam first');
      return;
    }

    if (courses.length === 0) {
      setMessage('No courses found for selected exam');
      return;
    }

    setIsAutomating(true);
    setMessage(`Starting automated course blog generation for ${courses.length} courses...`);
    
    const components = COURSE_COMPONENTS;
    let totalCompleted = 0;
    let courseIndex = 0;

    setAutomationProgress({
      currentComponent: '',
      completedComponents: 0,
      totalComponents: components.length,
      currentCourse: '',
      completedCourses: 0,
      totalCourses: courses.length
    });

    for (const course of courses) {
      if (!isAutomating) break;

      setAutomationProgress(prev => ({
        ...prev,
        currentCourse: course.name,
        completedCourses: courseIndex
      }));

      let courseCompletedCount = 0;
      let failedComponents: string[] = [];

      // Get existing blog data for this course
      let existingBlog: any = null;
      try {
        const { data: existingBlogs } = await supabase
          .from('course_blog')
          .select('*')
          .eq('course_id', course.id);
        
        if (existingBlogs && existingBlogs.length > 0) {
          existingBlog = existingBlogs[0];
        }
      } catch (error) {
        console.log('No existing blog found for course');
      }
      for (const component of components) {
        if (!isAutomating) break;

        // Skip if component already has content
        if (existingBlog && existingBlog[component.key] && 
            String(existingBlog[component.key]).trim().length > 0) {
          courseCompletedCount++;
          totalCompleted++;
          setAutomationProgress(prev => ({
            ...prev,
            completedComponents: courseCompletedCount
          }));
          setMessage(`⏭️ ${course.name} - Skipped: ${component.label} (already has content)`);
          await sleep(500);
          continue;
        }

        setAutomationProgress(prev => ({
          ...prev,
          currentComponent: component.label,
          completedComponents: courseCompletedCount
        }));

        setMessage(`Course: ${course.name} - Generating: ${component.label}...`);

        const content = await generateSingleComponent(component, selectedExam, course.id);
        
        if (content) {
          const saved = await saveComponentToDatabase(component.key, content, selectedExam, course.id);
          if (saved) {
            courseCompletedCount++;
            totalCompleted++;
            setMessage(`✅ ${course.name} - Completed: ${component.label}`);
          } else {
            failedComponents.push(component.label);
            setMessage(`❌ ${course.name} - Failed to save: ${component.label}`);
          }
        } else {
          failedComponents.push(component.label);
          setMessage(`❌ ${course.name} - Failed to generate: ${component.label}`);
        }

        setAutomationProgress(prev => ({
          ...prev,
          completedComponents: courseCompletedCount
        }));

        // 3 second break between components
        if (isAutomating) {
          await sleep(3000);
        }
      }

      courseIndex++;
      setMessage(
        `Course "${course.name}" completed! ✅ ${courseCompletedCount}/${components.length} components. ${
          failedComponents.length > 0 ? `Failed: ${failedComponents.join(', ')}` : ''
        }`
      );

      // Break between courses
      if (isAutomating && courseIndex < courses.length) {
        await sleep(2000);
      }
    }

    setIsAutomating(false);
    setAutomationProgress(prev => ({
      ...prev,
      completedCourses: courses.length
    }));
    setMessage(
      `All courses automation completed! ✅ ${totalCompleted} total components generated across ${courses.length} courses.`
    );
  };

  const handleStartAutomation = () => {
    if (blogType === 'exam') {
      handleAutomateExamBlog();
    } else {
      handleAutomateCourseBlog();
    }
  };

  const handleStopAutomation = () => {
    setIsAutomating(false);
    setMessage('Automation stopped by user');
  };

  const currentComponents = blogType === 'exam' ? EXAM_COMPONENTS : COURSE_COMPONENTS;

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Generator
            </button>
          </div>
          
          <BlogPreview
            examId={selectedExam}
            courseId={selectedCourse}
            blogType={blogType}
            examName={exams.find(e => e.id === selectedExam)?.name || ''}
            courseName={courses.find(c => c.id === selectedCourse)?.name}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-indigo-600" />
            Blog Generator
          </h1>
          <p className="text-lg text-gray-600">Generate comprehensive blogs for exams and courses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generate Content</h2>
            
            {/* Blog Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Blog Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setBlogType('exam')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    blogType === 'exam'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Exam Blog
                </button>
                <button
                  onClick={() => setBlogType('course')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    blogType === 'course'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Course Blog
                </button>
              </div>
            </div>

            {/* Exam Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Choose an exam...</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selection (only for course blogs) */}
            {blogType === 'course' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={!selectedExam}
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Automation Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isAutomated}
                  onChange={(e) => setIsAutomated(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Automation (Generate all components automatically)
                </span>
              </label>
            </div>

            {/* Component Selection - Only show if automation is disabled */}
            {!isAutomated && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Component</label>
                <select
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a component...</option>
                  {currentComponents.map((component) => (
                    <option key={component.key} value={component.key}>
                      {component.label} ({component.length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Automation Progress */}
            {isAutomating && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Automation Progress</h3>
                {automationProgress.currentCourse && (
                  <p className="text-sm text-blue-700 mb-1">
                    Course: {automationProgress.currentCourse} ({automationProgress.completedCourses + 1}/{automationProgress.totalCourses})
                  </p>
                )}
                <p className="text-sm text-blue-700 mb-2">
                  Component: {automationProgress.currentComponent}
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${(automationProgress.completedComponents / automationProgress.totalComponents) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600">
                  {automationProgress.completedComponents}/{automationProgress.totalComponents} components completed
                </p>
              </div>
            )}

            {/* Manual Component Selection */}
            {!isAutomated && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Component</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Choose a component...</option>
                {currentComponents.map((component) => (
                  <option key={component.key} value={component.key}>
                    {component.label} ({component.length})
                  </option>
                ))}
              </select>
            </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              {isAutomated ? (
                <>
                  <button
                    onClick={handleStartAutomation}
                    disabled={isAutomating || !selectedExam}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAutomating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Automating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Automation
                      </>
                    )}
                  </button>
                  
                  {isAutomating && (
                    <button
                      onClick={handleStopAutomation}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Stop Automation
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleGenerateComponent}
                    disabled={isGenerating || !selectedExam || !selectedComponent || (blogType === 'course' && !selectedCourse)}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Component
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveToDatabase}
                    disabled={isSaving || !generatedContent}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save to Database
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Preview Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!selectedExam || (blogType === 'course' && !selectedCourse)}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview & Download Blog
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Right Panel - Content Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generated Content</h2>
            
            {(generatedContent || isAutomating) ? (
              <div className="prose max-w-none">
                {isAutomating ? (
                  <div className="text-center py-12 text-gray-600">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-indigo-600" />
                    <p className="text-lg font-medium">Automation in Progress</p>
                    <p className="text-sm">Generating and saving components automatically...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                      {generatedContent}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Generated content will appear here</p>
                <p className="text-sm">Select an exam, component, and click generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}