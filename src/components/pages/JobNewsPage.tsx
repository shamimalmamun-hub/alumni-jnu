import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter, 
  PlusCircle, 
  CheckCircle2, 
  GraduationCap, 
  FileText, 
  Share2, 
  Bookmark, 
  AlertCircle,
  X,
  BadgeCheck,
  ChevronRight
} from 'lucide-react';

interface JobCircular {
  id: string;
  titleBn: string;
  titleEn: string;
  organizationBn?: string;
  organizationEn?: string;
  category?: 'govt' | 'pharma' | 'teaching' | 'fellowship';
  categoryLabelBn?: string;
  categoryLabelEn?: string;
  locationBn?: string;
  locationEn?: string;
  jobTypeBn?: string;
  jobTypeEn?: string;
  salaryBn?: string;
  salaryEn?: string;
  deadlineBn?: string;
  deadlineEn?: string;
  qualificationBn?: string;
  qualificationEn?: string;
  descriptionBn?: string;
  descriptionEn?: string;
  sourceBn?: string;
  sourceEn?: string;
  applyLink?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf' | 'other';
  isUrgent?: boolean;
}

const INITIAL_JOBS: JobCircular[] = [];

interface JobNewsPageProps {
  language: 'bn' | 'en';
  onBackToHome: () => void;
}

export const JobNewsPage: React.FC<JobNewsPageProps> = ({ language, onBackToHome }) => {
  const [jobs, setJobs] = useState<JobCircular[]>(() => {
    try {
      const saved = localStorage.getItem('botany_alumni_jobs_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_JOBS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJobModal, setSelectedJobModal] = useState<JobCircular | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Job Post Form State (Simplified: Title + Image/PDF)
  const [newJob, setNewJob] = useState<{
    title: string;
    fileUrl: string;
    fileName: string;
    fileType: 'image' | 'pdf' | 'other';
  }>({
    title: '',
    fileUrl: '',
    fileName: '',
    fileType: 'image'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const fileType: 'image' | 'pdf' = isPdf ? 'pdf' : 'image';

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewJob((prev) => ({
        ...prev,
        fileUrl: result,
        fileName: file.name,
        fileType: fileType
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    try {
      localStorage.setItem('botany_alumni_jobs_v2', JSON.stringify(jobs));
    } catch (e) {}
  }, [jobs]);

  const categories = [
    { id: 'all', labelBn: 'সব বিজ্ঞপ্তি', labelEn: 'All Circulars' },
    { id: 'govt', labelBn: 'সরকারি চাকরি (Govt)', labelEn: 'Government' },
    { id: 'pharma', labelBn: 'বায়োফার্মা ও এগ্রো', labelEn: 'Biopharma & Agro' },
    { id: 'teaching', labelBn: 'শিক্ষকতা ও বিসিএস', labelEn: 'Teaching & BCS' },
    { id: 'fellowship', labelBn: 'উচ্চশিক্ষা ও স্কলারশিপ', labelEn: 'Scholarships' }
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      job.titleBn.toLowerCase().includes(query) ||
      job.titleEn.toLowerCase().includes(query) ||
      (job.organizationBn && job.organizationBn.toLowerCase().includes(query)) ||
      (job.locationBn && job.locationBn.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title.trim()) return;

    const createdJob: JobCircular = {
      id: `job-${Date.now()}`,
      titleBn: newJob.title.trim(),
      titleEn: newJob.title.trim(),
      organizationBn: 'উদ্ভিদবিজ্ঞান অ্যালামনাই নোটিশ বোর্ড',
      organizationEn: 'Botany Alumni Notice Board',
      category: 'govt',
      categoryLabelBn: 'নতুন বিজ্ঞপ্তি',
      categoryLabelEn: 'Notice',
      locationBn: 'বাংলাদেশ',
      locationEn: 'Bangladesh',
      jobTypeBn: 'সার্কুলার / নোটিশ',
      jobTypeEn: 'Circular / Notice',
      salaryBn: 'বিজ্ঞপ্তি দ্রষ্টব্য',
      salaryEn: 'See Notice',
      deadlineBn: 'সংযুক্ত ফাইল দেখুন',
      deadlineEn: 'See File Attached',
      qualificationBn: 'সংযুক্ত ছবি/PDF ফাইলে সকল তথ্য উল্লেখ করা আছে।',
      qualificationEn: 'All details are in the attached image or PDF.',
      descriptionBn: 'বিজ্ঞপ্তির সকল বিবরণ দেখতে ফাইল খুলুন।',
      descriptionEn: 'Open attached file for details.',
      sourceBn: 'অ্যালামনাই সার্কুলার সেল',
      sourceEn: 'Alumni Desk',
      applyLink: newJob.fileUrl || '#',
      fileUrl: newJob.fileUrl,
      fileName: newJob.fileName,
      fileType: newJob.fileType,
      isUrgent: false
    };

    setJobs((prev) => [createdJob, ...prev]);
    setIsPostModalOpen(false);
    setNewJob({
      title: '',
      fileUrl: '',
      fileName: '',
      fileType: 'image'
    });

    setToastMessage(language === 'bn' ? 'বিজ্ঞপ্তিটি সফলভাবে প্রকাশ করা হয়েছে!' : 'Notice published successfully!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="w-full bg-[#f8faf9] min-h-screen py-6 px-3 sm:px-6 md:px-8 font-siliguri animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-100 shadow-2xs">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোম বাতায়নে ফিরুন' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006a4e] hover:bg-[#004d38] text-amber-300 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'চাকরির বিজ্ঞপ্তি পোস্ট করুন' : 'Post Job Circular'}</span>
            </button>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              {language === 'bn' ? 'ক্যারিয়ার ও চাকরি বাতায়ন' : 'Career & Job Desk'}
            </span>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-3 bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-emerald-800 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Job Circulars List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 font-serif-bn flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#006a4e]" />
              <span>{language === 'bn' ? 'সর্বশেষ চাকরি ও নিয়োগ বিজ্ঞপ্তি' : 'Latest Job Circulars'}</span>
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              {language === 'bn' ? `মোট প্রদর্শিত: ${filteredJobs.length}টি` : `Total Displayed: ${filteredJobs.length}`}
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-700">
                {language === 'bn' ? 'কোনো চাকরি বিজ্ঞপ্তি পাওয়া যায়নি' : 'No job circulars found'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'bn' ? 'অন্য কোনো কীওয়ার্ড দিয়ে অনুসন্ধান করুন বা সকল খাত নির্বাচন করুন।' : 'Try searching with another keyword or reset the category filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-emerald-100 hover:border-emerald-400 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 space-y-3 group"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          job.category === 'govt' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          job.category === 'pharma' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          job.category === 'teaching' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                          {language === 'bn' ? job.categoryLabelBn : job.categoryLabelEn}
                        </span>

                        {job.isUrgent && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200 animate-pulse">
                            {language === 'bn' ? 'জরুরি বিজ্ঞপ্তি' : 'Urgent'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#006a4e] transition-colors leading-snug">
                        {language === 'bn' ? job.titleBn : job.titleEn}
                      </h3>

                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{language === 'bn' ? job.organizationBn : job.organizationEn}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-gray-500 block">
                        {language === 'bn' ? 'আবেদনের শেষ তারিখ' : 'Application Deadline'}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 inline-block mt-0.5">
                        {language === 'bn' ? job.deadlineBn : job.deadlineEn}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 text-gray-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{language === 'bn' ? job.locationBn : job.locationEn}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{language === 'bn' ? job.jobTypeBn : job.jobTypeEn}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate font-semibold text-[#006a4e]">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{language === 'bn' ? job.salaryBn : job.salaryEn}</span>
                    </div>
                  </div>

                  {/* Qualification Snippet */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    <strong className="text-gray-800 font-bold">{language === 'bn' ? 'প্রয়োজনীয় যোগ্যতা: ' : 'Requirement: '}</strong>
                    {language === 'bn' ? job.qualificationBn : job.qualificationEn}
                  </p>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {language === 'bn' ? 'সূত্র: ' : 'Source: '}
                      {language === 'bn' ? job.sourceBn : job.sourceEn}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJobModal(job)}
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#006a4e] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-gray-200"
                      >
                        {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                      </button>

                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#006a4e] hover:bg-[#004d38] text-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{language === 'bn' ? 'আবেদন করুন' : 'Apply Now'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* View Job Details Modal */}
      {selectedJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-emerald-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 gap-2">
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006a4e] border border-emerald-200">
                  {language === 'bn' ? selectedJobModal.categoryLabelBn : selectedJobModal.categoryLabelEn}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mt-1 font-serif-bn">
                  {language === 'bn' ? selectedJobModal.titleBn : selectedJobModal.titleEn}
                </h3>
                <p className="text-xs font-semibold text-emerald-800">
                  {language === 'bn' ? selectedJobModal.organizationBn : selectedJobModal.organizationEn}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              {/* Attached file preview if present */}
              {selectedJobModal.fileUrl && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-[#006a4e] flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{language === 'bn' ? 'সংযুক্ত বিজ্ঞপ্তি ফাইল:' : 'Attached Circular File:'}</span>
                  </h4>
                  {selectedJobModal.fileType === 'pdf' || selectedJobModal.fileUrl.startsWith('data:application/pdf') ? (
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="font-bold text-xs truncate text-gray-800">{selectedJobModal.fileName || 'Notice.pdf'}</span>
                      </div>
                      <a
                        href={selectedJobModal.fileUrl}
                        download={selectedJobModal.fileName || 'notice.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-[#006a4e] text-amber-300 rounded-lg text-xs font-bold shrink-0 hover:bg-[#004d38] transition-colors"
                      >
                        {language === 'bn' ? 'PDF দেখুন / ডাউনলোড' : 'View / Download PDF'}
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <img
                        src={selectedJobModal.fileUrl}
                        alt="Circular File"
                        className="max-h-96 w-full object-contain rounded-lg border border-emerald-200 bg-white shadow-xs"
                      />
                      <a
                        href={selectedJobModal.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006a4e] hover:underline"
                      >
                        <span>{language === 'bn' ? 'সম্পূর্ণ ছবি নতুন ট্যাবে খুলুন' : 'Open Full Image in New Tab'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedJobModal.organizationBn && (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <span className="text-gray-500 block">কর্মস্থল:</span>
                    <span className="font-bold text-gray-900">{language === 'bn' ? selectedJobModal.locationBn : selectedJobModal.locationEn}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">চাকরির ধরন:</span>
                    <span className="font-bold text-gray-900">{language === 'bn' ? selectedJobModal.jobTypeBn : selectedJobModal.jobTypeEn}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">বেতন / গ্রেড:</span>
                    <span className="font-bold text-[#006a4e]">{language === 'bn' ? selectedJobModal.salaryBn : selectedJobModal.salaryEn}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">আবেদনের শেষ তারিখ:</span>
                    <span className="font-bold text-red-600">{language === 'bn' ? selectedJobModal.deadlineBn : selectedJobModal.deadlineEn}</span>
                  </div>
                </div>
              )}

              {selectedJobModal.qualificationBn && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">বিবরণ / নির্দেশনা:</h4>
                  <p className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs leading-relaxed text-gray-700">
                    {language === 'bn' ? selectedJobModal.qualificationBn : selectedJobModal.qualificationEn}
                  </p>
                </div>
              )}

              <div className="text-[11px] text-gray-400 pt-1">
                বিজ্ঞপ্তি সূত্র: {language === 'bn' ? selectedJobModal.sourceBn || 'অ্যালামনাই সার্কুলার সেল' : selectedJobModal.sourceEn || 'Alumni Desk'}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedJobModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Post Job Circular Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-emerald-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[#006a4e]">
                <PlusCircle className="w-5 h-5" />
                <h3 className="font-bold text-base font-serif-bn">
                  {language === 'bn' ? 'বিজ্ঞপ্তি প্রকাশ করুন' : 'Post Notice / Circular'}
                </h3>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              {/* 1. Title */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  {language === 'bn' ? 'শিরোনাম -' : 'Title -'}
                </label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder={language === 'bn' ? 'বিজ্ঞপ্তির শিরোনাম লিখুন...' : 'Enter notice title...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              {/* 2. Image / PDF Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  {language === 'bn' ? 'ছবি / PDF -' : 'Image / PDF -'}
                </label>
                
                <div className="border-2 border-dashed border-emerald-200 rounded-xl p-4 bg-emerald-50/40 text-center hover:bg-emerald-50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {newJob.fileUrl ? (
                    <div className="space-y-2">
                      {newJob.fileType === 'image' ? (
                        <img
                          src={newJob.fileUrl}
                          alt="Uploaded Circular"
                          className="max-h-40 mx-auto rounded-lg shadow-xs border border-emerald-200 object-contain bg-white p-1"
                        />
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                          <FileText className="w-6 h-6 shrink-0" />
                          <span className="font-bold text-xs truncate max-w-[200px]">{newJob.fileName || 'Circular.pdf'}</span>
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-emerald-700">
                        {language === 'bn' ? '✓ ফাইল সিলেক্ট হয়েছে (পরিবর্তন করতে ক্লিক করুন)' : '✓ File selected (Click to change)'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-3">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-[#006a4e] group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">
                        {language === 'bn' ? 'ছবি বা PDF ফাইল নির্বাচন করুন' : 'Click to select Image or PDF'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {language === 'bn' ? 'ফরম্যাট: Image (JPG, PNG) অথবা PDF' : 'Supported: Image or PDF'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006a4e] hover:bg-[#004d38] text-amber-300 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  {language === 'bn' ? 'বিজ্ঞপ্তি প্রকাশ করুন' : 'Publish Circular'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
