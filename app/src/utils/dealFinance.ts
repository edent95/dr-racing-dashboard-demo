import type { DealFinance } from '../types';

export const getRecognizedDealStockCost = (
  finance: Pick<DealFinance, 'recognized_stock_cost'>,
  liveStockCost: number,
  catalogCost: number
) => {
  const snapshot = Number(finance.recognized_stock_cost);
  if (Number.isFinite(snapshot) && snapshot > 0) {
    return Math.round(snapshot * 100) / 100;
  }

  const fallback = Number(liveStockCost) || Number(catalogCost) || 0;
  return Math.round(fallback * 100) / 100;
};
