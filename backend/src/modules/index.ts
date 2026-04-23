import { healthcareModule } from './healthcare.js';
import { legalModule } from './legal.js';
import { travelModule } from './travel.js';
import { insuranceModule } from './insurance.js';
import { financialModule } from './financial.js';
import type { ModuleConfig, ModuleType } from '../types/index.js';

export const modules: Record<ModuleType, ModuleConfig> = {
  healthcare: healthcareModule,
  legal: legalModule,
  travel: travelModule,
  insurance: insuranceModule,
  financial: financialModule,
};

export function getModule(moduleType: string): ModuleConfig | undefined {
  return modules[moduleType as ModuleType];
}

export function isValidModule(moduleType: string): moduleType is ModuleType {
  return moduleType in modules;
}
