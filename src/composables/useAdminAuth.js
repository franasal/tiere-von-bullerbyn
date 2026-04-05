const SESSION_KEY = 'admin_unlocked_v1';
const DEV_FALLBACK_PASSWORD = 'bullerbyn-admin';

function readConfiguredPassword() {
  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD?.trim();

  if (envPassword) {
    return {
      password: envPassword,
      source: 'env',
      hasPassword: true,
      usesFallback: false
    };
  }

  if (import.meta.env.DEV) {
    return {
      password: DEV_FALLBACK_PASSWORD,
      source: 'dev-fallback',
      hasPassword: true,
      usesFallback: true
    };
  }

  return {
    password: '',
    source: 'missing',
    hasPassword: false,
    usesFallback: false
  };
}

export function getAdminSecurityInfo() {
  const config = readConfiguredPassword();

  return {
    ...config,
    sessionKey: SESSION_KEY,
    devFallbackPassword: config.usesFallback ? DEV_FALLBACK_PASSWORD : ''
  };
}

export function isAdminUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function unlockAdmin(candidatePassword) {
  const { password, hasPassword } = readConfiguredPassword();

  if (!hasPassword || candidatePassword !== password) {
    return false;
  }

  sessionStorage.setItem(SESSION_KEY, '1');
  return true;
}

export function lockAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
}
