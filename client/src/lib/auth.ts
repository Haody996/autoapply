const TOKEN_KEY = 'jobsclaw_token'
const USER_KEY = 'jobsclaw_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUser(): { id: string; email: string; isAdmin?: boolean } | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setUser(user: { id: string; email: string; isAdmin?: boolean }): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function isAdmin(): boolean {
  return getUser()?.isAdmin === true
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
