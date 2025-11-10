


import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { HearingData, TemplateSuggestion } from './types.ts';
import { AppStep } from './types.ts';
import { HEARING_QUESTIONS } from './constants.ts';
import { suggestTemplate, generateHtml as generateHtmlService } from './services/geminiService.ts';
import ChatInterface from './components/ChatInterface.tsx';
import TemplateSelector from './components/TemplateSelector.tsx';
import Wizard from './components/Wizard.tsx';
import Spinner from './components/common/Spinner.tsx';

// --- Site Editor Component ---
// Moved directly into App.tsx to resolve file loading conflict.

interface SiteEditorProps {
  initialHtml: string;
  isLoading: boolean;
  isPublished: boolean;
  publishedUrl: string | null;
  isPublishing: boolean;
  onPublish: (siteName: string, htmlContent: string) => Promise<void>;
  onUnpublish: () => Promise<void>;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const MainEditorComponent: React.FC<SiteEditorProps> = ({
  initialHtml,
  isLoading,
  isPublished,
  publishedUrl,
  isPublishing,
  onPublish,
  onUnpublish,
}) => {
  const [editedHtml, setEditedHtml] = useState(initialHtml);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImageElement, setEditingImageElement] = useState<HTMLImageElement | null>(null);
  const [siteName, setSiteName] = useState('');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  useEffect(() => {
    if (initialHtml && iframeRef.current) {
      setEditedHtml(initialHtml);
      iframeRef.current.srcdoc = initialHtml;
    }
  }, [initialHtml]);

  const syncHtmlFromIframe = (): string => {
    const iframeDoc = iframeRef.current?.contentWindow?.document;
    if (iframeDoc?.documentElement) {
      const newHtml = '<!DOCTYPE html>\n' + iframeDoc.documentElement.outerHTML;
      setEditedHtml(newHtml);
      return newHtml;
    }
    return editedHtml;
  };
  
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow?.document) return;
    const iframeDoc = iframe.contentWindow.document;

    const styleId = 'visual-editor-styles';
    if (iframeDoc.getElementById(styleId)) return;

    const style = iframeDoc.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      [data-editable="true"]:hover {
        outline: 2px dashed #4f46e5;
        cursor: text;
      }
      img[data-editable-img="true"]:hover {
        outline: 2px dashed #10b981;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
      }
    `;
    iframeDoc.head.appendChild(style);

    const textSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'li', 'dt', 'dd', 'th', 'td'];
    textSelectors.forEach(selector => {
      iframeDoc.querySelectorAll(selector).forEach(el => {
        const hasBlockChildren = el.querySelector('div, p, h1, h2, h3, img, svg');
        if (!hasBlockChildren && el.textContent?.trim() !== '') {
          (el as HTMLElement).contentEditable = 'true';
          el.setAttribute('data-editable', 'true');
          el.addEventListener('blur', syncHtmlFromIframe);
        }
      });
    });

    iframeDoc.querySelectorAll('img').forEach(img => {
      img.setAttribute('data-editable-img', 'true');
      img.addEventListener('click', (e) => {
        e.preventDefault();
        setEditingImageElement(img);
        fileInputRef.current?.click();
      });
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingImageElement) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newSrc = e.target?.result as string;
        editingImageElement.src = newSrc;
        syncHtmlFromIframe();
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDownload = () => {
    const currentHtml = syncHtmlFromIframe();
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateSiteName = (name: string): boolean => {
    const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return regex.test(name) && name.length > 3 && name.length < 30;
  };

  const handlePublishClick = () => {
    const currentHtml = syncHtmlFromIframe();
    if (!validateSiteName(siteName)) {
      setPublishError('サイト名は4文字以上30文字未満の半角英数字とハイフンのみ使用できます。(例: my-cool-site)');
      return;
    }
    setPublishError(null);
    onPublish(siteName, currentHtml);
  };
  
  const handleUpdateClick = () => {
    const currentHtml = syncHtmlFromIframe();
    onPublish(siteName, currentHtml);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full">
        <Spinner />
        <p className="text-lg font-semibold mt-4 text-gray-700">ウェブサイトを生成中です...</p>
        <p className="text-gray-500">最新のSEO技術を組み込んでいます。完成までもうしばらくお待ちください。</p>
      </div>
    );
  }

  const previewWidthClasses: Record<PreviewMode, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Main Content (Preview) */}
      <div className="flex-1 flex flex-col bg-gray-200">
        <div className="flex-shrink-0 bg-white shadow-md z-10 p-2 flex justify-center items-center gap-2">
            {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map(mode => (
              <button key={mode} onClick={() => setPreviewMode(mode)} className={`p-2 rounded-md transition-colors ${previewMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} aria-label={`Set preview to ${mode}`}>
                {mode === 'desktop' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                {mode === 'tablet' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
                {mode === 'mobile' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
              </button>
            ))}
        </div>
         <div className="flex-grow p-4 overflow-y-auto">
            <div className={`mx-auto transition-all duration-300 ease-in-out h-full ${previewWidthClasses[previewMode]}`}>
                <div className="shadow-lg h-full">
                    <iframe
                        ref={iframeRef}
                        onLoad={handleIframeLoad}
                        title="Website Preview"
                        className="w-full h-full bg-white"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Sidebar (Controls) */}
      <aside className="w-96 flex-shrink-0 bg-white shadow-2xl p-6 overflow-y-auto flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">編集 & 公開</h2>
          <p className="text-gray-600 mt-1">サイトを編集し、世界に公開しましょう。</p>
        </div>
        
        <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-800 p-4 rounded-r-md" role="alert">
          <p className="font-bold">かんたん編集ガイド</p>
          <p className="text-sm">プレビュー上のテキストや画像をクリックすると直接編集できます。</p>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">サイトの公開設定</h3>
          
          {isPublished && publishedUrl ? (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg space-y-2">
              <strong className="font-bold block">公開中！</strong>
              <p className="text-sm">あなたのサイトは以下のURLで公開されています。</p>
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-indigo-600 hover:underline break-all block">{publishedUrl}</a>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
              <strong className="font-bold block">サイトはまだ公開されていません。</strong>
              <p className="text-sm">サイト名を入力して公開しましょう。</p>
            </div>
          )}

          {!isPublished && (
              <div className="mt-4">
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">希望のサイト名</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">https://</span>
                      <input
                          type="text"
                          name="siteName"
                          id="siteName"
                          value={siteName}
                          onChange={(e) => {
                            setSiteName(e.target.value.toLowerCase());
                            setPublishError(null);
                          }}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none focus:ring-indigo-500 focus:border-indigo-500 text-sm border-gray-300"
                          placeholder="my-cool-site"
                          disabled={isPublishing}
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">.aishomepage.dev</span>
                  </div>
                  {publishError && <p className="mt-2 text-sm text-red-600">{publishError}</p>}
              </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-4 border-t space-y-3">
          {isPublished ? (
            <>
              <button
                onClick={handleUpdateClick}
                disabled={isPublishing}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 transition"
              >
                {isPublishing ? <Spinner/> : 'サイトを更新'}
              </button>
              <button
                onClick={onUnpublish}
                disabled={isPublishing}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 transition"
              >
                 {isPublishing ? <Spinner/> : '非公開にする'}
              </button>
            </>
          ) : (
            <button
              onClick={handlePublishClick}
              disabled={isPublishing || !siteName}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 transition"
            >
              {isPublishing ? <Spinner/> : 'サイトを公開する'}
            </button>
          )}

           <button
            onClick={handleDownload}
            disabled={isPublishing}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            コードをダウンロード
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </aside>
    </div>
  );
};


const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Hearing);
  const [hearingData, setHearingData] = useState<HearingData>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<{ role: 'model' | 'user'; text: string }[]>([]);
  const [suggestedTemplate, setSuggestedTemplate] = useState<TemplateSuggestion | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // --- Publishing State ---
  const [isPublished, setIsPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    // Check for API Key on initial load
    if (!process.env.API_KEY) {
      setError('APIキーが設定されていません。アプリケーションを正しく動作させるためにはAPIキーが必要です。');
    } else {
      setChatHistory([{ role: 'model', text: HEARING_QUESTIONS[0].question }]);
    }
  }, []);


  const handleUserInput = useCallback(async (value: string) => {
    const currentQuestion = HEARING_QUESTIONS[currentQuestionIndex];

    setChatHistory(prev => [...prev, { role: 'user', text: value }]);
    const updatedHearingData = { ...hearingData, [currentQuestion.key]: value };
    setHearingData(updatedHearingData);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < HEARING_QUESTIONS.length) {
      setCurrentQuestionIndex(nextIndex);
      setChatHistory(prev => [...prev, { role: 'model', text: HEARING_QUESTIONS[nextIndex].question }]);
    } else {
      setChatHistory(prev => [...prev, { role: 'model', text: 'ありがとうございます！入力内容に基づいて、最適なデザインを提案します。' }]);
      setIsLoading(true);
      setError(null);
      try {
        const suggestion = await suggestTemplate(updatedHearingData);
        setSuggestedTemplate(suggestion);
        setStep(AppStep.Template);
      } catch (e: any) {
        const errorMessage = `テンプレートの提案に失敗しました。詳細: ${e.message || '不明なエラー'}`;
        setError(errorMessage);
        setChatHistory(prev => [...prev, { role: 'model', text: `申し訳ありません、エラーが発生しました。もう一度試すか、管理者に連絡してください。\n${errorMessage}` }]);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentQuestionIndex, hearingData]);

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !error) {
      handleUserInput(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, handleUserInput, error]);

  const handleTemplateSelect = useCallback(async (templateName: string) => {
    const fullHearingData = { ...hearingData };
    setHearingData(fullHearingData);
    setSelectedTemplate(templateName);
    setStep(AppStep.Editor);
    setIsLoading(true);
    setError(null);
    try {
      const html = await generateHtmlService(fullHearingData, templateName);
      setGeneratedHtml(html);
    } catch (e: any) {
      const errorMessage = `ウェブサイトの生成に失敗しました。詳細: ${e.message || '不明なエラー'}`;
      setError(errorMessage);
      console.error(e);
      // Go back to template selection on failure
      setStep(AppStep.Template);
    } finally {
      setIsLoading(false);
    }
  }, [hearingData]);

  const handlePublish = useCallback(async (siteName: string, htmlContent: string) => {
    setIsPublishing(true);
    setError(null);
    console.log(`Publishing site: ${siteName} with content length: ${htmlContent.length}`);
    // Simulate API call to deployment service
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // In a real app, you would get the URL from the backend
    const url = `https://${siteName}.aishomepage.dev`;
    setPublishedUrl(url);
    setIsPublished(true);
    setIsPublishing(false);
  }, []);

  const handleUnpublish = useCallback(async () => {
    setIsPublishing(true);
    setError(null);
     // Simulate API call to deployment service
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsPublished(false);
    setPublishedUrl(null);
    setIsPublishing(false);
  }, []);


  const renderStep = () => {
    switch (step) {
      case AppStep.Hearing:
        return (
          <ChatInterface
            chatHistory={chatHistory}
            isLoading={isLoading}
          />
        );
      case AppStep.Template:
        return (
          <TemplateSelector
            suggestion={suggestedTemplate}
            onSelect={handleTemplateSelect}
            isLoading={isLoading}
          />
        );
      case AppStep.Editor:
        return (
          <MainEditorComponent
            initialHtml={generatedHtml}
            isLoading={isLoading}
            isPublished={isPublished}
            publishedUrl={publishedUrl}
            isPublishing={isPublishing}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
          />
        );
    }
  };

  const isEditorStep = step === AppStep.Editor;
  const isHearingStep = step === AppStep.Hearing;

  return (
    <div className={`font-sans text-gray-800 h-screen flex flex-col`}>
      {isEditorStep ? (
          <main className="flex-grow h-full">{renderStep()}</main>
      ) : (
        <div className="container mx-auto flex flex-col flex-grow py-4 md:py-8 overflow-hidden">
            <div className="flex flex-col flex-grow overflow-hidden">
                <main className="bg-white rounded-2xl shadow-2xl flex flex-col flex-grow overflow-hidden">
                    <div className="flex-shrink-0 p-6 md:p-8">
                        <Wizard currentStep={step} />
                    </div>
                    <div className="flex-grow overflow-y-auto px-6 md:px-8">
                        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert"><p className="font-bold">エラーが発生しました</p><p>{error}</p></div>}
                        {renderStep()}
                    </div>
                </main>
                
                {isHearingStep && (
                    <div className="flex-shrink-0 pt-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                placeholder={error ? "エラーが解決されるまで入力は無効です" : "メッセージを入力..."}
                                className="w-full pl-5 pr-32 py-4 text-base text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                disabled={isLoading || !!error}
                            />
                            <button 
                                onClick={handleSend} 
                                disabled={isLoading || !inputValue.trim() || !!error} 
                                className="absolute inset-y-2 right-2 px-6 py-2 font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300 transition-colors shadow-md"
                            >
                                送信
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <footer className="text-center pt-4 text-gray-400 text-sm flex-shrink-0">
              <p>&copy; 2024 AI SEO Homepage Builder. All Rights Reserved.</p>
            </footer>
        </div>
      )}
    </div>
  );
};

export default App;