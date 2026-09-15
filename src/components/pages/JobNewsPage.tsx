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
  organizationBn: string;
  organizationEn: string;
  category: 'govt' | 'pharma' | 'teaching' | 'fellowship';
  categoryLabelBn: string;
  categoryLabelEn: string;
  locationBn: string;
  locationEn: string;
  jobTypeBn: string;
  jobTypeEn: string;
  salaryBn: string;
  salaryEn: string;
  deadlineBn: string;
  deadlineEn: string;
  qualificationBn: string;
  qualificationEn: string;
  descriptionBn: string;
  descriptionEn: string;
  sourceBn: string;
  sourceEn: string;
  applyLink: string;
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

  // New Job Post Form State
  const [newJob, setNewJob] = useState({
    title: '',
    organization: '',
    category: 'govt',
    location: '',
    salary: '',
    deadline: '',
    qualification: '',
    description: '',
    applyLink: ''
  });

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
      job.organizationBn.toLowerCase().includes(query) ||
      job.organizationEn.toLowerCase().includes(query) ||
      job.locationBn.toLowerCase().includes(query) ||
      job.qualificationBn.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.organization) return;

    const createdJob: JobCircular = {
      id: `job-${Date.now()}`,
      titleBn: newJob.title,
      titleEn: newJob.title,
      organizationBn: newJob.organization,
      organizationEn: newJob.organization,
      category: newJob.category as any,
      categoryLabelBn: 
        newJob.category === 'govt' ? 'সরকারি চাকরি' :
        newJob.category === 'pharma' ? 'বায়োফার্মা ও এগ্রো' :
        newJob.category === 'teaching' ? 'শিক্ষকতা ও বিসিএস' : 'উচ্চশিক্ষা ও স্কলারশিপ',
      categoryLabelEn: newJob.category.toUpperCase(),
      locationBn: newJob.location || 'ঢাকা',
      locationEn: newJob.location || 'Dhaka',
      jobTypeBn: 'ফুল-টাইম',
      jobTypeEn: 'Full-Time',
      salaryBn: newJob.salary || 'আলোচনা সাপেক্ষে',
      salaryEn: newJob.salary || 'Negotiable',
      deadlineBn: newJob.deadline || 'শিগগিরই সমাপ্ত হবে',
      deadlineEn: newJob.deadline || 'Closing Soon',
      qualificationBn: newJob.qualification || 'উদ্ভিদবিজ্ঞান বা সংশ্লিষ্ট বিষয়ে স্নাতক/স্নাতকোত্তর।',
      qualificationEn: newJob.qualification || 'Graduation in Botany or relevant discipline.',
      descriptionBn: newJob.description || 'উদ্ভিদবিজ্ঞান অ্যালামনাইদের জন্য বিজ্ঞপ্তিটি শেয়ার করা হয়েছে।',
      descriptionEn: newJob.description || 'Shared for Botany alumni.',
      sourceBn: 'অ্যালামনাই সার্কুলার সেল',
      sourceEn: 'Alumni Circular Desk',
      applyLink: newJob.applyLink || 'https://botanyalumni-jnu.org',
      isUrgent: false
    };

    setJobs((prev) => [createdJob, ...prev]);
    setIsPostModalOpen(false);
    setNewJob({
      title: '',
      organization: '',
      category: 'govt',
      location: '',
      salary: '',
      deadline: '',
      qualification: '',
      description: '',
      applyLink: ''
    });

    setToastMessage(language === 'bn' ? 'চাকরির বিজ্ঞপ্তিটি সফলভাবে যুক্ত হয়েছে!' : 'Job circular posted successfully!');
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

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#003b2c] via-[#005a42] to-[#012f23] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/5 -translate-y-1/5 opacity-10 pointer-events-none">
            <Briefcase className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-amber-300 text-xs font-bold border border-white/20">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'উদ্ভিদবিজ্ঞান অ্যালামনাই ক্যারিয়ার নেটওয়ার্ক' : 'Botany Alumni Career Network'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif-bn tracking-tight text-white drop-shadow-xs">
              {language === 'bn' ? 'চাকরি নিউজ ও ক্যারিয়ার বাতায়ন' : 'Job News & Career Portal'}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-emerald-100 font-medium leading-relaxed">
              {language === 'bn'
                ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগের প্রাক্তন ও বর্তমান শিক্ষার্থীদের জন্য সর্বশেষ সরকারি ও বেসরকারি চাকরির বিজ্ঞপ্তি, বিসিএস, বায়োটেক, সিড ইন্ডাস্ট্রি, ওষুধ শিল্প ও উচ্চশিক্ষা স্কলারশিপের এক বিশ্বস্ত বাতায়ন।'
                : 'A dedicated hub for Botany graduates and students offering the latest opportunities across Government, BCS, Biotech, Seed Industry, Pharmaceuticals, and Higher Studies Fellowships.'}
            </p>

            {/* Quick Stats */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <div className="bg-black/25 border border-white/20 px-3 py-1.5 rounded-lg font-bold text-amber-300">
                {language === 'bn' ? `মোট সক্রিয় বিজ্ঞপ্তি: ${jobs.length}টি` : `Active Circulars: ${jobs.length}`}
              </div>
              <div className="bg-black/25 border border-white/20 px-3 py-1.5 rounded-lg font-bold text-emerald-200">
                {language === 'bn' ? 'উদ্ভিদবিজ্ঞানীদের অগ্রাধিকার' : 'Priority for Botany Graduates'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4">
          
          {/* Category Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              {language === 'bn' ? 'চাকরির খাত নির্বাচন করুন:' : 'Filter by Category:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#006a4e] text-amber-300 border-[#004d38] shadow-xs scale-105'
                        : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    {language === 'bn' ? cat.labelBn : cat.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative pt-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'পদের নাম, প্রতিষ্ঠান বা যোগ্যতা দিয়ে খুঁজুন...' : 'Search by job title, organization, or qualification...'}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

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

        {/* Botanical Career Guidance Section */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <GraduationCap className="w-5 h-5 text-[#006a4e]" />
            <h3 className="text-sm sm:text-base font-bold text-gray-900 font-serif-bn">
              {language === 'bn' ? 'উদ্ভিদবিজ্ঞান স্নাতকদের কর্মক্ষেত্র ও ক্যারিয়ার সুযোগসমূহ' : 'Career Opportunities for Botany Graduates'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5">
              <h4 className="font-bold text-[#004d38] text-sm">১. সরকারি গবেষণা ও বিসিএস</h4>
              <p className="leading-relaxed text-gray-600">
                বিসিএস সাধারণ শিক্ষা ও প্রশাসন, বিএআরআই (BARI), বিআরআরআই (BRRI), বিজেআরআই (BJRI), বিসিএসআইআর ও বন অধিদপ্তরে বৈজ্ঞানিক কর্মকর্তা।
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
              <h4 className="font-bold text-blue-900 text-sm">২. ফার্মাসিউটিক্যালস ও সিড ইন্ডাস্ট্রি</h4>
              <p className="leading-relaxed text-gray-600">
                শীর্ষস্থানীয় ফার্মাসিউটিক্যালসে কিউসি (QC), আরঅ্যান্ডডি (R&D), হার্বাল প্রোডাক্ট ডেভেলপমেন্ট, এসিআই, ব্র্যাক ও লাল তীর সিডে ব্রিডার ও বায়োটেকনোলজিস্ট।
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 space-y-1.5">
              <h4 className="font-bold text-amber-950 text-sm">৩. উচ্চশিক্ষা ও আন্তর্জাতিক স্কলারশিপ</h4>
              <p className="leading-relaxed text-gray-600">
                উদ্ভিদ জিনোমিক্স, বায়োইনফরমেটিক্স, ক্লাইমেট চেঞ্জ ও টেকসই কৃষিতে জাপান (MEXT), ইউরোপ (Erasmus), যুক্তরাষ্ট্র ও কোরিয়ায় পূর্ণ অর্থায়িত উচ্চশিক্ষা।
              </p>
            </div>
          </div>
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

              <div>
                <h4 className="font-bold text-gray-900 mb-1">শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা:</h4>
                <p className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs leading-relaxed text-gray-700">
                  {language === 'bn' ? selectedJobModal.qualificationBn : selectedJobModal.qualificationEn}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">কাজের বিবরণ ও দায়িত্ব:</h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  {language === 'bn' ? selectedJobModal.descriptionBn : selectedJobModal.descriptionEn}
                </p>
              </div>

              <div className="text-[11px] text-gray-400 pt-1">
                বিজ্ঞপ্তি সূত্র: {language === 'bn' ? selectedJobModal.sourceBn : selectedJobModal.sourceEn}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedJobModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <a
                href={selectedJobModal.applyLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-5 py-2 bg-[#006a4e] hover:bg-[#004d38] text-amber-300 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <span>{language === 'bn' ? 'বিজ্ঞপ্তি লিঙ্ক ও আবেদন' : 'Apply Online'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Post Job Circular Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-emerald-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[#006a4e]">
                <PlusCircle className="w-5 h-5" />
                <h3 className="font-bold text-base font-serif-bn">
                  {language === 'bn' ? 'চাকরি বা ইন্টার্নশিপের বিজ্ঞপ্তি দিন' : 'Post a Job / Internship'}
                </h3>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'bn' ? 'পদের নাম *' : 'Job Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder={language === 'bn' ? 'উদা: রিসার্চ অ্যাসোসিয়েট / কিউসি অফিসার' : 'e.g. Research Associate'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'প্রতিষ্ঠান / কোম্পানি *' : 'Organization *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newJob.organization}
                    onChange={(e) => setNewJob({ ...newJob, organization: e.target.value })}
                    placeholder={language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Company Name'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="govt">সরকারি চাকরি</option>
                    <option value="pharma">বায়োফার্মা ও এগ্রো</option>
                    <option value="teaching">শিক্ষকতা ও বিসিএস</option>
                    <option value="fellowship">উচ্চশিক্ষা ও স্কলারশিপ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'কর্মস্থল' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder={language === 'bn' ? 'উদা: ঢাকা / গাজীপুর' : 'Location'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'বেতন / প্যাকেজ' : 'Salary'}
                  </label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder={language === 'bn' ? 'উদা: ৩০,০০০ - ৪০,০০০ বা আলোচনা সাপেক্ষে' : 'Salary / Negotiable'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'আবেদনের শেষ তারিখ' : 'Deadline'}
                  </label>
                  <input
                    type="text"
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    placeholder={language === 'bn' ? 'উদা: ৩০ নভেম্বর ২০২৬' : 'Deadline'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'আবেদনের লিঙ্ক / ইমেইল' : 'Apply Link / Email'}
                  </label>
                  <input
                    type="text"
                    value={newJob.applyLink}
                    onChange={(e) => setNewJob({ ...newJob, applyLink: e.target.value })}
                    placeholder="https://... বা hr@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === 'bn' ? 'প্রয়োজনীয় যোগ্যতা ও অভিজ্ঞতা' : 'Required Qualifications'}
                </label>
                <textarea
                  rows={2}
                  value={newJob.qualification}
                  onChange={(e) => setNewJob({ ...newJob, qualification: e.target.value })}
                  placeholder={language === 'bn' ? 'উদ্ভিদবিজ্ঞান বা লাইফ সায়েন্সে স্নাতক/স্নাতকোত্তর...' : 'Qualifications...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006a4e] hover:bg-[#004d38] text-amber-300 rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  {language === 'bn' ? 'বিজ্ঞপ্তি প্রকাশ করুন' : 'Post Circular'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
