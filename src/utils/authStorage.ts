/**
 * Player Authentication, Profile Storage & Disconnection Auto-Reconnect Session
 * Strictly requires mobile phone + 6-character password registration with Telegram Bot Authorization Whitelist.
 * Auto-syncs with server authorized_phones.json on each registration attempt.
 */

import { Card, GamePhase, Player, AutoArrangeOption, LobbyRoom } from '../types/game';

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

export interface ActiveMatchSession {
  room?: LobbyRoom;
  roundNumber: number;
  phase: GamePhase;
  countdown: number;
  players: Player[];
  headCards: Card[];
  midCards: Card[];
  tailCards: Card[];
  smartOptions: AutoArrangeOption[];
  currentOptionIndex: number;
  timestamp: number;
}

const STORAGE_KEY_USER = 'shisanshui_current_user';
const STORAGE_KEY_ALL_ACCOUNTS = 'shisanshui_registered_accounts';
const STORAGE_KEY_AUTHORIZED_PHONES = 'shisanshui_authorized_phones';
const STORAGE_KEY_MATCH_SESSION = 'shisanshui_active_match_session';

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

// --- 断线重连与对局状态持久化 (Disconnection Auto-Reconnect) ---

export function saveMatchSession(session: ActiveMatchSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_MATCH_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save match session', e);
  }
}

export function getMatchSession(): ActiveMatchSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCH_SESSION);
    if (raw) {
      const parsed: ActiveMatchSession = JSON.parse(raw);
      // Valid if session is within 30 minutes
      if (parsed && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read match session', e);
  }
  return null;
}

export function clearMatchSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MATCH_SESSION);
  } catch (e) {
    console.error('Failed to clear match session', e);
  }
}

// --- 授权手机号白名单管理 (与服务器/Telegram Bot 实时同步) ---

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

/**
 * 标准化手机号：剔除空格、横杠、括号及 +86 / 0086 前缀
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  const digits = String(raw).replace(/[\s\-()]/g, '');
  return digits.replace(/^(\+?86|0086)/, '').trim();
}

/**
 * 实时从服务端拉取最新的 Telegram Bot 授权手机号白名单
 * 双保险通道：优先请求 /api/authorized-phones，失败则回退至 /authorized_phones.json
 */
export async function syncAuthorizedPhones(): Promise<string[]> {
  const endpoints = [
    `/api/authorized-phones?_t=${Date.now()}`,
    `/authorized_phones.json?_t=${Date.now()}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const current = getAuthorizedPhones();
          const normalizedIncoming = list.map(normalizePhoneNumber).filter(Boolean);
          const merged = Array.from(new Set([...current, ...normalizedIncoming]));
          saveAuthorizedPhones(merged);
          return merged;
        }
      }
    } catch (err) {
      // 尝试下一个端点
    }
  }

  return getAuthorizedPhones();
}

if (typeof window !== 'undefined') {
  syncAuthorizedPhones().catch(() => {});
}

export function isPhoneAuthorized(phone: string): boolean {
  const cleanPhone = normalizePhoneNumber(phone);
  if (!cleanPhone) return false;
  const list = getAuthorizedPhones().map(normalizePhoneNumber);
  return list.includes(cleanPhone);
}

export function addAuthorizedPhone(phone: string): boolean {
  const cleanPhone = normalizePhoneNumber(phone);
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
  const cleanPhone = normalizePhoneNumber(phone);
  const list = getAuthorizedPhones();
  const filtered = list.filter((p) => normalizePhoneNumber(p) !== cleanPhone);
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
    chips: 0,
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

      // 异步上报至服务端数据库 (保持跨设备数据一致)
      if (typeof window !== 'undefined' && user.isLoggedIn) {
        fetch('/api/auth/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user })
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

const STORAGE_KEY_CHIP_TRANSFERS = 'shisanshui_chip_transfers';

export interface ChipTransferRecord {
  id: string;
  fromPhone: string;
  fromNickname: string;
  fromAvatar: string;
  toPhone: string;
  toNickname: string;
  toAvatar: string;
  amount: number;
  note?: string;
  timestamp: number;
}

export const DEFAULT_PRESEEDED_ACCOUNTS: UserProfile[] = [
  {
    id: 'u_8000_seed',
    phone: '13800138000',
    nickname: '雀神老李',
    avatar: '🧙',
    token: 'tok_seed_1',
    chips: 12800,
    isLoggedIn: false,
    totalGames: 128,
    totalWins: 86,
    gunShots: 32,
    grandSlams: 6,
    specialHands: 12,
    createdAt: Date.now() - 86400000 * 3,
    lastLoginAt: Date.now() - 3600000
  },
  {
    id: 'u_8888_seed',
    phone: '18888888888',
    nickname: '发财顺风',
    avatar: '👑',
    token: 'tok_seed_2',
    chips: 28888,
    isLoggedIn: false,
    totalGames: 215,
    totalWins: 142,
    gunShots: 58,
    grandSlams: 15,
    specialHands: 24,
    createdAt: Date.now() - 86400000 * 7,
    lastLoginAt: Date.now() - 1800000
  },
  {
    id: 'u_8889_seed',
    phone: '13988888888',
    nickname: '九筒大侠',
    avatar: '🥷',
    token: 'tok_seed_3',
    chips: 8888,
    isLoggedIn: false,
    totalGames: 95,
    totalWins: 60,
    gunShots: 18,
    grandSlams: 3,
    specialHands: 8,
    createdAt: Date.now() - 86400000 * 2,
    lastLoginAt: Date.now() - 7200000
  },
  {
    id: 'u_9999_seed',
    phone: '19999999999',
    nickname: '十三幺常胜',
    avatar: '🐉',
    token: 'tok_seed_4',
    chips: 36800,
    isLoggedIn: false,
    totalGames: 340,
    totalWins: 230,
    gunShots: 92,
    grandSlams: 28,
    specialHands: 38,
    createdAt: Date.now() - 86400000 * 10,
    lastLoginAt: Date.now() - 900000
  },
  {
    id: 'u_8880_seed',
    phone: '13888888888',
    nickname: '赌圣阿星',
    avatar: '🤵',
    token: 'tok_seed_5',
    chips: 16800,
    isLoggedIn: false,
    totalGames: 160,
    totalWins: 110,
    gunShots: 40,
    grandSlams: 9,
    specialHands: 18,
    createdAt: Date.now() - 86400000 * 5,
    lastLoginAt: Date.now() - 5400000
  }
];

export function getAllAccounts(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let updated = false;
        for (const seed of DEFAULT_PRESEEDED_ACCOUNTS) {
          if (!parsed.some((a) => a.phone === seed.phone)) {
            parsed.push(seed);
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem(STORAGE_KEY_ALL_ACCOUNTS, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_ALL_ACCOUNTS, JSON.stringify(DEFAULT_PRESEEDED_ACCOUNTS));
    return DEFAULT_PRESEEDED_ACCOUNTS;
  } catch (e) {
    console.error('Failed to read accounts', e);
  }
  return DEFAULT_PRESEEDED_ACCOUNTS;
}

/**
 * 从服务端同步已注册玩家列表，确保在其他手机上注册的玩家也能在本地立刻识别
 */
export async function syncRegisteredAccounts(): Promise<UserProfile[]> {
  const endpoints = [
    `/api/auth/accounts?_t=${Date.now()}`,
    `/users.json?_t=${Date.now()}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const current = getAllAccounts();
          // 以服务端数据为准合并
          const map = new Map<string, UserProfile>();
          for (const acc of current) map.set(normalizePhoneNumber(acc.phone), acc);
          for (const acc of list) {
            const key = normalizePhoneNumber(acc.phone);
            const prev = map.get(key);
            map.set(key, { ...prev, ...acc, phone: key });
          }
          const merged = Array.from(map.values());
          try {
            localStorage.setItem(STORAGE_KEY_ALL_ACCOUNTS, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        }
      }
    } catch (err) {}
  }

  return getAllAccounts();
}

/**
 * 双向同步：将本地已注册的账号上传到服务端（防止以前只存在于第一台手机 localStorage 中的账号在服务端缺失）
 */
export async function syncLocalAccountsToServer(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const localAccounts = getAllAccounts();
    const currentUser = getStoredUser();
    const map = new Map<string, UserProfile>();

    for (const acc of localAccounts) {
      const p = normalizePhoneNumber(acc.phone);
      if (p) map.set(p, acc);
    }
    if (currentUser.isLoggedIn && currentUser.phone) {
      const p = normalizePhoneNumber(currentUser.phone);
      if (p) map.set(p, currentUser);
    }

    const accountsToUpload = Array.from(map.values());
    if (accountsToUpload.length === 0) return;

    for (const acc of accountsToUpload) {
      const phone = normalizePhoneNumber(acc.phone);
      if (!phone) continue;

      try {
        await fetch('/api/auth/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: acc })
        });
      } catch (e) {}
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  syncRegisteredAccounts().catch(() => {});
  syncLocalAccountsToServer().catch(() => {});
}

export async function registerWithPhone(
  phone: string,
  nickname: string,
  password: string,
  avatar?: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const cleanPhone = normalizePhoneNumber(phone);
  const cleanNickname = nickname.trim();
  const cleanPassword = password.trim();

  if (!cleanPhone) {
    return { success: false, message: '请输入正确的手机号！' };
  }
  if (!cleanNickname) {
    return { success: false, message: '请输入玩家昵称！' };
  }
  if (cleanPassword.length !== 6) {
    return { success: false, message: '密码必须为 6 位数字符（不限大小写字母/数字）！' };
  }

  const chosenAvatar = avatar || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

  // 1. 优先调用服务端全服统一注册 API (保证存入服务器，别的手机也能登录)
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        nickname: cleanNickname,
        password: cleanPassword,
        avatar: chosenAvatar
      })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success && data.user) {
      saveUser(data.user);
      syncRegisteredAccounts().catch(() => {});
      return {
        success: true,
        message: data.message || '🎉 注册成功，欢迎加入十三水对战场！',
        user: data.user
      };
    }

    if (data?.message) {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.warn('[Register] 服务端连接异常，使用本地备选流程', err);
  }

  // 2. 本地备选流程 (网络隔离或离线单机场景)
  const latestList = await syncAuthorizedPhones();
  const normalizedList = latestList.map(normalizePhoneNumber);

  if (!normalizedList.includes(cleanPhone) && !isPhoneAuthorized(cleanPhone)) {
    return {
      success: false,
      message: `⚠️ 手机号 (${cleanPhone}) 尚未获得管理员授权！请在 Telegram Bot 中发送：/auth ${cleanPhone}，或点击下方“刷新白名单”重试。`
    };
  }

  const accounts = getAllAccounts();
  const existing = accounts.find((a) => normalizePhoneNumber(a.phone) === cleanPhone);
  if (existing) {
    return { success: false, message: '该手机号已注册，请直接登录！' };
  }

  const newUser: UserProfile = {
    id: `u_${cleanPhone.slice(-4)}_${Date.now()}`,
    phone: cleanPhone,
    password: cleanPassword,
    nickname: cleanNickname,
    avatar: chosenAvatar,
    token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    chips: 0, // 新用户注册不赠送积分，初始水数为 0
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
  return { success: true, message: '🎉 注册成功，欢迎加入十三水对战场！初始水数为 0。', user: newUser };
}

export async function loginWithPhone(
  phone: string,
  password: string
): Promise<{ success: boolean; message: string; needRegister?: boolean; user?: UserProfile }> {
  const cleanPhone = normalizePhoneNumber(phone);
  const cleanPassword = password.trim();

  if (!cleanPhone) {
    return { success: false, message: '请输入正确的手机号！' };
  }
  if (!cleanPassword) {
    return { success: false, message: '请输入 6 位密码！' };
  }

  // 1. 核心关键：发起服务端跨设备登录校验
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, password: cleanPassword })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success && data.user) {
      saveUser(data.user);
      syncRegisteredAccounts().catch(() => {});
      return {
        success: true,
        message: data.message || '✓ 登录成功，正在进入游戏大厅...',
        user: data.user
      };
    }

    if (data && data.message) {
      return { success: false, needRegister: !!data.needRegister, message: data.message };
    }
  } catch (err) {
    console.warn('[Login] 无法连接服务端账号验证接口，尝试本地离线比对', err);
  }

  // 2. 尝试从服务端拉取一次最新账号列表再验证
  await syncRegisteredAccounts().catch(() => {});

  // 3. 本地离线凭证核验
  const accounts = getAllAccounts();
  const account = accounts.find((a) => normalizePhoneNumber(a.phone) === cleanPhone);

  if (!account) {
    if (isPhoneAuthorized(cleanPhone)) {
      return {
        success: false,
        needRegister: true,
        message: `该手机号 (${cleanPhone}) 已获得管理员授权，但尚未注册账号！请前往【注册】页面设定专属昵称和6位密码。`
      };
    }

    return {
      success: false,
      message: `未找到手机号 (${cleanPhone}) 的注册账号！请先在 Telegram Bot 发送 /auth ${cleanPhone} 获取授权。`
    };
  }

  if (account.password && account.password !== cleanPassword) {
    return { success: false, message: '密码错误！请输入您注册时设定的 6 位密码。' };
  }

  account.isLoggedIn = true;
  account.lastLoginAt = Date.now();
  saveUser(account);

  return { success: true, message: '✓ 登录成功，正在进入游戏大厅...', user: account };
}

export function logoutUser(): UserProfile {
  const current = getStoredUser();
  const loggedOut: UserProfile = {
    ...current,
    isLoggedIn: false
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedOut));
  clearMatchSession();
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

// --- 积分管理与手机号搜索、玩家互赠积分 (Points Management & Mutual Transfer) ---

/**
 * 通过手机号精确或模糊搜索已注册玩家
 */
export function findUserByPhone(phone: string): UserProfile | null {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return null;

  const accounts = getAllAccounts();
  const directMatch = accounts.find((a) => a.phone === cleanPhone);
  if (directMatch) return directMatch;

  // Partial match if query is at least 4 digits
  if (cleanPhone.length >= 4) {
    const partialMatch = accounts.find((a) => a.phone.includes(cleanPhone));
    if (partialMatch) return partialMatch;
  }

  return null;
}

/**
 * 搜索符合手机号前缀或包含的玩家列表
 */
export function searchUsersByPhone(query: string): UserProfile[] {
  const clean = query.trim();
  const accounts = getAllAccounts();
  if (!clean) return accounts;
  return accounts.filter((a) => a.phone.includes(clean) || a.nickname.includes(clean));
}

/**
 * 获取积分转账记录
 */
export function getTransferHistory(): ChipTransferRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHIP_TRANSFERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read transfer history', e);
  }
  return [];
}

/**
 * 保存积分转账记录
 */
export function recordChipTransfer(record: ChipTransferRecord): void {
  try {
    const history = getTransferHistory();
    history.unshift(record);
    // Keep last 50 records
    localStorage.setItem(STORAGE_KEY_CHIP_TRANSFERS, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save chip transfer', e);
  }
}

/**
 * 玩家之间相互赠送积分 (Mutual Transfer，跨设备网络同步)
 */
export async function transferChips(
  targetPhone: string,
  amount: number,
  note = '牌友互赠水数'
): Promise<{ success: boolean; message: string; fromUser?: UserProfile; toUser?: UserProfile }> {
  const fromUser = getStoredUser();

  if (!fromUser.isLoggedIn) {
    return { success: false, message: '请先登录游戏账号后再进行积分赠送！' };
  }

  const cleanTargetPhone = normalizePhoneNumber(targetPhone);
  if (!cleanTargetPhone) {
    return { success: false, message: '请输入要赠送的玩家手机号！' };
  }

  if (fromUser.phone === cleanTargetPhone) {
    return { success: false, message: '不能向自己的手机号赠送积分！' };
  }

  if (!amount || amount <= 0 || !Number.isInteger(amount)) {
    return { success: false, message: '请输入有效的正整数积分数额！' };
  }

  if (fromUser.chips < amount) {
    return {
      success: false,
      message: `积分不足！当前持有 ${fromUser.chips.toLocaleString()} 水，无法赠送 ${amount.toLocaleString()} 水。`
    };
  }

  // 1. 优先调用服务端转账接口 (跨手机跨设备实时到账)
  try {
    const res = await fetch('/api/auth/transfer-chips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromPhone: fromUser.phone,
        toPhone: cleanTargetPhone,
        amount,
        note
      })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success && data.fromUser) {
      saveUser(data.fromUser);
      // 记录本地转账历史
      const record: ChipTransferRecord = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fromPhone: fromUser.phone,
        fromNickname: fromUser.nickname,
        fromAvatar: fromUser.avatar,
        toPhone: cleanTargetPhone,
        toNickname: data.toUser?.nickname || cleanTargetPhone,
        toAvatar: data.toUser?.avatar || '😎',
        amount,
        note: note || '牌友互助',
        timestamp: Date.now()
      };
      recordChipTransfer(record);
      syncRegisteredAccounts().catch(() => {});

      return {
        success: true,
        message: data.message || `🎉 成功向 [${data.toUser?.nickname || cleanTargetPhone}] 赠送 ${amount.toLocaleString()} 积分水数！`,
        fromUser: data.fromUser,
        toUser: data.toUser
      };
    }

    if (data?.message) {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.warn('[Transfer] 服务端转账网络异常，使用本地离线转账备选', err);
  }

  // 2. 本地离线备选
  const accounts = getAllAccounts();
  const targetIndex = accounts.findIndex((a) => normalizePhoneNumber(a.phone) === cleanTargetPhone);

  if (targetIndex < 0) {
    return {
      success: false,
      message: `未找到手机号为 ${cleanTargetPhone} 的注册玩家，请核对手机号码！`
    };
  }

  const toUser = accounts[targetIndex];

  // Execute transfer
  fromUser.chips -= amount;
  toUser.chips += amount;

  // Persist updated records
  saveUser(fromUser);
  accounts[targetIndex] = toUser;
  try {
    localStorage.setItem(STORAGE_KEY_ALL_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts on transfer', e);
  }

  // Record transfer log
  const record: ChipTransferRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fromPhone: fromUser.phone,
    fromNickname: fromUser.nickname,
    fromAvatar: fromUser.avatar,
    toPhone: toUser.phone,
    toNickname: toUser.nickname,
    toAvatar: toUser.avatar,
    amount,
    note: note || '牌友互助',
    timestamp: Date.now()
  };
  recordChipTransfer(record);

  return {
    success: true,
    message: `🎉 成功向 [${toUser.nickname}] 赠送 ${amount.toLocaleString()} 积分水数！`,
    fromUser,
    toUser
  };
}

// --- 牌局战绩历史与全景复盘记录 (Match History & Replay) ---

const STORAGE_KEY_MATCH_HISTORY = 'shisanshui_match_history';

export interface ReplayPlayerDun {
  playerId: string;
  name: string;
  avatar: string;
  isMe: boolean;
  head: Card[];
  middle: Card[];
  tail: Card[];
  headTypeName: string;
  midTypeName: string;
  tailTypeName: string;
  score: number;
  isDaoPai: boolean;
}

export interface MatchHistoryRecord {
  id: string;
  roundNumber: number;
  roomName: string;
  timestamp: number;
  myScoreDelta: number;
  hasGunShot: boolean;
  isGrandSlam: boolean;
  players: ReplayPlayerDun[];
  gunShots?: { shooterName: string; targetName: string }[];
  grandSlamPlayerName?: string;
  maPaiLabel?: string;
  maPaiWinnerName?: string;
}

export function getMatchHistoryList(): MatchHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCH_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read match history', e);
  }
  return [];
}

export function saveMatchHistoryRecord(record: MatchHistoryRecord): void {
  try {
    const list = getMatchHistoryList();
    list.unshift(record);
    // Keep last 25 rounds
    localStorage.setItem(STORAGE_KEY_MATCH_HISTORY, JSON.stringify(list.slice(0, 25)));
  } catch (e) {
    console.error('Failed to save match history record', e);
  }
}

