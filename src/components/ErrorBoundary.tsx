import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-emerald-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">কিছু একটা সমস্যা হয়েছে</h1>
            <p className="text-gray-600 text-sm mb-6">
              অ্যাপ্লিকেশনটি লোড করার সময় একটি ত্রুটি ঘটেছে অথবা কানেক্টিভিটি বিচ্ছিন্ন হয়েছে। দয়া করে পেজটি রিফ্রেশ করুন।
            </p>
            {this.state.error && (
              <div className="bg-gray-50 p-3 rounded-lg text-left text-xs text-red-600 font-mono mb-6 overflow-auto max-h-32 border border-gray-200">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#006a4e] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#00523c] transition shadow-md cursor-pointer"
            >
              পেজ রিফ্রেশ করুন (Reload Page)
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
