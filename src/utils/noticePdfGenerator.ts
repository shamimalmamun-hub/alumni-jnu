import { NoticeItem } from '../data/portalData';

/**
 * Generates an official formatted HTML document for the notice and opens it in a new tab for direct viewing/printing as PDF.
 */
export function openNoticePdf(notice: NoticeItem, language: 'bn' | 'en' = 'bn') {
  const isBn = language === 'bn';
  const title = isBn ? notice.titleBn : notice.titleEn;
  const category = isBn ? notice.categoryBn : notice.categoryEn;
  const details = isBn ? notice.detailsBn : notice.detailsEn;

  // Build clean printable official notice window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert(isBn ? 'অনুগ্রহ করে নতুন ট্যাবে পপআপ ব্লক আনব্লক করুন।' : 'Please allow popups to open notice PDF in a new tab.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="${isBn ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${title} - Official Notice</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f8faf9;
      color: #1a2e22;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .action-bar {
      width: 100%;
      max-width: 800px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 12px 18px;
      background: #006a4e;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .action-btn {
      background: #fff;
      color: #006a4e;
      border: none;
      padding: 8px 16px;
      font-weight: 700;
      font-size: 14px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: inherit;
    }
    .action-btn:hover {
      background: #f0fdf4;
    }
    .page-container {
      width: 100%;
      max-width: 800px;
      background: #ffffff;
      padding: 40px 48px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
      border: 1px solid #d1e7dd;
      position: relative;
    }
    .letterhead {
      text-align: center;
      border-bottom: 2px solid #006a4e;
      padding-bottom: 18px;
      margin-bottom: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .logo-img {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 10px;
      border: 2px solid #006a4e;
    }
    .org-title {
      font-family: 'Noto Serif Bengali', serif;
      font-size: 21px;
      font-weight: 800;
      color: #004733;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }
    .dept-title {
      font-size: 14px;
      font-weight: 700;
      color: #006a4e;
      margin: 0 0 4px 0;
    }
    .contact-line {
      font-size: 12px;
      color: #4b5563;
      margin: 0;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #eef7f2;
      border: 1px solid #c2e2d0;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .meta-item strong {
      color: #004733;
    }
    .notice-badge {
      display: inline-block;
      background: #dcfce7;
      color: #006a4e;
      border: 1px solid #86efac;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .notice-heading {
      font-family: 'Noto Serif Bengali', serif;
      font-size: 18px;
      font-weight: 700;
      color: #0f2d1e;
      margin: 0 0 18px 0;
      line-height: 1.45;
      text-align: left;
    }
    .notice-body {
      font-size: 15px;
      line-height: 1.8;
      color: #1f2937;
      min-height: 220px;
      text-align: justify;
      white-space: pre-line;
      margin-bottom: 30px;
    }
    .verification-note {
      font-size: 12px;
      color: #006a4e;
      font-style: italic;
      border-top: 1px dashed #d1e7dd;
      padding-top: 10px;
      margin-bottom: 40px;
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 20px;
    }
    .sig-box {
      text-align: center;
      width: 220px;
    }
    .sig-line {
      border-top: 1px dashed #6b7280;
      margin-bottom: 8px;
    }
    .sig-title {
      font-weight: 700;
      font-size: 13px;
      color: #004733;
    }
    .sig-sub {
      font-size: 11px;
      color: #6b7280;
    }
    .footer-stamp {
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      margin-top: 30px;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
    }
    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      .action-bar {
        display: none !important;
      }
      .page-container {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-weight: 700; font-size: 15px;">
      ${isBn ? 'অফিসিয়াল অ্যালামনাই নোটিশ (PDF View)' : 'Official Alumni Notice (PDF View)'}
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="action-btn" onclick="window.print()">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        ${isBn ? 'প্রিন্ট / PDF সংরক্ষণ' : 'Print / Save PDF'}
      </button>
    </div>
  </div>

  <div class="page-container">
    <div class="letterhead">
      <img src="/jnu_botany_alumni_logo.jpg" alt="Logo" class="logo-img" onerror="this.src='/logo.jpg'">
      <h1 class="org-title">${isBn ? 'জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Jagannath University Botany Alumni Association'}</h1>
      <p class="dept-title">${isBn ? 'উদ্ভিদবিজ্ঞান বিভাগ, জগন্নাথ বিশ্ববিদ্যালয়, ঢাকা-১০০০' : 'Department of Botany, Jagannath University, Dhaka-1000'}</p>
      <p class="contact-line">${isBn ? 'ইমেইল: botanyalumni.jnu@gmail.com | ওয়েবসাইট: www.jnubotanyalumni.org' : 'Email: botanyalumni.jnu@gmail.com | Web: www.jnubotanyalumni.org'}</p>
    </div>

    <div class="meta-bar">
      <div class="meta-item">
        <strong>${isBn ? 'স্মারক নং: ' : 'Ref No: '}</strong>
        <span>${notice.refNo}</span>
      </div>
      <div class="meta-item">
        <strong>${isBn ? 'তারিখ: ' : 'Date: '}</strong>
        <span>${notice.date}</span>
      </div>
    </div>

    <div>
      <span class="notice-badge">${category}</span>
      <h2 class="notice-heading">${title}</h2>
    </div>

    <div class="notice-body">
      ${details}
      ${
        notice.imageUrl
          ? `<div style="margin-top: 24px; text-align: center;">
               <div style="font-size: 13px; font-weight: 700; color: #006a4e; margin-bottom: 8px; text-align: left;">📷 ${isBn ? 'সংযুক্ত ছবি / বিজ্ঞপ্তি পত্র:' : 'Attached Image Document:'}</div>
               <img src="${notice.imageUrl}" alt="Notice Attachment" style="max-width: 100%; max-height: 700px; border-radius: 8px; border: 1px solid #c2e2d0; box-shadow: 0 2px 10px rgba(0,0,0,0.06); object-fit: contain;" />
             </div>`
          : ''
      }
      ${
        notice.pdfUrl
          ? `<div style="margin-top: 24px; padding: 16px 20px; background: #f0fdf4; border: 1.5px dashed #16a34a; border-radius: 10px; display: flex; flex-direction: column; items-center; justify-content: center; gap: 10px; text-align: center;">
               <div style="font-weight: 700; font-size: 14px; color: #065f46;">
                 📄 ${isBn ? 'সংযুক্ত মূল অফিসিয়াল PDF নথি:' : 'Attached Official PDF Document:'} <span style="font-family: monospace; font-size: 13px; color: #0f766e;">${notice.pdfFileName || 'notice_document.pdf'}</span>
               </div>
               <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                 <a href="${notice.pdfUrl}" download="${notice.pdfFileName || 'notice.pdf'}" style="display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; background: #006a4e; color: #ffffff; font-weight: 700; text-decoration: none; border-radius: 6px; font-size: 13px; font-family: inherit; transition: background 0.2s;">
                   📥 ${isBn ? 'মূল PDF ফাইল ডাউনলোড করুন' : 'Download Original PDF'}
                 </a>
                 <a href="${notice.pdfUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; background: #ffffff; color: #006a4e; border: 1px solid #006a4e; font-weight: 700; text-decoration: none; border-radius: 6px; font-size: 13px; font-family: inherit;">
                   🔍 ${isBn ? 'নতুন উইন্ডোতে PDF দেখুন' : 'Open PDF in New Window'}
                 </a>
               </div>
             </div>`
          : ''
      }
    </div>

    <div class="verification-note">
      ${isBn 
        ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশনের সকল সম্মানিত সদস্য ও সংশ্লিষ্টদের অবগতির জন্য প্রকাশ করা হলো।'
        : 'Published for the information of all honorable members and concerned parties of the Botany Alumni Association.'}
    </div>

    <div class="signature-section">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-title">${isBn ? 'সাধারণ সম্পাদক' : 'General Secretary'}</div>
        <div class="sig-sub">${isBn ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-title">${isBn ? 'সভাপতি' : 'President'}</div>
        <div class="sig-sub">${isBn ? 'উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Botany Alumni Association'}</div>
      </div>
    </div>

    <div class="footer-stamp">
      ${isBn ? 'ডিজিটাল নোটিশ বোর্ড • জগন্নাথ বিশ্ববিদ্যালয় উদ্ভিদবিজ্ঞান বিভাগ অ্যালামনাই অ্যাসোসিয়েশন' : 'Digital Notice Board • Jagannath University Botany Alumni Association'}
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
