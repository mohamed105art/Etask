import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || 'خطأ غير معروف' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[E-Tasks Fail-Safe] Error captured by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  handleResetState = () => {
    try {
      localStorage.removeItem('settat_personal_operations_system_v3');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#12131C] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1B1D2A] border border-[#E07A47]/40 rounded-[20px] p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#E07A47]/10 text-[#E07A47] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h2 className="text-base font-bold text-white">
              تم احتواء خطأ في الواجهة بنجاح
            </h2>
            
            <p className="text-xs text-[#8E91A0] leading-relaxed">
              تم تفعيل طبقة الحماية لمنع ظهور الشاشة البيضاء. يمكنك إعادة تحميل الصفحة أو مواصلة استخدام النظام.
            </p>

            {this.state.errorMessage && (
              <div className="bg-[#12131C] p-2.5 rounded-xl border border-white/5 text-[11px] text-[#E07A47] font-mono break-all text-right dir-ltr">
                {this.state.errorMessage}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 bg-[#59718A] hover:bg-[#4d6379] text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تحميل</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetState}
                className="px-3 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-[#8E91A0] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                استعادة الضبط
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
