import type { PurchaseMethod, VehicleCondition } from '../types';

const CONDITION_NEW_TOKENS = new Set(['new', 'baru']);
const CONDITION_USED_TOKENS = new Set(['sec', 'second', 'used', '2nd']);
const PURCHASE_CASH_TOKENS = new Set(['cash']);
const PURCHASE_LOAN_TOKENS = new Set(['loan']);
const CLASSIFICATION_TOKEN_PATTERN = /(?<![a-z0-9])(new|baru|sec|second|used|2nd|cash|loan)(?![a-z0-9])/gi;

export interface VehicleModelClassification {
  cleanedModel: string;
  inferredCondition: VehicleCondition;
  inferredPurchaseMethod: PurchaseMethod;
  hasConditionConflict: boolean;
  hasPurchaseMethodConflict: boolean;
}

export function classifyVehicleModel(
  model: string,
  currentCondition: VehicleCondition = '',
  currentPurchaseMethod: PurchaseMethod = ''
): VehicleModelClassification {
  const tokens = Array.from(model.toLowerCase().matchAll(CLASSIFICATION_TOKEN_PATTERN), (match) => match[1]);
  const hasNew = tokens.some((token) => CONDITION_NEW_TOKENS.has(token));
  const hasUsed = tokens.some((token) => CONDITION_USED_TOKENS.has(token));
  const hasCash = tokens.some((token) => PURCHASE_CASH_TOKENS.has(token));
  const hasLoan = tokens.some((token) => PURCHASE_LOAN_TOKENS.has(token));
  const inferredCondition: VehicleCondition = hasNew === hasUsed ? '' : hasNew ? 'New' : 'Used';
  const inferredPurchaseMethod: PurchaseMethod = hasCash === hasLoan ? '' : hasCash ? 'Cash' : 'Loan';

  return {
    cleanedModel: model
      .replace(CLASSIFICATION_TOKEN_PATTERN, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[\s,./()\-]+|[\s,./()\-]+$/g, '')
      .trim(),
    inferredCondition,
    inferredPurchaseMethod,
    hasConditionConflict: (hasNew && hasUsed) || Boolean(currentCondition && inferredCondition && currentCondition !== inferredCondition),
    hasPurchaseMethodConflict: (hasCash && hasLoan) || Boolean(currentPurchaseMethod && inferredPurchaseMethod && currentPurchaseMethod !== inferredPurchaseMethod)
  };
}
