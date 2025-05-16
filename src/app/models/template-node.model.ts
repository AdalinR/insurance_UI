export interface TemplateNode {
  id: string;
  type: NodeType;
  label: string;
  children?: string[];
  properties?: Record<string, any>;
  x?: number;
  y?: number;
  parentId?: string;
}

export enum NodeType {
  POLICY = 'policy',
  PLAN = 'plan',
  BENEFIT_TYPE = 'benefitType',
  UNIT_PRICE = 'unitPrice',
  BONUS = 'bonus',
  DURATION_LIMIT = 'durationLimit',
  DEDUCTIBLE = 'deductible',
  PAYMENT = 'payment',
  COPAYMENT = 'copayment',
  PROCEDURE_LIMIT = 'procedureLimit',
  CLAIMS_LIMIT = 'claimsLimit',
  PREMIUM_ADJUSTMENT = 'premiumAdjustment',
  PROVIDER_RATE = 'providerRate',
  POOLED_BENEFIT = 'pooledBenefit'
}

export interface Connection {
  source: string;
  target: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
];

export interface TemplateInfo {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  lastModified: Date;
}