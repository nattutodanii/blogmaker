import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Eye, ExternalLink, FileText, BookOpen, GraduationCap } from 'lucide-react';

interface BlogPreviewProps {
  examId?: string;
  courseId?: string;
  blogType: 'exam' | 'course';
  examName?: string;
  courseName?: string;
}

interface BlogData {
  id: string;
  name: string;
  [key: string]: any;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  examId,
  courseId,
  blogType,
  examName,
  courseName
}) => {
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');

  useEffect(() => {
    fetchBlogData();
  }, [examId, courseId, blogType]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      let query;
      
      if (blogType === 'exam' && examId) {
        query = supabase
          .from('exam_blog')
          .select('*')
          .eq('exam_id', examId)
          .single();
      } else if (blogType === 'course' && courseId) {
        query = supabase
          .from('course_blog')
          .select('*')
          .eq('course_id', courseId)
          .single();
      }

      if (query) {
        const { data, error } = await query;
        if (error) {
          console.error('Error fetching blog data:', error);
        } else {
          setBlogData(data);
          // Initialize with all available components
          const components = getAvailableComponents(data);
          setSelectedComponents(components);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableComponents = (data: BlogData) => {
    const excludeFields = ['id', 'exam_id', 'course_id', 'name', 'created_at'];
    return Object.keys(data).filter(key => 
      !excludeFields.includes(key) && 
      data[key] && 
      data[key].trim() !== ''
    );
  };

  const formatComponentName = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for preview
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="w-full h-64 object-cover rounded-lg my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  const handleComponentToggle = (component: string) => {
    setSelectedComponents(prev => 
      prev.includes(component)
        ? prev.filter(c => c !== component)
        : [...prev, component]
    );
  };

  const handleDownloadPDF = () => {
    if (selectedComponents.length === 0) {
      alert('Please select at least one component to include in the PDF');
      return;
    }
    setShowPDFModal(true);
  };

  const generatePDF = async () => {
    if (!whatsappLink || !telegramLink) {
      alert('Please provide both WhatsApp and Telegram channel links');
      return;
    }

    // Here you would integrate with your PDF generation logic
    // For now, we'll just close the modal
    setShowPDFModal(false);
    alert('PDF generation would start here with the selected components and social links');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading blog preview...</span>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="text-center p-8">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Data Found</h3>
        <p className="text-gray-600">
          No blog content available for this {blogType}. Please generate content first.
        </p>
      </div>
    );
  }

  const availableComponents = getAvailableComponents(blogData);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {blogType === 'exam' ? (
              <GraduationCap className="w-8 h-8 text-blue-600" />
            ) : (
              <BookOpen className="w-8 h-8 text-green-600" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {blogData.name || examName || courseName}
              </h1>
              <p className="text-gray-600 capitalize">{blogType} Blog Preview</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={selectedComponents.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Component Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Components for PDF</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableComponents.map(component => (
            <label key={component} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedComponents.includes(component)}
                onChange={() => handleComponentToggle(component)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{formatComponentName(component)}</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Selected: {selectedComponents.length} of {availableComponents.length} components
        </p>
      </div>

      {/* Blog Content Preview */}
      <div className="space-y-6">
        {selectedComponents.map(component => (
          <div key={component} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {formatComponentName(component)}
              </h3>
            </div>
            <div className="p-6">
              <div 
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-4">${renderMarkdown(blogData[component] || '')}</p>` 
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* PDF Generation Modal */}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Social Media Links
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide your channel links to include on the first page of the PDF:
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Channel Link
                </label>
                <input
                  type="url"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  placeholder="https://whatsapp.com/channel/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telegram Channel Link
                </label>
                <input
                  type="url"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPDFModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generatePDF}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPreview;