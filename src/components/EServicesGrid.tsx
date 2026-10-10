import React from 'react';
import {
  Calculator,
  HeartHandshake,
  FileText,
  CreditCard,
  Zap,
  PieChart,
  ExternalLink,
  ShieldCheck,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { E_SERVICES } from '../data/portalData';

interface EServicesGridProps {
  language: 'bn' | 'en';
  onSelectService: (serviceName: string, link: string) => void;
}

export const EServicesGrid: React.FC<EServicesGridProps> = ({
  language,
  onSelectService,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-6 h-6" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6" />;
      case 'FileText':
        return <FileText className="w-6 h-6" />;
      case 'CreditCard':
        return <CreditCard className="w-6 h-6" />;
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      case 'PieChart':
        return <PieChart className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  return (
    <section id="eservices-section" className="bg-white border border-[#c1d3c1] rounded-lg shadow-sm p-4 sm:p-5 space-y-4 font-siliguri">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#e1eae1] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 bg-[#008e48] rounded-xs" />
          <h2 className="text-lg font-bold text-[#111111]">
            {language === 'bn' ? 'জরুরী ই-সেবাসমূহ (E-Services)' : 'Key E-Services'}
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
          {language === 'bn' ? 'অর্থ বিভাগের সমন্বিত অনলাইন সেবাসমূহ' : 'Integrated Public Services of Finance Division'}
        </span>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {E_SERVICES.map((srv) => {
          const title = language === 'bn' ? srv.titleBn : srv.titleEn;
          const desc = language === 'bn' ? srv.descBn : srv.descEn;

          return (
            <div
              key={srv.id}
              id={`eservice-card-${srv.id}`}
              onClick={() => onSelectService(title, srv.link)}
              className="bg-[#f9faf9] hover:bg-white border border-[#d2dfd2] hover:border-[#008e48] rounded-lg p-4 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#006a4e] to-[#008e48] text-white shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                  {getIcon(srv.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#115e45] group-hover:text-[#008e48] transition-colors leading-snug">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e3ebe3] flex items-center justify-between text-xs font-semibold text-[#006a4e]">
                <span>{language === 'bn' ? 'সেবা গ্রহণ করুন' : 'Access Service'}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
