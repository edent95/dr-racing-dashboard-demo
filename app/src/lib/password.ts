/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 轻量密码方案（测试阶段）：密码以 SHA-256 哈希存储在角色账号里，
// 绝不保存明文。Firebase Auth 已配置时不会使用这条路径。
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  // 未设置密码的账号一律拒绝登录：防止 Firebase 未配置时任意密码通过。
  // 本地开发也必须先为账号设置密码。
  if (!passwordHash) {
    return false;
  }

  return (await hashPassword(password)) === passwordHash;
}
