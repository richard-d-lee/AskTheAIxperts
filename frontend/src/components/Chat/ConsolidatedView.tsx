import ReactMarkdown from 'react-markdown';
import type { ConsolidationResult } from '../../types';

interface Props {
  consolidation: ConsolidationResult;
}

export default function ConsolidatedView({ consolidation }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-blue-200 bg-white/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Expert Consensus
          </h3>
          <div className={`px-4 py-2 rounded-full font-bold ${getScoreColor(consolidation.consensusScore)}`}>
            {consolidation.consensusScore}% Agreement
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Summary
          </h4>
          <div className="prose prose-sm max-w-none text-gray-700 bg-white rounded-lg p-4">
            <ReactMarkdown>{consolidation.summary}</ReactMarkdown>
          </div>
        </div>

        {consolidation.agreements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">
              Points of Agreement
            </h4>
            <ul className="space-y-2">
              {consolidation.agreements.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start bg-green-50 rounded-lg p-3"
                >
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {consolidation.disagreements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
              Points of Disagreement
            </h4>
            <ul className="space-y-2">
              {consolidation.disagreements.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start bg-amber-50 rounded-lg p-3"
                >
                  <span className="text-amber-500 mr-2 mt-0.5">!</span>
                  <span className="text-gray-700 text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">
            Recommendation
          </h4>
          <div className="bg-blue-50 rounded-lg p-4 text-gray-700">
            {consolidation.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}
