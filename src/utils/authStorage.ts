/**
 * Player Authentication and Profile Storage
 * Persists player profile, session token, chip balance, and game statistics
 */

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  token: string;
  chips: number;
  totalGames: number;
  totalWins: number;
  gunShots: number;
  grandSlams: number;
  specialHands: number;
  createdAt: number;
  lastLoginAt: number;
}

const STORAGE_KEY_USER = 'shisanshui_current_user';
const STORAGE_KEY_ALL_ACCOUNTS = 'shisanshui_accounts';

export const AVATAR_OPTIONS = [
  '🧑‍💻', '🥷', '🧙', '👑', '🐉', '🦁', '🐯', '🐼', '🦊', '👧', '🤵', '🦸', '🐱', '🤖'
];

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.error('Failed to read user from storage', e);
  }

  // Create default guest user if none exists
  return createGuestUser('Termux牌友_' + Math.floor(1000 + Math.random() * 9000));
}

export function saveUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    
    // Also save into accounts list
    const all = getAllAccounts();
    const existingIdx = all.findIndex(a => a.id === user.id);
    if (existingIdx >= 0) {
      all[existingIdx] = user;
    } else {
      all.push(user);
    }
    localStorage.setItem(STORAGE_KEY_ALL_ACCOUNTS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

export function createGuestUser(nickname?: string): UserProfile {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const name = nickname?.trim() || `玩家_${randomSuffix}`;
  const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

  const newUser: UserProfile = {
    id: `u_${Date.now()}_${randomSuffix}`,
    username: `guest_${randomSuffix}`,
    nickname: name,
    avatar: randomAvatar,
    token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    chips: 1000,
    totalGames: 0,
    totalWins: 0,
    gunShots: 0,
    grandSlams: 0,
    specialHands: 0,
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };

  saveUser(newUser);
  return newUser;
}

export function registerOrUpdateUser(nickname: string, avatar: string, customUsername?: string): UserProfile {
  const current = getStoredUser();
  const trimmed = nickname.trim() || '十三水大侠';
  
  const updated: UserProfile = {
    ...current,
    nickname: trimmed,
    avatar: avatar || current.avatar,
    username: customUsername?.trim() || current.username,
    lastLoginAt: Date.now()
  };

  saveUser(updated);
  return updated;
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

export function switchAccount(userId: string): UserProfile | null {
  const accounts = getAllAccounts();
  const target = accounts.find(a => a.id === userId);
  if (target) {
    target.lastLoginAt = Date.now();
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(target));
    return target;
  }
  return null;
}

export function recordGameResult(deltaChips: number, isWin: boolean, gunShotsCount: number, isGrandSlam: boolean, isSpecial: boolean): UserProfile {
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
