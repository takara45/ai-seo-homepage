
import React from 'react';
import type { TemplateSuggestion } from '../types.ts';
import { TEMPLATES } from '../constants.ts';
import Spinner from './common/Spinner.tsx';

interface TemplateSelectorProps {
  suggestion: TemplateSuggestion | null;
  onSelect: (templateName: string) => void;
  isLoading: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ suggestion, onSelect, isLoading }) => {
  const handleCreate = () => {
    if (suggestion) {
      onSelect(suggestion.templateName);
    }
  };

  if (isLoading || !suggestion) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full">
        <Spinner />
        <p className="text-lg font-semibold mt-4 text-gray-700">AIがあなたのビジネスに最適なデザインを分析中です...</p>
        <p className="text-gray-500">最高の提案を準備していますので、少々お待ちください。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">デザインのご提案</h2>
        <p className="text-gray-600 mb-6">ヒアリング内容に基づき、AIがあなたのビジネスに最適なデザインとして「<span className="font-bold text-indigo-600">{TEMPLATES[suggestion.templateName]?.name}</span>」を推奨します。</p>
        
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl border border-indigo-200 mb-8">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{TEMPLATES[suggestion.templateName]?.name} デザイン</div>
            <p className="block mt-1 text-lg leading-tight font-medium text-black">AIからの推薦理由</p>
            <p className="mt-2 text-gray-500">{suggestion.reason}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
         <button
          onClick={handleCreate}
          className="w-full md:w-auto inline-flex items-center justify-center px-12 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          このデザインでウェブサイトを作成する
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;