import ModuleSelector from '../components/ModuleSelector';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Ask The AI Experts
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get advice from multiple AI models on healthcare, legal, travel, insurance, and financial topics.
          See where they agree and disagree.
        </p>
      </div>

      <ModuleSelector />

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Choose a Topic</h3>
            <p className="text-gray-600 text-sm">
              Select from healthcare, legal, travel, insurance, or financial advice
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Ask Your Question</h3>
            <p className="text-gray-600 text-sm">
              Your question is sent to 5 different AI models simultaneously
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Get Expert Consensus</h3>
            <p className="text-gray-600 text-sm">
              See a consolidated view with agreement scores and individual responses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
