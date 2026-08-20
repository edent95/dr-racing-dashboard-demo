/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const isPlainRecord = (value: object) => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export function stripUndefinedFirestoreValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedFirestoreValues(item));
  }

  if (value && typeof value === 'object' && isPlainRecord(value)) {
    return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, item]) => {
      if (item !== undefined) {
        acc[key] = stripUndefinedFirestoreValues(item);
      }

      return acc;
    }, {});
  }

  // Firestore sentinels (for example serverTimestamp()) are class instances.
  // They must reach setDoc unchanged so the SDK can encode field transforms.
  return value;
}
