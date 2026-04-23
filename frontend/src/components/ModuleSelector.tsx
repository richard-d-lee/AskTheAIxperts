import { Link } from 'react-router-dom';
import type { ModuleType } from '../types';

interface Module {
  id: ModuleType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const modules: Module[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical questions, symptoms, wellness, and health advice',
    icon: '🏥',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'legal',
    name: 'Legal',
    description: 'Legal questions, rights, procedures, and general guidance',
    icon: '⚖️',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'travel',
    name: 'Travel',
    description: 'Destinations, visas, safety, and travel planning',
    icon: '✈️',
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    description: 'Coverage, claims, policies, and insurance guidance',
    icon: '🛡️',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'financial',
    name: 'Financial',
    description: 'Budgeting, investing, taxes, and money management',
    icon: '💰',
    color: 'from-purple-500 to-violet-500',
  },
];

export default function ModuleSelector() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => (
        <Link
          key={module.id}
          to={`/chat/${module.id}`}
          className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
          <div className="p-6">
            <div className="text-4xl mb-4">{module.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {module.name}
            </h3>
            <p className="text-gray-600 text-sm">{module.description}</p>
          </div>
          <div className={`h-1 bg-gradient-to-r ${module.color}`}></div>
        </Link>
      ))}
    </div>
  );
}
