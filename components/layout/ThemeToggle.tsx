'use client'

import { useState, useEffect } from 'react'
import { GIcon } from '@/components/icons/GIcon'

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark'
  
  // Detecta preferência do sistema
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  return isDarkMode ? 'dark' : 'light'
}

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark'
  
  // 1. Verifica storage (preferência do usuário)
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme) return storedTheme
  
  // 2. Verifica sistema
  const systemTheme = getSystemTheme()
  if (systemTheme) return systemTheme
  
  // 3. Padrão: dark
  return 'dark'
}

const applyThemeToDocument = (theme) => {
  if (typeof window === 'undefined') return
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    return
  }
  
  document.documentElement.classList.remove('dark')
}

const saveThemeToStorage = (theme) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('theme', theme)
}

const toggleThemeValue = (currentTheme) => {
  return currentTheme === 'dark' ? 'light' : 'dark'
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyThemeToDocument(initialTheme)
    
    // Listener para mudanças na preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Só muda se usuário não tiver preferência salva
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        applyThemeToDocument(newTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleToggle = () => {
    const newTheme = toggleThemeValue(theme)
    setTheme(newTheme)
    applyThemeToDocument(newTheme)
    saveThemeToStorage(newTheme)
  }

  if (!mounted) {
    return (
      <div className="rounded-lg w-10 h-10 flex items-center justify-center" aria-hidden="true" />
    )
  }

  return (
    <button
      onClick={handleToggle}
      className="rounded-lg w-10 h-10 flex items-center justify-center hover:bg-accent transition-all duration-300 group"
      aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      title={`Tema ${theme === 'dark' ? 'escuro' : 'claro'} ativo`}
    >
      {theme === 'dark' ? (
        <GIcon 
          name="light_mode" 
          size={20} 
          className="transition-transform group-hover:rotate-180 duration-500" 
        />
      ) : (
        <GIcon 
          name="dark_mode" 
          size={20} 
          className="transition-transform group-hover:-rotate-12 duration-500" 
        />
      )}
    </button>
  )
}
