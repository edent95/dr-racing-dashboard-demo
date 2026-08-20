/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { RawCustomerLead } from '../types';

// Customer records must come from Firestore or an explicit user import.
// Never bundle production contact data as a frontend seed.
export const INITIAL_RAW_CUSTOMER_LEADS: RawCustomerLead[] = [];
