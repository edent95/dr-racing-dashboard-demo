/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LoanApplication } from '../types';

// Applications must come from Firestore, public intake, or an explicit user import.
// Never bundle production customer data as a frontend seed.
export const INITIAL_LOAN_APPLICATIONS: LoanApplication[] = [];
