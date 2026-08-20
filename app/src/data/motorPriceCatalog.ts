/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { inferFinanceProfileFromVehicle, VehicleCatalogItem } from '../types';

type MotorPriceRow = readonly [
  model: string,
  brand: string,
  cashPrice: number,
  loanAmount: number,
  depositAmount: number,
  installment2Y: number,
  installment3Y: number,
  installment4Y: number,
  installment5Y: number,
  installment6Y: number,
  installment7Y: number
];

const MOTOR_PRICE_ROWS: MotorPriceRow[] = [
  ['Y15 ZR', 'Yamaha', 9600, 11800, 0, 589.61, 425.72, 343.77, 294.61, 0, 0],
  ['Y16 ZR', 'Yamaha', 11800, 13600, 0, 679.55, 490.66, 396.21, 339.55, 0, 0],
  ['Y15 ZR SE', 'Yamaha', 10200, 12500, 0, 624.58, 450.97, 364.17, 312.08, 0, 0],
  ['LC 135 FI', 'Yamaha', 9700, 11340, 0, 566.62, 410, 331, 284, 0, 0],
  ['LC 135 FI SE', 'Yamaha', 10200, 11800, 1000, 589.61, 425.72, 343.77, 294.61, 0, 0],
  ['EZ 115', 'Yamaha', 6000, 7600, 0, 379.75, 274.19, 221.41, 189.75, 0, 0],
  ['PG-ONE', 'Yamaha', 7800, 9300, 0, 464.69, 335.52, 270.94, 232.19, 0, 0],
  ['R15 M', 'Yamaha', 15500, 17300, 0, 864.42, 624.15, 504.01, 431.92, 0, 0],
  ['MT-15', 'Yamaha', 13000, 14800, 0, 739.51, 535, 432, 369.51, 0, 0],
  ['NVX STD V2', 'Yamaha', 0, 14800, 500, 740, 535, 432, 370, 0, 0],
  ['NVX ( ABS ) V3', 'Yamaha', 14000, 17000, 0, 849.43, 613.32, 495.27, 424.43, 0, 0],
  ['NVX ( ABS ) V3 PURPLE', 'Yamaha', 14500, 17000, 0, 849.43, 613.32, 495.27, 424.43, 0, 0],
  ['NVX ( SP ) V3', 'Yamaha', 18200, 20970, 0, 1047.8, 756.55, 610.93, 523.55, 0, 0],
  ['N-MAX', 'Yamaha', 13000, 15000, 0, 749.5, 541.17, 437, 374.5, 0, 0],
  ['EGO GEAR', 'Yamaha', 6500, 7900, 0, 394.74, 285.01, 230.15, 197.24, 0, 0],
  ['EGO AVANTIZ', 'Yamaha', 6600, 8200, 0, 409.73, 295.84, 238.89, 204.73, 0, 0],
  ['RS 150 (RS150R)', 'Honda', 8700, 9800, 0, 489.67, 353.56, 285.51, 244.67, 0, 0],
  ['RS-X WINNER', 'Honda', 10300, 11500, 0, 574.62, 414.89, 335.03, 287.12, 0, 0],
  ['BEAT', 'Honda', 6400, 7600, 0, 379.75, 274.19, 221.41, 189.75, 0, 0],
  ['VARIO 125', 'Honda', 7800, 9000, 0, 449.7, 324.7, 262.2, 224.7, 0, 0],
  ['CBR 150', 'Honda', 13700, 15200, 0, 759.49, 548.38, 442.83, 379.49, 0, 0],
  ['ADV 160', 'Honda', 13800, 15400, 0, 769.49, 555.6, 448.65, 384.49, 0, 0],
  ['ADV 160 SE', 'Honda', 13800, 15600, 0, 779.48, 562.81, 454.48, 389.48, 0, 0],
  ['DASH 125', 'Honda', 6900, 8200, 0, 409.73, 295.84, 238.89, 204.73, 0, 0],
  ['ALPHA (FI)', 'Honda', 5600, 7000, 0, 349.77, 252.54, 203.93, 174.77, 0, 0],
  ['VARIO 160', 'Honda', 10800, 12200, 0, 609.59, 440.15, 355.43, 304.59, 0, 0],
  ['VARIO 160 SE', 'Honda', 10800, 12400, 0, 619.59, 447.36, 361.25, 309.59, 0, 0],
  ['CBR 250 S3AP', 'Honda', 0, 29250, 750, 1402, 996, 793, 671, 590, 532],
  ['MODENAS Z15GT', 'Modenas', 8000, 10100, 0, 505, 365, 295, 253, 0, 0],
  ['MODENAS ELEGAN 250 EX', 'Modenas', 18200, 18720, 500, 0, 0, 0, 0, 0, 0],
  ['MODENAS ELIT 150S', 'Modenas', 8800, 9360, 0, 468, 338, 273, 234, 0, 0],
  ['MODENAS KRISS 125', 'Modenas', 0, 6890, 0, 0, 0, 0, 0, 0, 0],
  ['AVETA NOVA 200', 'Aveta', 9000, 11970, 0, 599, 433, 350, 300, 0, 0],
  ['AVETA VANGUARD 250', 'Aveta', 0, 18170, 500, 0, 0, 0, 0, 0, 0],
  ['AVETA NOVA 250', 'Aveta', 15000, 16460, 500, 0, 0, 0, 0, 0, 0],
  ['AVETA NOVA 160', 'Aveta', 0, 10620, 0, 531, 384, 310, 266, 0, 0],
  ['AVETA VIPER 180', 'Aveta', 0, 10800, 0, 540, 390, 315, 270, 0, 0],
  ['AVETA RANGER MEX EXPLORER', 'Aveta', 0, 9000, 0, 0, 0, 0, 0, 0, 0],
  ['QJ MOTOR AX200', 'QJ Motor', 8777, 10620, 0, 531, 384, 310, 266, 0, 0],
  ['QJ MOTOR SRK 250 R', 'QJ Motor', 10300, 10890, 0, 0, 0, 0, 0, 0, 0],
  ['QJ MOTOR SRK 250 RD', 'QJ Motor', 22500, 21870, 0, 0, 0, 0, 0, 0, 0],
  ['QJ MOTOR AX200', 'QJ Motor', 9000, 10620, 0, 0, 0, 0, 0, 0, 0],
  ['QJ MOTOR ATX 250', 'QJ Motor', 12700, 13860, 0, 0, 0, 0, 0, 0, 0],
  ['QJ MOTOR ATX 250 X', 'QJ Motor', 14500, 14860, 0, 0, 0, 0, 0, 0, 0],
  ['QJ MOTOR LTR 150', 'QJ Motor', 0, 9300, 0, 0, 0, 0, 0, 0, 0],
  ['CFMOTO 250 NK LITE', 'CFMoto', 10200, 10800, 0, 0, 0, 0, 0, 0, 0],
  ['CFMOTO 250 SR LITE', 'CFMoto', 10300, 10890, 0, 0, 0, 0, 0, 0, 0],
  ['CFMOTO PAPIO RACER', 'CFMoto', 9100, 10260, 0, 0, 0, 0, 0, 0, 0],
  ['CFMOTO PAPIO -XO', 'CFMoto', 0, 9540, 0, 0, 0, 0, 0, 0, 0],
  ['CFMOTO 450NK', 'CFMoto', 0, 26370, 500, 0, 0, 0, 0, 0, 0],
  ['VOGE FR150', 'Voge', 7999, 9590, 0, 0, 0, 0, 0, 0, 0],
  ['VOGE SR3', 'Voge', 16200, 16830, 500, 748.46, 521.65, 408.25, 340.21, 294.85, 262.45],
  ['BENDA CHINCHILLA 500', 'Benda', 28300, 27360, 0, 0, 0, 0, 0, 0, 0],
  ['BENDA NAPOLEON 250', 'Benda', 21300, 20700, 0, 0, 0, 0, 0, 0, 0],
  ['BENDA NAPOLEON 500', 'Benda', 28300, 27360, 0, 0, 0, 0, 0, 0, 0],
  ['SYM VFE185', 'SYM', 10300, 11850, 0, 0, 0, 0, 0, 0, 0],
  ['SYM NAGA 155', 'SYM', 8988, 10610, 0, 0, 0, 0, 0, 0, 0],
  ['SYM HUSKY 150', 'SYM', 10350, 13780, 0, 0, 0, 0, 0, 0, 0],
  ['SYM HUSKY 200', 'SYM', 0, 14540, 0, 727, 526, 425, 364, 0, 0],
  ['SYM HUSKY 300', 'SYM', 24100, 24160, 0, 0, 0, 0, 0, 0, 0],
  ['SYM ADXTG 400', 'SYM', 30300, 30600, 0, 0, 0, 0, 0, 0, 0],
  ['SYM CRUISYM 400', 'SYM', 28400, 28460, 0, 0, 0, 0, 0, 0, 0],
  ['BENELLI PANAREA 125', 'Benelli', 7500, 8770, 0, 0, 0, 0, 0, 0, 0],
  ['MODA MOCA', 'Moda', 4500, 5800, 0, 290, 210, 170, 145, 0, 0],
  ['MODA SPORTER S 250', 'Moda', 17888, 19080, 500, 0, 0, 0, 0, 0, 0],
  ['SM SPORT 110R', 'SM Sport', 3600, 5090, 0, 255, 184, 149, 128, 0, 0],
  ['WMOTO EZ125I', 'WMoto', 0, 5850, 0, 293, 212, 171, 147, 0, 0],
  ['WMOTO ISLAND 150', 'WMoto', 0, 8120, 0, 406, 294, 237, 203, 0, 0],
  ['MODENAS Z15GT', 'Modenas', 8000, 10100, 0, 505, 365, 295, 253, 0, 0],
  ['MODENAS ELEGAN 250 EX', 'Modenas', 18200, 18720, 500, 0, 0, 0, 0, 0, 0],
  ['MODENAS ELIT 150S', 'Modenas', 8800, 10800, 0, 0, 0, 0, 0, 0, 0],
  ['PROMO RS150R (22/23)', 'Honda', 0, 7700, 0, 385, 279, 225, 0, 0, 0],
  ['PROMO RSX (22/23)', 'Honda', 0, 8500, 0, 425, 307, 248, 0, 0, 0]
];

function createMotorPriceId(model: string, index: number) {
  const slug = model.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '') || `MODEL-${index + 1}`;
  const duplicateCount = MOTOR_PRICE_ROWS.slice(0, index).filter((row) => row[0] === model).length;

  return `VEH-${slug}${duplicateCount > 0 ? `-${duplicateCount + 1}` : ''}`;
}

export const INITIAL_MOTOR_PRICE_CATALOG: VehicleCatalogItem[] = MOTOR_PRICE_ROWS.map(([
  model,
  brand,
  sellingPrice,
  loanAmount,
  depositAmount,
  installment2Y,
  installment3Y,
  installment4Y,
  installment5Y,
  installment6Y,
  installment7Y
], index) => ({
  id: createMotorPriceId(model, index),
  model,
  brand,
  body_type: 'Motorcycle',
  selling_price: sellingPrice,
  loan_amount: loanAmount,
  deposit_amount: depositAmount,
  installment_2y: installment2Y,
  installment_3y: installment3Y,
  installment_4y: installment4Y,
  installment_5y: installment5Y,
  installment_6y: installment6Y,
  installment_7y: installment7Y,
  cost_price: 0,
  profit_amount: 0,
  profit_review_month: '',
  profit_reviewed_at: '',
  profit_reviewed_by: '',
  created_at: '2026-07-02T00:00:00.000Z',
  price_source: 'motor price.xlsx',
  finance_profile: inferFinanceProfileFromVehicle(model, brand)
}));
