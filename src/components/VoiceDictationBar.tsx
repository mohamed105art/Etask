import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, Volume2, Globe, Calendar, Tag, MapPin, CheckSquare } from 'lucide-react';
import { 
  createSpeechRecognitionInstance, 
  isSpeechRecognitionSupported, 
  parseVoiceTranscriptToTask, 
  ParsedVoiceTask 
} from '../services/voiceParserService';

interface VoiceDictationBarProps {
  onVoiceParsed: (parsed: ParsedVoiceTask) => void;
  workplace?: string;
}

export const VoiceDictationBar: React.FC<VoiceDictationBarProps> = ({ 
  onVoiceParsed, 
  workplace = 'المديرية الإقليمية للعدل بسطات' 
}) => {
  const isSupported = isSpeechRecognitionSupported();
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'ar-MA' | 'ar-SA' | 'fr-FR'>('ar-MA');
  const [transcript, setTranscript] = useState('');
  const [lastParsedSummary, setLastParsedSummary] = useState<ParsedVoiceTask['detectedSummary'] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setErrorMessage('متصفحك الحالي لا يدعم ميزة التعرف الصوتي المباشر. استخدم متصفح Chrome أو Edge.');
      return;
    }

    setErrorMessage(null);
    setTranscript('');
    setLastParsedSummary(null);

    try {
      const recognition = createSpeechRecognitionInstance();
      if (!recognition) return;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('تم رفض الإذن باستخدام الميكروفون. يرجى تفعيل إذن الميكروفون في إعدادات المتصفح.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('لم يتم التقاط أي صوت. يرجى المحاولة والتحدث بوضوح.');
        } else {
          setErrorMessage(`تنبيه أثناء التعرف الصوتي: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage(`تعذر تشغيل الميكروفون: ${err.message}`);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);

    // If we have transcript, parse it
    if (transcript.trim()) {
      handleProcessTranscript(transcript);
    }
  };

  const handleProcessTranscript = (text: string) => {
    if (!text.trim()) return;
    const parsed = parseVoiceTranscriptToTask(text, workplace);
    setLastParsedSummary(parsed.detectedSummary);
    onVoiceParsed(parsed);
  };

  return (
    <div className="bg-[#12131C] border border-white/10 rounded-xl p-3 space-y-2 text-xs transition-all">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer
              ${isListening 
                ? 'bg-[#E07A47] text-white animate-pulse' 
                : 'bg-[#59718A] text-white hover:bg-[#4d6379] active:scale-95'}
            `}
            title={isListening ? 'إيقاف التسجيل الصوتي والتحليل' : 'بدء الإملاء الصوتي المباشر'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>إملاء صوتي</span>
              </>
            )}
          </button>

          {isListening && (
            <div className="flex items-center gap-1.5 text-[#E07A47] font-bold text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#E07A47]" />
              <span>جار الاستماع الصوتي... تكلم بحرية</span>
            </div>
          )}
        </div>

        {/* Language selector & hint */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-[#8E91A0]">
            <Globe className="w-3.5 h-3.5 text-[#8E91A0]" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              disabled={isListening}
              className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="ar-MA" className="bg-[#1B1D2A] text-white">العربية (المغرب)</option>
              <option value="ar-SA" className="bg-[#1B1D2A] text-white">العربية الفصحى</option>
              <option value="fr-FR" className="bg-[#1B1D2A] text-white">الفرنسية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live transcript preview */}
      {transcript && (
        <div className="p-2.5 rounded-lg bg-[#1B1D2A] border border-white/10 text-white flex items-start justify-between gap-2 shadow-inner">
          <div className="flex-1">
            <span className="text-[10px] font-bold text-[#8E91A0] block mb-0.5">النص الصوتي الملتقط:</span>
            <p className="text-xs font-semibold leading-relaxed">&quot;{transcript}&quot;</p>
          </div>
          {!isListening && (
            <button
              type="button"
              onClick={() => handleProcessTranscript(transcript)}
              className="px-2.5 py-1 rounded-lg bg-[#59718A] hover:bg-[#4d6379] text-white font-bold text-[10px] shrink-0 cursor-pointer transition-colors"
            >
              تحليل
            </button>
          )}
        </div>
      )}

      {/* Extraction feedback summary badges */}
      {lastParsedSummary && (
        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[#8E91A0]">
          <span className="font-bold text-[#59718A] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D4A72C]" />
            <span>المعطيات المستخرجة:</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#1B1D2A] border border-white/10 font-semibold flex items-center gap-1 text-white">
            <Calendar className="w-3 h-3 text-[#59718A]" />
            <span>{lastParsedSummary.dateDetected}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#1B1D2A] border border-white/10 font-semibold flex items-center gap-1 text-white">
            <Tag className="w-3 h-3 text-[#8FA68F]" />
            <span>{lastParsedSummary.domainDetected}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#1B1D2A] border border-white/10 font-semibold flex items-center gap-1 text-white">
            <MapPin className="w-3 h-3 text-[#D4A72C]" />
            <span>{lastParsedSummary.facilityDetected}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#1B1D2A] border border-white/10 font-semibold text-white">
            {lastParsedSummary.priorityDetected}
          </span>
          {lastParsedSummary.subtasksDetectedCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-[#8FA68F]/20 border border-[#8FA68F]/40 text-[#8FA68F] font-bold flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              <span>{lastParsedSummary.subtasksDetectedCount} عمليات فرعية</span>
            </span>
          )}
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-2 rounded-lg bg-[#E07A47]/20 border border-[#E07A47]/40 text-[#E07A47] flex items-center gap-1.5 text-[11px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
