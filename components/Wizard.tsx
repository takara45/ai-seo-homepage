
import React from 'react';
import { AppStep } from '../types.ts';

interface WizardProps {
  currentStep: AppStep;
}

const Wizard: React.FC<WizardProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.Hearing, name: 'AIヒアリング' },
    { id: AppStep.Template, name: 'デザイン選択' },
    { id: AppStep.Editor, name: '編集 & 公開' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="Progress" className="pt-4 pb-12">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
            {/* Connecting line */}
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`h-0.5 w-full ${stepIdx < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            </div>

            <div className="relative flex flex-col items-center">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full">
                    {stepIdx < currentStepIndex ? (
                        <div className="h-full w-full rounded-full bg-indigo-600 flex items-center justify-center">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                            </svg>
                        </div>
                    ) : stepIdx === currentStepIndex ? (
                        <div className="relative h-full w-full rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="h-4 w-4 bg-white rounded-full"></span>
                            <span className="absolute -inset-1 animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                        </div>
                    ) : (
                        <div className="h-full w-full rounded-full bg-white border-2 border-gray-300" />
                    )}
                </div>
                <p className={`absolute top-12 whitespace-nowrap text-sm font-medium ${stepIdx <= currentStepIndex ? 'text-indigo-600' : 'text-gray-500'}`}>{step.name}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Wizard;