/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Idempotent calendar task replies.
 *
 * A reply is appended in a Firestore transaction wrapped in a 15 s timeout. The
 * timeout rejects while the transaction may still commit, and the user then
 * presses Send again. Each press used to mint a new comment id, so the retry
 * added the same reply twice. Now one id is minted per reply (reused while the
 * same text is retried for the same task) and the append is skipped when a
 * comment with that id is already stored.
 */

import type { CalendarTaskComment } from '../types';
import { newId } from './id';

export type PendingCommentAttempt = { body: string; id: string };

/**
 * Returns the comment id for sending `body` on `noteId`: the id of the earlier
 * unconfirmed attempt when the same text is being retried, otherwise a new one
 * (recorded in `attempts`). Call `attempts.delete(noteId)` once it is saved.
 */
export function getCommentIdForAttempt(
  attempts: Map<string, PendingCommentAttempt>,
  noteId: string,
  body: string,
  createId: () => string = () => newId('CAL-COMMENT')
) {
  const normalizedBody = body.trim();
  const previous = attempts.get(noteId);
  if (previous && previous.body === normalizedBody) {
    return previous.id;
  }

  const id = createId();
  attempts.set(noteId, { body: normalizedBody, id });
  return id;
}

/** Appends `comment` unless a comment with the same id is already present. */
export function appendCommentOnce(
  currentComments: CalendarTaskComment[] | undefined,
  comment: CalendarTaskComment
): { comments: CalendarTaskComment[]; appended: boolean } {
  const comments = currentComments || [];
  if (comments.some((existing) => existing.id === comment.id)) {
    return { comments, appended: false };
  }
  return { comments: [...comments, comment], appended: true };
}
