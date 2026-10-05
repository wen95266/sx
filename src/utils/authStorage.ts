/**
 * Player Authentication and Profile Storage
 * Strictly requires mobile phone + 6-character password registration with Telegram Bot Authorization Whitelist.
 */

export interface UserProfile {
  id: string;
  phone: string;
  password?: string;
  nickname: string;
  avatar: string;
  token: string;
  chips: number;
  isLoggedIn: boolean;
  totalGames: number;
  totalWins: number;
  gunShots: number;
  grandSlams: number;
  specialHands: number;
  createdAt: number;
  lastLoginAt: number;
}

const STORAGE_KEY_USER = 'shisanshui_current_user';
const STORAGE_KEY_ALL_ACCOUNTS = 'shisanshui_registered_accounts';
const STORAGE_KEY_AUTHORIZED_PHONES = 'shisanshui_authorized_phones';

export const AVATAR_OPTIONS = [
  '🧑‍💻', '🥷', '🧙', '👑', '🐉', '🦁', '🐯', '🐼', '🦊', '👧', '🤵', '🦸', '🐱', '🤖'
];

export const DEFAULT_AUTHORIZED_PHONES = [
  '13800138000',
  '18888888888',
  '13988888888',
  '19999999999',
  '13888888888'
];

// --- 授权手机号白名单管理 (Telegram Bot 授权) ---

export function getAuthorizedPhones(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTHORIZED_PHONES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load authorized phones', e);
  }
  return DEFAULT_AUTHORIZED_PHONES;
}

export function saveAuthorizedPhones(phones: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTHORIZED_PHONES, JSON.stringify(phones));
  } catch (e) {
    console.error('Failed to save authorized phones', e);
  }
}

export function isPhoneAuthorized(phone: string): boolean {
  const cleanPhone = phone.trim();
  const list = getAuthorizedPhones();
  return list.includes(cleanPhone);
}

export function addAuthorizedPhone(phone: string): boolean {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return false;
  const list = getAuthorizedPhones();
  if (!list.includes(cleanPhone)) {
    list.push(cleanPhone);
    saveAuthorizedPhones(list);
    return true;
  }
  return false;
}

export function removeAuthorizedPhone(phone: string): boolean {
  const cleanPhone = phone.trim();
  const list = getAuthorizedPhones();
  const filtered = list.filter((p) => p !== cleanPhone);
  if (filtered.length !== list.length) {
    saveAuthorizedPhones(filtered);
    return true;
  }
  return false;
}

// --- 玩家账号管理 ---

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.isLoggedIn) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read user from storage', e);
  }

  return {
    id: '',
    phone: '',
    nickname: '未登录玩家',
    avatar: '😎',
    token: '',
    chips: 1000,
    isLoggedIn: false,
    totalGames: 0,
    totalWins: 0,
    gunShots: 0,
    grandSlams: 0,
    specialHands: 0,
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };
}

export function saveUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    if (user.id && user.phone) {
      const all = getAllAccounts();
      const existingIdx = all.findIndex((a) => a.phone === user.phone);
      if (existingIdx >= 0) {
        all[existingIdx] = user;
      } else {
        all.push(user);
      }
      localStorage.setItem(STORAGE_KEY_ALL_ACCOUNTS, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

export function getAllAccounts(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read accounts', e);
  }
  return [];
}

/**
 * 手机号注册
 * 规则：
 * 1. 只有 Bot 授权的手机号才能注册
 * 2. 需要昵称
 * 3. 密码精确 6 位数 (不限制大小写字母/字符)
 */
export function registerWithPhone(
  phone: string,
  nickname: string,
  password: string,
  avatar?: string
): { success: boolean; message: string; user?: UserProfile } {
  const cleanPhone = phone.trim();
  const cleanNickname = nickname.trim();
  const cleanPassword = password.trim();

  if (!cleanPhone) {
    return { success: false, message: '请输入手机号！' };
  }

  // 1. 校验 Bot 授权白名单
  if (!isPhoneAuthorized(cleanPhone)) {
    return {
      success: false,
      message: '⚠️ 该手机号未获得管理员授权！请联系管理员在 Telegram Bot 中进行授权后再注册。'
    };
  }

  // 2. 校验昵称
  if (!cleanNickname) {
    return { success: false, message: '请输入玩家昵称！' };
  }

  // 3. 校验密码长度 (精确 6 位数)
  if (cleanPassword.length !== 6) {
    return { success: false, message: '密码必须为 6 位数字符（不限大小写字母/数字）！' };
  }

  // 4. 检查是否已被注册
  const accounts = getAllAccounts();
  const existing = accounts.find((a) => a.phone === cleanPhone);
  if (existing) {
    return { success: false, message: '该手机号已注册，请直接登录！' };
  }

  const chosenAvatar = avatar || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
  const newUser: UserProfile = {
    id: `u_${cleanPhone.slice(-4)}_${Date.now()}`,
    phone: cleanPhone,
    password: cleanPassword,
    nickname: cleanNickname,
    avatar: chosenAvatar,
    token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    chips: 1000,
    isLoggedIn: true,
    totalGames: 0,
    totalWins: 0,
    gunShots: 0,
    grandSlams: 0,
    specialHands: 0,
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };

  saveUser(newUser);
  return { success: true, message: '🎉 注册成功，欢迎加入十三水对战场！', user: newUser };
}

/**
 * 手机号登录
 */
export function loginWithPhone(
  phone: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } {
  const cleanPhone = phone.trim();
  const cleanPassword = password.trim();

  if (!cleanPhone) {
    return { success: false, message: '请输入手机号！' };
  }
  if (!cleanPassword) {
    return { success: false, message: '请输入 6 位密码！' };
  }

  const accounts = getAllAccounts();
  const account = accounts.find((a) => a.phone === cleanPhone);

  if (!account) {
    return { success: false, message: '未找到该手机号账号，请先注册！' };
  }

  if (account.password && account.password !== cleanPassword) {
    return { success: false, message: '密码不正确，请重新输入 6 位密码！' };
  }

  account.isLoggedIn = true;
  account.lastLoginAt = Date.now();
  saveUser(account);

  return { success: true, message: '✓ 登录成功，正在进入游戏大厅...', user: account };
}

/**
 * 退出登录
 */
export function logoutUser(): UserProfile {
  const current = getStoredUser();
  const loggedOut: UserProfile = {
    ...current,
    isLoggedIn: false
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedOut));
  return loggedOut;
}

export function recordGameResult(
  deltaChips: number,
  isWin: boolean,
  gunShotsCount: number,
  isGrandSlam: boolean,
  isSpecial: boolean
): UserProfile {
  const user = getStoredUser();
  user.chips = Math.max(0, user.chips + deltaChips);
  user.totalGames += 1;
  if (isWin) user.totalWins += 1;
  user.gunShots += gunShotsCount;
  if (isGrandSlam) user.grandSlams += 1;
  if (isSpecial) user.specialHands += 1;

  saveUser(user);
  return user;
}

export function addChips(amount: number): UserProfile {
  const user = getStoredUser();
  user.chips = Math.max(0, user.chips + amount);
  saveUser(user);
  return user;
}
