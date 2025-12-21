// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

// Theme management with cookie persistence
export const changeTheme = (theme: string) => {
  document.querySelector('html')?.setAttribute('data-theme', theme)
  setCookie('selectedTheme', theme, 365) // Store for 1 year
}

export const getStoredTheme = (): string => {
  return getCookie('selectedTheme') || 'theme5'
}

export const applyStoredTheme = () => {
  const storedTheme = getStoredTheme()
  document.querySelector('html')?.setAttribute('data-theme', storedTheme)
}