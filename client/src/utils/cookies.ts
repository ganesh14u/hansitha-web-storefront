interface CookieOptions {
  expires?: number; // days
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class CookieManager {
  private defaultOptions: CookieOptions = {
    expires: 30, // 30 days default
    path: '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'lax'
  };

  /**
   * Set a cookie with the given name, value, and options
   */
  setItem(name: string, value: string, options: CookieOptions = {}): void {
    const opts = { ...this.defaultOptions, ...options };
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (opts.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (opts.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    if (opts.path) {
      cookieString += `; path=${opts.path}`;
    }

    if (opts.domain) {
      cookieString += `; domain=${opts.domain}`;
    }

    if (opts.secure) {
      cookieString += `; secure`;
    }

    if (opts.sameSite) {
      cookieString += `; samesite=${opts.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  getItem(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Remove a cookie by name
   */
  removeItem(name: string, options: Omit<CookieOptions, 'expires'> = {}): void {
    this.setItem(name, '', { ...options, expires: -1 });
  }

  /**
   * Set a JSON object as a cookie
   */
  setObject(name: string, value: any, options: CookieOptions = {}): void {
    this.setItem(name, JSON.stringify(value), options);
  }

  /**
   * Get a JSON object from a cookie
   */
  getObject<T = any>(name: string): T | null {
    const value = this.getItem(name);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse cookie ${name}:`, error);
      return null;
    }
  }

  /**
   * Check if a cookie exists
   */
  hasItem(name: string): boolean {
    return this.getItem(name) !== null;
  }

  /**
   * Clear all cookies (be careful with this!)
   */
  clear(): void {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        this.removeItem(decodeURIComponent(name));
      }
    }
  }

  /**
   * Get all cookie names
   */
  getAllCookieNames(): string[] {
    const cookies = document.cookie.split(';');
    const names: string[] = [];
    
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      if (eqPos > -1) {
        const name = decodeURIComponent(cookie.substr(0, eqPos).trim());
        if (name) names.push(name);
      }
    }
    
    return names;
  }
}

// Create a singleton instance
export const cookieManager = new CookieManager();

// Export convenience functions that match localStorage API
export const cookieStorage = {
  setItem: (key: string, value: string) => cookieManager.setItem(key, value),
  getItem: (key: string) => cookieManager.getItem(key),
  removeItem: (key: string) => cookieManager.removeItem(key),
  clear: () => cookieManager.clear(),
  // Additional methods for JSON handling
  setObject: (key: string, value: any) => cookieManager.setObject(key, value),
  getObject: <T = any>(key: string) => cookieManager.getObject<T>(key),
  hasItem: (key: string) => cookieManager.hasItem(key),
};

export default cookieStorage;