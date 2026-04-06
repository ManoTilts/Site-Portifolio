import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Button } from './Button'
import { Dropdown } from './Dropdown'
import { Globe } from 'lucide-react'

type Language = 'en' | 'pt'

interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const languageOptions = [
  { 
    value: 'en' as Language, 
    label: 'English', 
    flag: '🇺🇸',
    nativeLabel: 'English'
  },
  { 
    value: 'pt' as Language, 
    label: 'Português', 
    flag: '🇧🇷',
    nativeLabel: 'Português'
  }
]

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown', 
  size = 'md',
  className = ''
}) => {
  const { language, setLanguage } = useLanguage()

  const currentLanguage = languageOptions.find(opt => opt.value === language)

  if (variant === 'button') {
    const otherLanguage = languageOptions.find(opt => opt.value !== language)
    
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={() => otherLanguage && setLanguage(otherLanguage.value)}
        className={`gap-2 ${className}`}
        title={`Switch to ${otherLanguage?.nativeLabel}`}
      >
        <span className="text-lg">{otherLanguage?.flag}</span>
        <span className="font-medium">{otherLanguage?.label}</span>
      </Button>
    )
  }

  return (
    <Dropdown>
      <Dropdown.Trigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={`gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span className="font-medium hidden sm:inline">{currentLanguage?.label}</span>
        </Button>
      </Dropdown.Trigger>
      
      <Dropdown.Content align="end" className="min-w-[150px]">
        {languageOptions.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={() => setLanguage(option.value)}
            className={`flex items-center gap-3 ${
              language === option.value ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{option.flag}</span>
            <span className="font-medium">{option.nativeLabel}</span>
            {language === option.value && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  )
} 