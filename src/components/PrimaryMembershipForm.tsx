import React, { useState } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { BATCH_SESSION_LIST } from '../data/batchSessionData';
import {
  MembershipPaymentSection,
  PaymentSubmissionData,
} from './MembershipPaymentSection';
import {
  CheckCircle2,
  Download,
  RefreshCw,
  Camera,
  Upload,
  FileCheck,
  Sparkles,
  Printer,
  PenTool,
  X,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Home,
  FileText,
} from 'lucide-react';

interface PrimaryMembershipFormProps {
  language: 'bn' | 'en';
  onClose?: () => void;
  onNavigateToPayment?: (membershipId?: string, feeType?: string) => void;
}

export const PrimaryMembershipForm: React.FC<PrimaryMembershipFormProps> = ({
  language,
  onClose,
  onNavigateToPayment,
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [paymentInfo, setPaymentInfo] = useState<PaymentSubmissionData | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State reflecting the official paper form
  const [formData, setFormData] = useState({
    membershipId: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
    membershipType: 'general' as 'general' | 'life',
    
    // 1. Name of the applicant
    nameEnglish: '',
    nameBangla: '',

    // 2. Information regarding degree earned from Department of Botany
    bscSession: '',
    bscYear: '',
    bscBatch: '',

    mscSession: '',
    mscYear: '',
    mscBatch: '',

    mphilYear: '',
    phdYear: '',
    
    degreeDocName: '',
    degreeDocData: '',

    // 3. Personal Information
    fathersName: '',
    mothersName: '',
    presentAddress: '',
    
    // Permanent Address
    permVillage: '',
    permPost: '',
    permUpazila: '',
    permDistrict: '',

    // Date of Birth (Day, Month, Year) & Email
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    email: '',

    // Phone & Blood Group
    phone: '',
    bloodGroup: '',

    // NID & Occupation
    nidNumber: '',
    occupation: '',
    otherOccupation: '',

    // Declaration & Applicant Signature
    declarationConfirmed: false,
    signatureDataUrl: '',
    signatureName: '',
    photoUrl: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [degreeDocFileName, setDegreeDocFileName] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'occupation' && value !== 'Others' ? { otherOccupation: '' } : {}),
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDegreeDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDegreeDocFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          degreeDocName: file.name,
          degreeDocData: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          signatureDataUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetForm = () => {
    setFormData({
      membershipId: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
      nameEnglish: '',
      nameBangla: '',
      bscSession: '',
      bscYear: '',
      bscBatch: '',
      mscSession: '',
      mscYear: '',
      mscBatch: '',
      mphilYear: '',
      phdYear: '',
      degreeDocName: '',
      degreeDocData: '',
      fathersName: '',
      mothersName: '',
      presentAddress: '',
      permVillage: '',
      permPost: '',
      permUpazila: '',
      permDistrict: '',
      dobDay: '',
      dobMonth: '',
      dobYear: '',
      email: '',
      phone: '',
      bloodGroup: '',
      nidNumber: '',
      occupation: '',
      otherOccupation: '',
      declarationConfirmed: false,
      signatureDataUrl: '',
      signatureName: '',
      photoUrl: '',
    });
    setPhotoPreview(null);
    setDegreeDocFileName('');
  };

  const handleFillSample = () => {
    setFormData({
      membershipId: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
      nameEnglish: 'Dr. Mohammad Rafiqul Islam',
      nameBangla: 'ড. মোহাম্মদ রফিকুল ইসলাম',
      bscSession: '1997-1998',
      bscYear: '2001',
      bscBatch: '1st Batch',
      mscSession: '2001-2002',
      mscYear: '2003',
      mscBatch: '1st Batch',
      mphilYear: '2008',
      phdYear: '2014',
      degreeDocName: 'BSc_MSc_Certificates_Rafiqul.pdf',
      degreeDocData: '',
      fathersName: 'Late Nurul Islam',
      mothersName: 'Amena Begum',
      presentAddress: 'Flat 4A, Green Garden Apartment, 14 Lake Circus, Kalabagan, Dhaka-1205',
      permVillage: 'Baitul Aman',
      permPost: 'Faridpur Sadar',
      permUpazila: 'Kotwali',
      permDistrict: 'Faridpur',
      dobDay: '15',
      dobMonth: '08',
      dobYear: '1979',
      email: 'rafiqul.botany@jnu.ac.bd',
      phone: '01712345678',
      bloodGroup: 'B+',
      nidNumber: '19792612345678901',
      occupation: 'Teacher',
      otherOccupation: '',
      declarationConfirmed: true,
      signatureDataUrl: '',
      signatureName: 'M. Rafiqul Islam',
      photoUrl: '',
    });
    setDegreeDocFileName('BSc_MSc_Certificates_Rafiqul.pdf');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Photo validation
    if (!photoPreview && !formData.photoUrl) {
      const msg = language === 'bn' 
        ? 'অনুগ্রহ করে আবেদনকারীর ছবি আপলোড করুন (ছবি বাধ্যতামূলক)।' 
        : 'Please upload applicant passport-size photo (Mandatory).';
      setValidationError(msg);
      alert(msg);
      const photoEl = document.getElementById('photo-upload-input');
      photoEl?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 2. Name in English
    if (!formData.nameEnglish.trim()) {
      const msg = language === 'bn' 
        ? 'ইংরেজি ভাষায় আবেদনকারীর পূর্ণ নাম পূরণ করা বাধ্যতামূলক।' 
        : 'Alumni full name in English is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 3. Name in Bangla
    if (!formData.nameBangla.trim()) {
      const msg = language === 'bn' 
        ? 'বাংলা ভাষায় আবেদনকারীর পূর্ণ নাম পূরণ করা বাধ্যতামূলক।' 
        : 'Alumni full name in Bangla is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 4. Degree Information (At least BSc or MSc degree info with Session, Year, and Batch)
    const hasBsc = formData.bscSession.trim() && formData.bscYear.trim() && formData.bscBatch.trim();
    const hasMsc = formData.mscSession.trim() && formData.mscYear.trim() && formData.mscBatch.trim();

    if (!hasBsc && !hasMsc) {
      const msg = language === 'bn'
        ? 'উদ্ভিদবিজ্ঞান বিভাগ থেকে অর্জিত ডিগ্রির তথ্য (BSc বা MSc এর সেশন, পাশের বছর ও ব্যাচ) পূরণ করা বাধ্যতামূলক।'
        : 'Degree information (BSc Honours or MSc session, passing year, and batch) is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 5. Father's Name
    if (!formData.fathersName.trim()) {
      const msg = language === 'bn' ? 'পিতার নাম পূরণ করা বাধ্যতামূলক।' : "Father's Name is mandatory.";
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 6. Mother's Name
    if (!formData.mothersName.trim()) {
      const msg = language === 'bn' ? 'মাতার নাম পূরণ করা বাধ্যতামূলক।' : "Mother's Name is mandatory.";
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 7. Present Address
    if (!formData.presentAddress.trim()) {
      const msg = language === 'bn' ? 'বর্তমান ঠিকানা (Present Address) পূরণ করা বাধ্যতামূলক।' : 'Present Address is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 8. Permanent Address (Village, Post, Upazila, District)
    if (!formData.permVillage.trim()) {
      const msg = language === 'bn' ? 'স্থায়ী ঠিকানা: গ্রাম (Village) পূরণ করা বাধ্যতামূলক।' : 'Permanent Address: Village is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }
    if (!formData.permPost.trim()) {
      const msg = language === 'bn' ? 'স্থায়ী ঠিকানা: ডাকঘর (Post Office) পূরণ করা বাধ্যতামূলক।' : 'Permanent Address: Post is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }
    if (!formData.permUpazila.trim()) {
      const msg = language === 'bn' ? 'স্থায়ী ঠিকানা: উপজেলা (Upazila) পূরণ করা বাধ্যতামূলক।' : 'Permanent Address: Upazila is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }
    if (!formData.permDistrict.trim()) {
      const msg = language === 'bn' ? 'স্থায়ী ঠিকানা: জেলা (District) পূরণ করা বাধ্যতামূলক।' : 'Permanent Address: District is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 9. Date of Birth (Day, Month, Year)
    if (!formData.dobDay.trim() || !formData.dobMonth.trim() || !formData.dobYear.trim()) {
      const msg = language === 'bn' 
        ? 'জন্ম তারিখ (দিন / মাস / সাল) সম্পূর্ণ পূরণ করা বাধ্যতামূলক।' 
        : 'Complete Date of Birth (DD / MM / YYYY) is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 10. Email
    if (!formData.email.trim()) {
      const msg = language === 'bn' ? 'ইমেইল অ্যাড্রেস পূরণ করা বাধ্যতামূলক।' : 'Email address is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 11. Phone Number
    if (!formData.phone.trim()) {
      const msg = language === 'bn' ? 'মোবাইল নম্বর পূরণ করা বাধ্যতামূলক।' : 'Phone number is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 12. Blood Group
    if (!formData.bloodGroup.trim()) {
      const msg = language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করা বাধ্যতামূলক।' : 'Blood Group selection is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 13. NID Number
    if (!formData.nidNumber.trim()) {
      const msg = language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) নম্বর পূরণ করা বাধ্যতামূলক।' : 'National ID (NID) number is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 14. Occupation
    if (!formData.occupation.trim()) {
      const msg = language === 'bn' ? 'পেশা (Occupation) নির্বাচন করা বাধ্যতামূলক।' : 'Occupation is mandatory.';
      setValidationError(msg);
      alert(msg);
      return;
    }
    if (formData.occupation === 'Others' && !formData.otherOccupation.trim()) {
      const msg = language === 'bn' ? 'অন্যান্য পেশার ক্ষেত্রে নির্দিষ্ট পেশা উল্লেখ করা বাধ্যতামূলক।' : 'Please specify your occupation.';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 15. Declaration Checkbox
    if (!formData.declarationConfirmed) {
      const msg = language === 'bn'
        ? 'প্রত্যয়ন স্বীকারোক্তি চেকবক্সে টিক চিহ্ন দেওয়া বাধ্যতামূলক।'
        : 'Please check the declaration checkbox: "I ensure that information mentioned above is complete and correct."';
      setValidationError(msg);
      alert(msg);
      return;
    }

    // 16. Signature (Optional per user instruction)
    // Applicant can optionally upload a signature image or type their name, but it is not mandatory.

    // All validations passed!
    setValidationError(null);
    setIsSubmitting(true);

    const membershipDocId = formData.membershipId || `member_${Date.now()}`;

    try {
      const payload = {
        membershipId: formData.membershipId,
        formNo: formData.membershipId,
        
        // 1. Names
        applicantNameEn: formData.nameEnglish,
        applicantNameBn: formData.nameBangla || formData.nameEnglish,
        fullName: formData.nameEnglish,

        // 2. Degrees
        bscSession: formData.bscSession,
        bscYear: formData.bscYear,
        bscBatch: formData.bscBatch,
        mscSession: formData.mscSession,
        mscYear: formData.mscYear,
        mscBatch: formData.mscBatch,
        mphilYear: formData.mphilYear,
        phdYear: formData.phdYear,
        degreeDocName: formData.degreeDocName,

        // Backward-compatible academic fields
        session: formData.bscSession || formData.mscSession || '',
        batch: formData.bscBatch || formData.mscBatch || '',

        // 3. Personal
        fathersName: formData.fathersName,
        mothersName: formData.mothersName,
        presentAddress: formData.presentAddress,
        permanentAddress: `${formData.permVillage ? `Village: ${formData.permVillage}, ` : ''}${formData.permPost ? `Post: ${formData.permPost}, ` : ''}${formData.permUpazila ? `Upazila: ${formData.permUpazila}, ` : ''}${formData.permDistrict ? `District: ${formData.permDistrict}` : ''}`.trim(),
        village: formData.permVillage,
        post: formData.permPost,
        upazila: formData.permUpazila,
        district: formData.permDistrict,

        dateOfBirth: `${formData.dobDay}/${formData.dobMonth}/${formData.dobYear}`,
        dobDay: formData.dobDay,
        dobMonth: formData.dobMonth,
        dobYear: formData.dobYear,
        email: formData.email,
        phone: formData.phone,
        mobile: formData.phone,
        bloodGroup: formData.bloodGroup,
        nidNumber: formData.nidNumber,
        occupation:
          formData.occupation === 'Others'
            ? formData.otherOccupation?.trim()
              ? `Others - ${formData.otherOccupation.trim()}`
              : 'Others'
            : formData.occupation || '',
        occupationCategory: formData.occupation || '',
        otherOccupation: formData.otherOccupation?.trim() || '',

        userPhotoUrl: formData.photoUrl || photoPreview || '',
        signatureDataUrl: formData.signatureDataUrl || '',
        signatureName: formData.signatureName || formData.nameEnglish,
        declarationConfirmed: formData.declarationConfirmed,

        membershipType: formData.membershipType || 'general',
        feeAmount: formData.membershipType === 'life' ? '২৫০০' : '৫০০',
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save data to Firestore with pending status
      await setDoc(doc(db, 'memberships', membershipDocId), payload);

      // Local storage backup for immediate retrieval
      try {
        const localList = JSON.parse(localStorage.getItem('alumni_submitted_memberships') || '[]');
        localList.unshift({ id: membershipDocId, ...payload });
        localStorage.setItem('alumni_submitted_memberships', JSON.stringify(localList.slice(0, 50)));
        sessionStorage.setItem('current_member_application', JSON.stringify(payload));
      } catch (e) {
        console.warn('LocalStorage backup error:', e);
      }

      // Navigate to dedicated /payment page
      if (onNavigateToPayment) {
        onNavigateToPayment(formData.membershipId, formData.membershipType);
      } else {
        const query = new URLSearchParams({
          id: formData.membershipId,
          type: formData.membershipType,
        }).toString();
        window.location.href = `/payment?${query}`;
      }
    } catch (err: any) {
      console.error('Error saving application prior to payment:', err);
      // Fallback save to localStorage and still allow moving to payment page
      try {
        const fallbackPayload = {
          membershipId: formData.membershipId,
          formNo: formData.membershipId,
          applicantNameEn: formData.nameEnglish,
          applicantNameBn: formData.nameBangla || formData.nameEnglish,
          fullName: formData.nameEnglish,
          phone: formData.phone,
          email: formData.email,
          membershipType: formData.membershipType || 'general',
          feeAmount: formData.membershipType === 'life' ? '২৫০০' : '৫০০',
          paymentStatus: 'pending',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        const localList = JSON.parse(localStorage.getItem('alumni_submitted_memberships') || '[]');
        localList.unshift({ id: membershipDocId, ...fallbackPayload });
        localStorage.setItem('alumni_submitted_memberships', JSON.stringify(localList.slice(0, 50)));
        sessionStorage.setItem('current_member_application', JSON.stringify(fallbackPayload));
      } catch {}

      if (onNavigateToPayment) {
        onNavigateToPayment(formData.membershipId, formData.membershipType);
      } else {
        const query = new URLSearchParams({
          id: formData.membershipId,
          type: formData.membershipType,
        }).toString();
        window.location.href = `/payment?${query}`;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async (payData: PaymentSubmissionData) => {
    setIsSubmitting(true);
    const membershipDocId = formData.membershipId || `member_${Date.now()}`;

    try {
      const payload = {
        membershipId: formData.membershipId,
        formNo: formData.membershipId,
        
        // 1. Names
        applicantNameEn: formData.nameEnglish,
        applicantNameBn: formData.nameBangla || formData.nameEnglish,
        fullName: formData.nameEnglish,

        // 2. Degrees
        bscSession: formData.bscSession,
        bscYear: formData.bscYear,
        bscBatch: formData.bscBatch,
        mscSession: formData.mscSession,
        mscYear: formData.mscYear,
        mscBatch: formData.mscBatch,
        mphilYear: formData.mphilYear,
        phdYear: formData.phdYear,
        degreeDocName: formData.degreeDocName,

        // Backward-compatible academic fields
        session: formData.bscSession || formData.mscSession || '',
        batch: formData.bscBatch || formData.mscBatch || '',

        // 3. Personal
        fathersName: formData.fathersName,
        mothersName: formData.mothersName,
        presentAddress: formData.presentAddress,
        permanentAddress: `${formData.permVillage ? `Village: ${formData.permVillage}, ` : ''}${formData.permPost ? `Post: ${formData.permPost}, ` : ''}${formData.permUpazila ? `Upazila: ${formData.permUpazila}, ` : ''}${formData.permDistrict ? `District: ${formData.permDistrict}` : ''}`.trim(),
        village: formData.permVillage,
        post: formData.permPost,
        upazila: formData.permUpazila,
        district: formData.permDistrict,

        dateOfBirth: `${formData.dobDay}/${formData.dobMonth}/${formData.dobYear}`,
        dobDay: formData.dobDay,
        dobMonth: formData.dobMonth,
        dobYear: formData.dobYear,
        email: formData.email,
        phone: formData.phone,
        mobile: formData.phone,
        bloodGroup: formData.bloodGroup,
        nidNumber: formData.nidNumber,
        occupation:
          formData.occupation === 'Others'
            ? formData.otherOccupation?.trim()
              ? `Others - ${formData.otherOccupation.trim()}`
              : 'Others'
            : formData.occupation || '',
        occupationCategory: formData.occupation || '',
        otherOccupation: formData.otherOccupation?.trim() || '',

        userPhotoUrl: formData.photoUrl || photoPreview || '',
        signatureDataUrl: formData.signatureDataUrl || '',
        signatureName: formData.signatureName || formData.nameEnglish,
        declarationConfirmed: formData.declarationConfirmed,

        // Payment & Membership Information
        membershipType: payData.membershipType || formData.membershipType || 'general',
        feeAmount: payData.feeAmount || (formData.membershipType === 'life' ? '২৫০০' : '৫০০'),
        paymentMethod: payData.paymentMethod,
        senderNumber: payData.senderNumber,
        paymentSenderNumber: payData.senderNumber,
        transactionId: payData.transactionId,
        paymentNote: payData.paymentNote || '',
        paymentStatus: 'pending',

        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save data to Firestore with backward-compatible aliases and payment details
      await setDoc(doc(db, 'memberships', membershipDocId), payload);

      // Local storage backup for offline/fast card generation
      try {
        const localList = JSON.parse(localStorage.getItem('alumni_submitted_memberships') || '[]');
        localList.unshift({ id: membershipDocId, ...payload });
        localStorage.setItem('alumni_submitted_memberships', JSON.stringify(localList.slice(0, 50)));
      } catch (e) {
        console.warn('LocalStorage backup error:', e);
      }

      setPaymentInfo(payData);
      setFormData((prev) => ({
        ...prev,
        membershipType: payData.membershipType || prev.membershipType,
      }));
      setSubmitted(true);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting form & payment:', err);
      // If Firestore failed, check if we can still save to localStorage so user doesn't lose application
      try {
        const fallbackPayload = {
          membershipId: formData.membershipId,
          formNo: formData.membershipId,
          applicantNameEn: formData.nameEnglish,
          applicantNameBn: formData.nameBangla || formData.nameEnglish,
          fullName: formData.nameEnglish,
          membershipType: payData.membershipType || formData.membershipType || 'general',
          feeAmount: payData.feeAmount || (formData.membershipType === 'life' ? '২৫০০' : '৫০০'),
          paymentMethod: payData.paymentMethod,
          senderNumber: payData.senderNumber,
          transactionId: payData.transactionId,
          paymentStatus: 'pending',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        const localList = JSON.parse(localStorage.getItem('alumni_submitted_memberships') || '[]');
        localList.unshift({ id: membershipDocId, ...fallbackPayload });
        localStorage.setItem('alumni_submitted_memberships', JSON.stringify(localList.slice(0, 50)));
      } catch {}

      alert('Error saving application: ' + (err?.message || 'Database permissions error. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('a4-membership-form-print');
    if (!element) {
      alert(language === 'bn' ? 'আবেদনপত্র খুঁজে পাওয়া যায়নি।' : 'Application form sheet not found.');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // 1. Ensure fonts are loaded before capturing
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => null);
      }

      // 2. Allow render paint cycle to stabilize
      await new Promise((resolve) => setTimeout(resolve, 120));

      // 3. Render high-fidelity canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          // Hide elements excluded from the official downloaded PDF
          clonedDoc.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.setProperty('display', 'none', 'important');
          });

          // Guarantee cloned form container is fully visible, opaque and centered
          const clonedElement = clonedDoc.getElementById('a4-membership-form-print');
          if (clonedElement) {
            clonedElement.style.setProperty('display', 'block', 'important');
            clonedElement.style.setProperty('visibility', 'visible', 'important');
            clonedElement.style.setProperty('opacity', '1', 'important');
            clonedElement.style.setProperty('position', 'relative', 'important');
            clonedElement.style.setProperty('left', '0', 'important');
            clonedElement.style.setProperty('top', '0', 'important');
            clonedElement.style.setProperty('transform', 'none', 'important');
            clonedElement.style.setProperty('width', '794px', 'important');
            clonedElement.style.setProperty('max-width', '794px', 'important');
            clonedElement.style.setProperty('min-width', '794px', 'important');
            clonedElement.style.setProperty('margin', '0 auto', 'important');
            clonedElement.style.setProperty('box-sizing', 'border-box', 'important');
            clonedElement.style.setProperty('background-color', '#ffffff', 'important');
          }

          // Inject explicit desktop A4 print stylesheet into cloned document
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            html, body {
              width: 794px !important;
              min-width: 794px !important;
              max-width: 794px !important;
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
              opacity: 1 !important;
              visibility: visible !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }

            #a4-membership-form-print {
              width: 794px !important;
              max-width: 794px !important;
              min-width: 794px !important;
              margin: 0 auto !important;
              padding: 20px 24px !important;
              background-color: #ffffff !important;
              border: 2px solid #006a4e !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              box-sizing: border-box !important;
              opacity: 1 !important;
              visibility: visible !important;
              display: block !important;
              position: relative !important;
              left: 0 !important;
              top: 0 !important;
            }

            #a4-membership-form-print h1 {
              font-size: 12px !important;
              line-height: 1.2 !important;
              font-family: 'Plus Jakarta Sans', sans-serif !important;
              white-space: nowrap !important;
            }

            #a4-membership-form-print h2 {
              font-size: 12px !important;
              line-height: 1.2 !important;
              white-space: normal !important;
            }

            #a4-membership-form-print p {
              font-size: 11px !important;
              white-space: normal !important;
            }

            #a4-membership-form-print .sm\\:flex-row {
              flex-direction: row !important;
            }

            #a4-membership-form-print .sm\\:items-center {
              align-items: center !important;
            }

            #a4-membership-form-print .sm\\:items-start {
              align-items: flex-start !important;
            }

            #a4-membership-form-print .sm\\:pl-5 {
              padding-left: 1.25rem !important;
            }

            #a4-membership-form-print .sm\\:pl-6 {
              padding-left: 1.5rem !important;
            }

            #a4-membership-form-print .sm\\:pl-\\[152px\\] {
              padding-left: 148px !important;
            }

            #a4-membership-form-print .sm\\:w-20 { width: 5rem !important; }
            #a4-membership-form-print .sm\\:h-24 { height: 6rem !important; }
            #a4-membership-form-print .sm\\:w-28 { width: 7rem !important; }
            #a4-membership-form-print .sm\\:w-32 { width: 8rem !important; }
            #a4-membership-form-print .sm\\:w-36 { width: 9rem !important; }
            #a4-membership-form-print .sm\\:w-44 { width: 11rem !important; }
            #a4-membership-form-print .sm\\:w-56 { width: 14rem !important; }
            #a4-membership-form-print .sm\\:gap-3 { gap: 0.75rem !important; }
            #a4-membership-form-print .sm\\:gap-4 { gap: 1rem !important; }
            #a4-membership-form-print .sm\\:gap-6 { gap: 1.5rem !important; }

            #a4-membership-form-print .flex-wrap {
              flex-wrap: nowrap !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Convert inputs, selects, textareas into clean high-contrast text boxes
          const clonedInputs = clonedDoc.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
            '#a4-membership-form-print input, #a4-membership-form-print select, #a4-membership-form-print textarea'
          );

          clonedInputs.forEach((clone) => {
            if (!clone || !clone.parentNode) return;

            // Handle Checkbox
            if (clone instanceof HTMLInputElement && clone.type === 'checkbox') {
              const checkDiv = clonedDoc.createElement('div');
              checkDiv.style.width = '16px';
              checkDiv.style.height = '16px';
              checkDiv.style.minWidth = '16px';
              checkDiv.style.minHeight = '16px';
              checkDiv.style.border = '1.5px solid #006a4e';
              checkDiv.style.borderRadius = '3px';
              checkDiv.style.display = 'inline-flex';
              checkDiv.style.alignItems = 'center';
              checkDiv.style.justifyContent = 'center';
              checkDiv.style.backgroundColor = clone.checked ? '#006a4e' : '#ffffff';
              checkDiv.style.color = '#ffffff';
              checkDiv.style.fontSize = '12px';
              checkDiv.style.fontWeight = 'bold';
              checkDiv.style.lineHeight = '1';
              checkDiv.style.flexShrink = '0';
              checkDiv.textContent = clone.checked ? '✓' : '';
              clone.parentNode.replaceChild(checkDiv, clone);
              return;
            }

            // Skip file uploads or hidden inputs
            if (clone instanceof HTMLInputElement && (clone.type === 'file' || clone.type === 'hidden')) {
              return;
            }

            // Handle Textarea
            if (clone instanceof HTMLTextAreaElement) {
              const box = clonedDoc.createElement('div');
              box.style.display = 'block';
              box.style.boxSizing = 'border-box';
              box.style.border = '1px solid #4b5563';
              box.style.borderRadius = '3px';
              box.style.backgroundColor = '#ffffff';
              box.style.color = '#111827';
              box.style.fontSize = '12px';
              box.style.fontWeight = '600';
              box.style.padding = '4px 6px';
              box.style.height = '38px';
              box.style.minHeight = '38px';
              box.style.maxHeight = '38px';
              box.style.lineHeight = '1.3';
              box.style.whiteSpace = 'pre-wrap';
              box.style.width = '100%';
              box.style.flex = '1 1 0%';
              box.textContent = clone.value || '\u00A0';
              clone.parentNode.replaceChild(box, clone);
              return;
            }

            // Handle Select
            if (clone instanceof HTMLSelectElement) {
              const selectedOpt = clone.options[clone.selectedIndex];
              const textVal = selectedOpt && clone.selectedIndex > 0 ? selectedOpt.text : clone.value;

              const box = clonedDoc.createElement('div');
              box.style.display = 'flex';
              box.style.alignItems = 'center';
              box.style.boxSizing = 'border-box';
              box.style.border = '1px solid #4b5563';
              box.style.borderRadius = '3px';
              box.style.backgroundColor = '#ffffff';
              box.style.color = '#111827';
              box.style.fontSize = '12px';
              box.style.fontWeight = '700';
              box.style.padding = '0 6px';
              box.style.height = '26px';
              box.style.minHeight = '26px';
              box.style.maxHeight = '26px';
              box.style.lineHeight = '26px';
              box.style.width = '100%';
              box.style.flex = '1 1 0%';
              box.textContent = textVal || '\u00A0';
              clone.parentNode.replaceChild(box, clone);
              return;
            }

            // Handle all text, email, tel inputs
            if (clone instanceof HTMLInputElement) {
              const box = clonedDoc.createElement('div');
              box.style.display = 'flex';
              box.style.alignItems = 'center';
              box.style.boxSizing = 'border-box';
              box.style.border = '1px solid #4b5563';
              box.style.borderRadius = '3px';
              box.style.backgroundColor = clone.name === 'membershipId' ? '#ecfdf5' : '#ffffff';
              box.style.color = '#111827';
              box.style.fontSize = '12px';
              box.style.fontWeight = clone.name === 'membershipId' || clone.name === 'phone' ? '700' : '600';
              box.style.padding = '0 6px';
              box.style.height = '26px';
              box.style.minHeight = '26px';
              box.style.maxHeight = '26px';
              box.style.lineHeight = '26px';
              box.style.overflow = 'hidden';
              box.style.whiteSpace = 'nowrap';
              box.style.textOverflow = 'ellipsis';

              // Sizing logic based on input classes
              if (clone.className.includes('w-11')) {
                box.style.width = '42px';
                box.style.minWidth = '42px';
                box.style.flex = '0 0 42px';
              } else if (clone.className.includes('w-16')) {
                box.style.width = '60px';
                box.style.minWidth = '60px';
                box.style.flex = '0 0 60px';
              } else if (clone.className.includes('w-36') || clone.className.includes('w-40') || clone.className.includes('sm:w-48') || clone.className.includes('sm:w-56')) {
                box.style.width = '190px';
                box.style.minWidth = '190px';
                box.style.flex = '0 0 190px';
              } else if (clone.className.includes('flex-1') || clone.className.includes('w-full')) {
                box.style.width = '100%';
                box.style.flex = '1 1 0%';
              }

              if (clone.className.includes('text-center')) {
                box.style.justifyContent = 'center';
                box.style.textAlign = 'center';
              } else {
                box.style.justifyContent = 'flex-start';
                box.style.textAlign = 'left';
              }

              box.textContent = clone.value || '\u00A0';
              clone.parentNode.replaceChild(box, clone);
            }
          });
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas render was empty.');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const sideMargin = 6;
      const topMargin = 6;
      const availableWidth = pdfWidth - sideMargin * 2;
      const availableHeight = pdfHeight - topMargin * 2;
      const imgHeight = (canvas.height * availableWidth) / canvas.width;

      if (imgHeight <= availableHeight) {
        const offsetY = topMargin + (availableHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'JPEG', sideMargin, offsetY, availableWidth, imgHeight);
      } else {
        const scaleFactor = availableHeight / imgHeight;
        const finalWidth = availableWidth * scaleFactor;
        const offsetX = (pdfWidth - finalWidth) / 2;
        pdf.addImage(imgData, 'JPEG', offsetX, topMargin, finalWidth, availableHeight);
      }

      const safeName = (formData.nameEnglish || 'Alumni').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeId = (formData.membershipId || 'Application').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Botany_Alumni_Application_${safeName}_${safeId}.pdf`;

      // Reliable browser download via blob
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(
        language === 'bn'
          ? 'পিডিএফ ডাউনলোড প্রস্তুত করতে সমস্যা হয়েছে। প্রিন্ট প্রিভিউ খোলা হচ্ছে, যেখান থেকে সরাসরি "Save as PDF" নির্বাচন করতে পারেন।'
          : 'Could not generate PDF download directly. Opening print window where you can select "Save as PDF".'
      );
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full bg-slate-100 py-4 sm:py-8 px-2 sm:px-4 font-sans antialiased min-h-screen">
      {/* 1. Dedicated Payment Step View */}
      {step === 'payment' && (
        <MembershipPaymentSection
          language={language}
          formData={formData}
          onBackToForm={() => {
            setStep('form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onConfirmPayment={handleConfirmPayment}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 2. Success Step View */}
      {step === 'success' && (
        <div className="no-print w-full max-w-2xl mx-auto py-4 sm:py-8 px-2 sm:px-4 font-sans text-gray-900 animate-in fade-in duration-300">
          <div className="bg-white border-2 sm:border-3 border-[#006a4e] rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004d38] to-[#006a4e] text-white p-5 sm:p-6 text-center space-y-2 border-b-4 border-amber-400">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center border-2 border-emerald-300 shadow-inner">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black font-serif-bn tracking-tight">
                {language === 'bn' ? 'আবেদন ও পেমেন্ট তথ্য সফলভাবে গৃহীত হয়েছে!' : 'Application & Payment Submitted!'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
                {language === 'bn'
                  ? 'আপনার সদস্যপদ আবেদন এবং ফি সংক্রান্ত তথ্য কেন্দ্রীয় ডাটাবেজ এবং অ্যাডমিন ড্যাশবোর্ডে সংরক্ষিত হয়েছে।'
                  : 'Your membership application and fee details have been recorded in the central database.'}
              </p>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 sm:p-4 text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="font-bold text-gray-700">
                    {language === 'bn' ? 'মেম্বারশিপ আইডি (Ref ID):' : 'Membership ID:'}
                  </span>
                  <span className="font-mono font-extrabold text-red-700 text-sm sm:text-base">
                    {formData.membershipId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {language === 'bn' ? 'আবেদনকারী:' : 'Applicant Name:'}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formData.nameEnglish} {formData.nameBangla && `(${formData.nameBangla})`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {language === 'bn' ? 'যোগাযোগ নম্বর:' : 'Phone Number:'}
                  </span>
                  <span className="font-bold font-mono text-gray-900">{formData.phone}</span>
                </div>

                <div className="flex justify-between items-center border-t border-emerald-200/80 pt-2">
                  <span className="text-gray-600">
                    {language === 'bn' ? 'সদস্যপদের ধরন:' : 'Membership Category:'}
                  </span>
                  <span className="font-bold text-gray-900 text-xs">
                    {(paymentInfo?.membershipType || formData.membershipType) === 'life'
                      ? (language === 'bn' ? 'আজীবন সদস্য (Life Member)' : 'Life Member')
                      : (language === 'bn' ? 'সাধারণ সদস্য (General Member)' : 'General Member')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {language === 'bn' ? 'মেম্বারশিপ ফি:' : 'Membership Fee:'}
                  </span>
                  <span className="font-black text-[#006a4e] font-mono text-sm">
                    ৳ {paymentInfo?.feeAmount || (formData.membershipType === 'life' ? '২৫০০' : '৫০০')}/- (পরিশোধিত)
                  </span>
                </div>

                {paymentInfo && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {language === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}
                      </span>
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {paymentInfo.paymentMethod}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {language === 'bn' ? 'প্রেরক নম্বর / অ্যাকাউন্ট:' : 'Sender Number / AC:'}
                      </span>
                      <span className="font-mono font-bold text-gray-900">{paymentInfo.senderNumber}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID:'}
                      </span>
                      <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        {paymentInfo.transactionId}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center border-t border-emerald-200/80 pt-2">
                  <span className="text-gray-600">
                    {language === 'bn' ? 'অনুমোদন স্থিতি:' : 'Verification Status:'}
                  </span>
                  <span className="font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px]">
                    {language === 'bn' ? 'বিবেচনাধীন (Pending Verification)' : 'Pending Admin Verification'}
                  </span>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-900 space-y-1">
                <p className="font-bold">
                  {language === 'bn' ? 'যাচাইকরণ প্রক্রিয়া:' : 'Verification Notice:'}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার আবেদন ও পেমেন্ট TrxID অ্যাডমিন ড্যাশবোর্ডে তালিকাভুক্ত হয়েছে। অ্যাডমিন কর্তৃপক্ষ TrxID মিলিয়ে চূড়ান্ত অনুমোদন প্রদান করবেন।'
                    : 'Your application and payment TrxID have been received by the admin dashboard for verification.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#006a4e] hover:bg-[#00523d] disabled:bg-gray-400 text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-spin' : ''}`} />
                  <span>
                    {isGeneratingPdf
                      ? (language === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...')
                      : (language === 'bn' ? 'আবেদনপত্র ডাউনলোড করুন (PDF)' : 'Download Application (PDF)')}
                  </span>
                </button>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer border border-gray-300"
                  >
                    {language === 'bn' ? 'হোম পেইজে ফিরে যান' : 'Back to Home'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Printable A4 Form Sheet Container */}
      <div
        id="a4-membership-form-print"
        className={
          step === 'payment'
            ? 'hidden'
            : step === 'success'
            ? 'fixed -left-[9999px] top-0 pointer-events-none w-[794px] min-w-[794px] max-w-[794px] bg-white p-7 text-gray-900 overflow-hidden font-sans border-2 border-[#006a4e]'
            : 'max-w-[210mm] w-full mx-auto bg-white border border-gray-400 sm:border-2 border-[#006a4e] p-2.5 sm:p-7 md:p-8 rounded-xl sm:rounded-none shadow-xl text-gray-900 relative overflow-hidden print:m-0 print:p-6 print:border-2 print:border-black print:shadow-none print:min-h-[297mm] font-sans'
        }
      >
        {/* Top Header Banner (Retained as requested with official logos & styling) */}
        <div className="w-full bg-[#006a4e] text-white p-2 sm:p-3.5 md:p-4 rounded-t-lg border-b-4 border-amber-400 flex flex-row items-center justify-between gap-1.5 sm:gap-3 md:gap-4 relative mb-3 sm:mb-5 font-sans overflow-hidden">
          {/* Alumni Logo Left */}
          <div className="flex items-center shrink-0">
            <div className="w-8 h-8 min-[380px]:w-10 min-[380px]:h-10 sm:w-13 sm:h-13 md:w-16 md:h-16 flex items-center justify-center bg-white rounded-full p-0.5 sm:p-1 shadow-md border border-emerald-400/50">
              <img
                src="/jnu_botany_alumni_logo.jpg"
                alt="Botany Alumni Association Logo"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Logo_of_Jagannath_University.svg/512px-Logo_of_Jagannath_University.svg.png';
                }}
              />
            </div>
          </div>

          {/* Center Official Title */}
          <div className="text-center flex-1 space-y-0.5 sm:space-y-1 px-0.5 sm:px-2 min-w-0">
            <h1 className="text-[7.5px] min-[360px]:text-[9px] min-[400px]:text-[10px] sm:text-[12.5px] md:text-[14.5px] lg:text-[15.5px] font-black text-amber-300 tracking-tighter sm:tracking-tight leading-tight uppercase font-['Plus_Jakarta_Sans',sans-serif] truncate">
              BOTANY ALUMNI ASSOCIATION JAGANNATH UNIVERSITY (BAAJnU)
            </h1>
            <p className="text-[7.5px] min-[360px]:text-[8.5px] min-[400px]:text-[9.5px] sm:text-[11px] md:text-xs font-semibold text-emerald-100 tracking-normal font-sans leading-tight">
              9-10 Chittaranjan Ave, Dhaka 1100.
            </p>
            <div className="pt-0.5">
              <span className="text-[7px] min-[360px]:text-[8px] min-[400px]:text-[9px] sm:text-xs font-bold text-white bg-[#004d38] px-2 sm:px-3.5 py-0.5 rounded-full border border-amber-400/60 shadow-xs inline-block tracking-wide font-sans">
                Membership Application Form
              </span>
            </div>
          </div>

          {/* Photo Box Top Right */}
          <div className="shrink-0 flex flex-col items-center font-sans">
            <label
              htmlFor="photo-upload-input"
              className={`w-11 h-14 min-[380px]:w-13 min-[380px]:h-17 sm:w-20 sm:h-24 md:w-22 md:h-26 border-2 ${
                !photoPreview && !formData.photoUrl ? 'border-amber-300 ring-2 ring-amber-400/50' : 'border-amber-300'
              } bg-[#004d38] rounded-md flex flex-col items-center justify-center text-center p-0.5 sm:p-1 cursor-pointer hover:bg-emerald-900 transition-colors relative overflow-hidden shadow-inner group`}
              title="Click to upload passport size photo"
            >
              {photoPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={photoPreview}
                    alt="Passport Photo"
                    className="w-full h-full object-cover rounded-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition-opacity font-sans">
                    Change
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5 sm:space-y-1 text-emerald-100 px-0.5">
                  <Camera className="w-3.5 h-3.5 min-[380px]:w-4 min-[380px]:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto text-amber-300 group-hover:scale-110 transition-transform" />
                  <span className="text-[7px] min-[380px]:text-[8px] sm:text-[10px] font-bold block leading-tight text-white font-sans">
                    Photo <span className="text-amber-300 font-bold">*</span>
                  </span>
                  <span className="text-[6.5px] min-[380px]:text-[7.5px] sm:text-[8px] text-amber-300 block font-sans">
                    (Upload)
                  </span>
                </div>
              )}
            </label>
            <input
              id="photo-upload-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Membership Application Form Body (Matching the exact uploaded printed form) */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4 text-xs sm:text-sm font-sans">
          {/* Top Row: Category & Membership ID */}
          <div className="flex flex-col min-[480px]:flex-row justify-between items-start min-[480px]:items-center gap-2 mb-2 bg-emerald-50/50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none border border-emerald-200/60 sm:border-none">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                {language === 'bn' ? 'সদস্যপদের ধরন:' : 'Category:'}
              </span>
              <span className="px-2.5 py-1 sm:py-0.5 rounded-md sm:rounded text-[11px] sm:text-xs font-bold font-mono bg-emerald-100 text-[#006a4e] border border-emerald-300 shadow-2xs">
                {(paymentInfo?.membershipType || formData.membershipType) === 'life'
                  ? (language === 'bn' ? 'আজীবন সদস্য (৳ ২৫০০)' : 'Life Member (৳ 2500)')
                  : (language === 'bn' ? 'সাধারণ সদস্য (৳ ৫০০)' : 'General Member (৳ 500)')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 w-full min-[480px]:w-auto justify-between min-[480px]:justify-end pt-1 min-[480px]:pt-0 border-t min-[480px]:border-t-0 border-emerald-200/40">
              <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                Membership ID:
              </span>
              <input
                type="text"
                name="membershipId"
                value={formData.membershipId}
                onChange={handleInputChange}
                readOnly={step === 'success'}
                className="w-32 sm:w-44 border border-gray-400 sm:border-gray-500 rounded px-2.5 py-1 text-xs sm:text-sm font-bold font-mono text-gray-900 bg-white sm:bg-emerald-50/50 focus:outline-none focus:border-[#006a4e]"
                placeholder="e.g. BOT-2024"
              />
            </div>
          </div>

          {/* 1. Name of the Alumni: */}
          <div className="space-y-2 border-b border-gray-200 sm:border-gray-300 pb-3">
            <div className="font-bold text-[#004d38] sm:text-gray-900 text-xs sm:text-sm bg-emerald-50/70 sm:bg-transparent px-2.5 sm:px-0 py-1.5 sm:py-0 rounded-md sm:rounded-none border-l-3 sm:border-l-0 border-[#006a4e]">
              1. Name of the Alumni:
            </div>
            
            <div className="grid grid-cols-1 gap-2.5 sm:gap-2 pl-1 sm:pl-6">
              {/* In English : */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                  In English <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                <input
                  type="text"
                  name="nameEnglish"
                  value={formData.nameEnglish}
                  onChange={handleInputChange}
                  required
                  placeholder="Alumni's full name in English"
                  className="flex-1 border border-gray-400 sm:border-gray-500 rounded-md sm:rounded px-2.5 py-1.5 sm:py-1 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e]"
                />
              </div>

              {/* In Bangla : */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="w-28 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                  In Bangla <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                <input
                  type="text"
                  name="nameBangla"
                  value={formData.nameBangla}
                  onChange={handleInputChange}
                  required
                  placeholder="বাংলায় অ্যালামনাইয়ের সম্পূর্ণ নাম"
                  className="flex-1 border border-gray-400 sm:border-gray-500 rounded-md sm:rounded px-2.5 py-1.5 sm:py-1 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e]"
                />
              </div>
            </div>
          </div>

          {/* 2. Information regarding degree earned from the Department of Botany: */}
          <div className="space-y-2.5 border-b border-gray-200 sm:border-gray-300 pb-3">
            <div className="font-bold text-[#004d38] sm:text-gray-900 text-xs sm:text-sm bg-emerald-50/70 sm:bg-transparent px-2.5 sm:px-0 py-1.5 sm:py-0 rounded-md sm:rounded-none border-l-3 sm:border-l-0 border-[#006a4e]">
              2. Information regarding degree earned from the Department of Botany:
            </div>

            <div className="space-y-3 sm:space-y-2 pl-1 sm:pl-5">
              {/* i) BSc Honours */}
              <div className="space-y-1.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1.5 text-xs sm:text-sm bg-gray-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none">
                <span className="w-28 font-semibold text-gray-800 shrink-0 block sm:inline">
                  i) BSc Honours <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                
                <div className="grid grid-cols-1 min-[420px]:grid-cols-3 sm:flex sm:flex-1 sm:items-center gap-2 sm:gap-x-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">
                      Session <span className="text-red-600 font-bold">*</span>
                    </span>
                    <input
                      type="text"
                      name="bscSession"
                      value={formData.bscSession}
                      onChange={handleInputChange}
                      placeholder="e.g. 1997-98"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full min-[420px]:w-auto sm:w-28">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">
                      Year <span className="text-red-600 font-bold">*</span>
                    </span>
                    <input
                      type="text"
                      name="bscYear"
                      value={formData.bscYear}
                      onChange={handleInputChange}
                      placeholder="YYYY"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full min-[420px]:w-auto sm:w-36">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">
                      Batch <span className="text-red-600 font-bold">*</span>
                    </span>
                    <input
                      type="text"
                      name="bscBatch"
                      value={formData.bscBatch}
                      onChange={handleInputChange}
                      placeholder="e.g. 1st Batch"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>
              </div>

              {/* ii) MSc */}
              <div className="space-y-1.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1.5 text-xs sm:text-sm bg-gray-50/70 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none">
                <span className="w-28 font-semibold text-gray-800 shrink-0 block sm:inline">
                  ii) MSc <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                
                <div className="grid grid-cols-1 min-[420px]:grid-cols-3 sm:flex sm:flex-1 sm:items-center gap-2 sm:gap-x-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">Session</span>
                    <input
                      type="text"
                      name="mscSession"
                      value={formData.mscSession}
                      onChange={handleInputChange}
                      placeholder="e.g. 2001-02"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full min-[420px]:w-auto sm:w-28">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">Year</span>
                    <input
                      type="text"
                      name="mscYear"
                      value={formData.mscYear}
                      onChange={handleInputChange}
                      placeholder="YYYY"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full min-[420px]:w-auto sm:w-36">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">Batch</span>
                    <input
                      type="text"
                      name="mscBatch"
                      value={formData.mscBatch}
                      onChange={handleInputChange}
                      placeholder="e.g. 1st Batch"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>
              </div>

              {/* iii) MPhil & iv) PhD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="flex items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                  <span className="w-24 sm:w-28 font-semibold text-gray-800 shrink-0">
                    iii) MPhil <span className="float-right mr-1">:</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 sm:w-44">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">Year</span>
                    <input
                      type="text"
                      name="mphilYear"
                      value={formData.mphilYear}
                      onChange={handleInputChange}
                      placeholder="e.g. 2008"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                  <span className="w-24 sm:w-28 font-semibold text-gray-800 shrink-0">
                    iv) PhD <span className="float-right mr-1">:</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 sm:w-44">
                    <span className="text-gray-700 text-xs shrink-0 font-medium">Year</span>
                    <input
                      type="text"
                      name="phdYear"
                      value={formData.phdYear}
                      onChange={handleInputChange}
                      placeholder="e.g. 2014"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>
              </div>

              {/* NB: Attach copy */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-gray-800 text-[11px] sm:text-xs bg-emerald-50/70 p-2.5 sm:p-2 rounded-lg sm:rounded border border-emerald-200">
                <div className="flex items-start sm:items-center gap-1.5 font-medium">
                  <span className="inline-block w-2.5 h-2.5 bg-[#006a4e] shrink-0 mt-0.5 sm:mt-0 rounded-2xs"></span>
                  <span className="leading-snug">
                    <strong>NB:</strong> Attach a copy of certificate/marksheet/testimonial of BSc/MSc degree.
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2 no-print pt-1 sm:pt-0">
                  <label
                    htmlFor="degree-doc-upload"
                    className="px-3 py-1.5 sm:py-1 bg-white hover:bg-emerald-100 text-[#006a4e] border border-[#006a4e] rounded-md sm:rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{degreeDocFileName ? 'Change File' : 'Attach File'}</span>
                  </label>
                  <input
                    id="degree-doc-upload"
                    type="file"
                    accept=".pdf,image/*,.doc,.docx"
                    onChange={handleDegreeDocUpload}
                    className="hidden"
                  />
                  {degreeDocFileName && (
                    <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 truncate max-w-[160px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{degreeDocFileName}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Personal Information: */}
          <div className="space-y-2.5 border-b border-gray-200 sm:border-gray-300 pb-3">
            <div className="font-bold text-[#004d38] sm:text-gray-900 text-xs sm:text-sm bg-emerald-50/70 sm:bg-transparent px-2.5 sm:px-0 py-1.5 sm:py-0 rounded-md sm:rounded-none border-l-3 sm:border-l-0 border-[#006a4e]">
              3. Personal Information:
            </div>

            <div className="space-y-2.5 sm:space-y-2 pl-1 sm:pl-5">
              {/* Father's Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                  Father's Name <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                <input
                  type="text"
                  name="fathersName"
                  value={formData.fathersName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter father's name"
                  className="flex-1 border border-gray-400 sm:border-gray-500 rounded-md sm:rounded px-2.5 py-1.5 sm:py-1 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                />
              </div>

              {/* Mother's Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                  Mother's Name <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                <input
                  type="text"
                  name="mothersName"
                  value={formData.mothersName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter mother's name"
                  className="flex-1 border border-gray-400 sm:border-gray-500 rounded-md sm:rounded px-2.5 py-1.5 sm:py-1 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                />
              </div>

              {/* Present Address */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                <span className="w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm pt-1">
                  Present Address <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                <textarea
                  name="presentAddress"
                  rows={2}
                  value={formData.presentAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter current mailing address"
                  className="flex-1 border border-gray-400 sm:border-gray-500 rounded-md sm:rounded px-2.5 py-1.5 sm:py-1 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:border-[#006a4e] resize-none"
                />
              </div>

              {/* Permanent Address: Village, Post, Upazila, District */}
              <div className="space-y-1.5 bg-gray-50/70 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none">
                <span className="w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm block mb-1">
                  Permanent Address <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 sm:pl-0 sm:space-y-0">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-gray-700 text-xs shrink-0 font-medium w-14 sm:w-auto">
                      Village <span className="text-red-600 font-bold">*</span> :
                    </span>
                    <input
                      type="text"
                      name="permVillage"
                      value={formData.permVillage}
                      onChange={handleInputChange}
                      required
                      placeholder="Village name"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-gray-700 text-xs shrink-0 font-medium w-14 sm:w-auto">
                      Post <span className="text-red-600 font-bold">*</span> :
                    </span>
                    <input
                      type="text"
                      name="permPost"
                      value={formData.permPost}
                      onChange={handleInputChange}
                      required
                      placeholder="Post office / Code"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-gray-700 text-xs shrink-0 font-medium w-14 sm:w-auto">
                      Upazila <span className="text-red-600 font-bold">*</span> :
                    </span>
                    <input
                      type="text"
                      name="permUpazila"
                      value={formData.permUpazila}
                      onChange={handleInputChange}
                      required
                      placeholder="Upazila / Thana"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-gray-700 text-xs shrink-0 font-medium w-14 sm:w-auto">
                      District <span className="text-red-600 font-bold">*</span> :
                    </span>
                    <input
                      type="text"
                      name="permDistrict"
                      value={formData.permDistrict}
                      onChange={handleInputChange}
                      required
                      placeholder="District"
                      className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth & Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-3 sm:gap-y-1.5 pt-0.5">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="w-32 sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                    Date of Birth <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="text"
                      name="dobDay"
                      value={formData.dobDay}
                      onChange={handleInputChange}
                      maxLength={2}
                      required
                      placeholder="DD"
                      className="w-10 sm:w-11 text-center border border-gray-400 sm:border-gray-500 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                    <span className="text-gray-400 font-bold">/</span>
                    <input
                      type="text"
                      name="dobMonth"
                      value={formData.dobMonth}
                      onChange={handleInputChange}
                      maxLength={2}
                      required
                      placeholder="MM"
                      className="w-10 sm:w-11 text-center border border-gray-400 sm:border-gray-500 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                    <span className="text-gray-400 font-bold">/</span>
                    <input
                      type="text"
                      name="dobYear"
                      value={formData.dobYear}
                      onChange={handleInputChange}
                      maxLength={4}
                      required
                      placeholder="YYYY"
                      className="w-14 sm:w-16 text-center border border-gray-400 sm:border-gray-500 rounded px-1 py-1 text-xs font-mono font-bold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm shrink-0">
                    Email <span className="text-red-600 font-bold">*</span>:
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@gmail.com"
                    className="w-full border border-gray-400 sm:border-gray-500 rounded px-2.5 py-1 text-xs sm:text-sm text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                  />
                </div>
              </div>

              {/* Phone Number & Blood Group */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-3 sm:gap-y-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-[170px]">
                  <span className="w-28 sm:w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                    Phone Number <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="01XXXXXXXXX"
                    className="w-full border border-gray-400 sm:border-gray-500 rounded px-2.5 py-1 text-xs sm:text-sm font-mono font-bold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-56 shrink-0">
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm shrink-0">
                    Blood Group <span className="text-red-600 font-bold">*</span>:
                  </span>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-400 sm:border-gray-500 rounded px-2 py-1 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* NID Number */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                  NID Number <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter National ID (NID) Number"
                  className="flex-1 border border-gray-400 sm:border-gray-500 rounded-md sm:rounded px-2.5 py-1 text-xs sm:text-sm font-mono text-gray-900 bg-white focus:outline-none focus:border-[#006a4e]"
                />
              </div>

              {/* Occupation */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="w-36 font-semibold text-gray-800 shrink-0 text-xs sm:text-sm">
                  Occupation <span className="text-red-600 font-bold ml-0.5">*</span> <span className="hidden sm:inline float-right mr-1">:</span>
                </span>
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    required
                    className={`border border-gray-400 sm:border-gray-500 rounded-md sm:rounded px-2.5 py-1.5 sm:py-1 text-xs sm:text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:border-[#006a4e] ${
                      formData.occupation === 'Others' ? 'w-full sm:w-44 shrink-0' : 'w-full flex-1'
                    }`}
                  >
                    <option value="">-- Select Occupation --</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Banker">Banker</option>
                    <option value="Civil Service">Civil Service</option>
                    <option value="Police">Police</option>
                    <option value="Student">Student</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                    <option value="Higher Studies">Higher Studies</option>
                    <option value="Scientist/ Researcher">Scientist/ Researcher</option>
                    <option value="Private Job">Private Job</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Media">Media</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Foreign">Foreign</option>
                    <option value="IT">IT</option>
                    <option value="Businessman">Businessman</option>
                    <option value="Others">Others</option>
                  </select>

                  {formData.occupation === 'Others' && (
                    <input
                      type="text"
                      name="otherOccupation"
                      value={formData.otherOccupation}
                      onChange={handleInputChange}
                      required
                      placeholder="Specify occupation (এখানে পেশা লিখুন) *"
                      autoFocus
                      className="flex-1 border border-[#006a4e] rounded px-2.5 py-1 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e] bg-emerald-50/30"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Declaration Line (Matching printed form) */}
          <div className="pt-2 pb-1 bg-emerald-50/40 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border border-emerald-200/60 sm:border-none">
            <label className="flex items-start sm:items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="declarationConfirmed"
                required
                checked={formData.declarationConfirmed}
                onChange={handleInputChange}
                className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-[#006a4e] rounded border-gray-500 focus:ring-emerald-500 cursor-pointer mt-0.5 sm:mt-0 shrink-0"
              />
              <span className="font-semibold text-gray-900 text-xs sm:text-sm leading-snug">
                I ensure that information mentioned above is complete and correct. <span className="text-red-600 font-bold ml-0.5">*</span>
              </span>
            </label>
          </div>

          {/* Signature Area (Applicant Signature aligned right) */}
          <div className="pt-4 sm:pt-8 pb-3 sm:pb-4 flex justify-end text-center text-[11px] sm:text-xs">
            <div className="flex flex-col items-center w-48 sm:w-56 bg-gray-50/50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none">
              <div className="h-10 sm:h-12 flex items-end justify-center w-full pb-1">
                {formData.signatureDataUrl ? (
                  <img
                    src={formData.signatureDataUrl}
                    alt="Signature"
                    className="max-h-10 max-w-[120px] object-contain"
                  />
                ) : formData.signatureName ? (
                  <span className="font-serif italic font-bold text-gray-900 text-xs sm:text-sm">
                    {formData.signatureName}
                  </span>
                ) : (
                  <label
                    htmlFor="sig-upload-input"
                    className="no-print text-[10px] text-[#006a4e] font-semibold underline cursor-pointer hover:text-emerald-800 flex items-center gap-1"
                    title="Click to add signature (optional)"
                  >
                    <span>+ Add Signature</span>
                    <span className="text-[10px] text-gray-500 font-normal no-underline">(ঐচ্ছিক)</span>
                  </label>
                )}
                <input
                  id="sig-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
              </div>
              <div className="w-full border-t border-dotted border-gray-700 pt-1 font-semibold text-gray-800">
                Signature of Applicant <span className="text-[10px] text-gray-500 font-normal">(ঐচ্ছিক)</span>
              </div>
            </div>
          </div>

          {/* Validation Alert if Error */}
          {validationError && (
            <div className="no-print p-3 bg-red-50 border-l-4 border-red-600 rounded-lg text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
              <span className="text-base">⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Official Verification & Payment Summary (Visible on Print and PDF) */}
          {paymentInfo && (
            <div className="mt-3 pt-2.5 border-t border-dashed border-gray-400 font-sans">
              <div className="bg-emerald-50/90 border border-emerald-300 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#006a4e]"></span>
                  <span className="font-bold text-gray-800">
                    {language === 'bn' ? 'পেমেন্ট স্ট্যাটাস:' : 'Payment Status:'}
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                    PAID (৳ {paymentInfo.feeAmount}/-)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-gray-700">
                  <span>Method: <strong>{paymentInfo.paymentMethod?.toUpperCase()}</strong></span>
                  <span>Sender: <strong>{paymentInfo.senderNumber}</strong></span>
                  <span>TrxID: <strong className="text-emerald-950 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">{paymentInfo.transactionId}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons (Excluded during print, only for form filling step) */}
          {step === 'form' && (
            <div className="no-print pt-4 sm:pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#006a4e] to-[#004d38] hover:from-[#00523d] hover:to-[#003827] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400 active:scale-98 order-1 sm:order-2"
              >
                <CreditCard className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{language === 'bn' ? 'সাবমিট করুন ও পেমেন্ট এ যান' : 'Submit & Proceed to Payment'}</span>
                <span className="text-amber-300 font-extrabold text-sm ml-1">→</span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-gray-300 order-2 sm:order-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                <span>Reset Form</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
