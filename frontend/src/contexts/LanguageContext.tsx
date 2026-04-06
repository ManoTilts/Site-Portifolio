import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'pt'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Translations
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.welcome': 'Welcome to my portfolio',
    'hero.greeting': 'Hi, I\'m',
    'hero.subtitle': 'Computer Science Graduate · Game Developer · Full Stack · Digital Illustrations',
    'hero.description': 'Passionate about building immersive experiences through game development and full-stack solutions — and recently channelling that creativity into digital illustration with Clip Studio Paint.',
    'hero.viewWork': 'View My Work',
    'hero.downloadCV': 'Download CV',
    'hero.cvComingSoon': 'CV Coming Soon',
    'hero.scrollExplore': 'Scroll to explore',
    
    // CV Download
    'cv.selectLanguage': 'Select CV Language',
    'cv.downloadEnglish': 'Download English CV',
    'cv.downloadPortuguese': 'Download Portuguese CV',
    'cv.downloadTitle': 'Choose your preferred language',
    'cv.notAvailable': 'CV is not available yet. Please check back later or contact me directly.',
    
    // About Section
    'about.title': 'About Me',
    'about.subtitle': 'Computer Science graduate passionate about game development, full-stack solutions, and digital illustration.',
    'about.greeting': 'Hello, I\'m Felipe Mazzeo Barbosa [ManoTilts]',
    'about.description1': 'I\'m a Computer Science graduate passionate about crafting interactive experiences. My foundation is in game development—where creativity meets code to build immersive worlds—complemented by solid full-stack expertise that lets me take ideas from concept to production.',
    'about.description2': 'Beyond code, I\'ve been exploring my artistic side through digital illustration in Clip Studio Paint. I find that thinking like an artist makes me a better developer: attention to composition, colour, and detail carries directly into the interfaces and experiences I build.',
    'about.description3': 'I\'m drawn to teams and projects where creativity and engineering intersect — whether that\'s a game, a polished web product, or something in between. I\'m excited to bring curiosity, craft, and collaborative energy to whatever I work on next. Let\'s build something worth playing—or looking at.',
    'about.creativeDesign': 'Creative Design',
    'about.fastDevelopment': 'Fast Development',
    'about.stats.projects': 'Projects Completed',
    'about.stats.clients': 'Happy Clients',
    'about.stats.coffee': 'Cups of Coffee',
    'about.stats.experience': 'Years Experience',
    'about.skillsTitle': 'Technical Skills',
    'about.skillsSubtitle': 'The tools and technologies I use to bring ideas to life',
    
    // Projects Section
    'projects.title': 'My Projects',
    'projects.featured': 'Featured Projects',
    'projects.subtitle': 'A collection of projects that showcase my skills and passion for creating exceptional digital experiences that solve real-world problems.',
    'projects.allProjects': 'All Projects',
    'projects.viewAll': 'View All Projects',
    'projects.liveDemo': 'Live Demo',
    'projects.sourceCode': 'Source Code',
    'projects.categories': 'Categories',
    'projects.technologies': 'Technologies Used',
    'projects.noProjects': 'No projects found in this category.',
    'projects.tryDifferent': 'Try selecting a different category or check back later.',
    'projects.visit': 'Visit Project',
    'projects.code': 'View Code',
    
    // Contact Section
    'contact.title': 'Get In Touch',
    'contact.workTogether': 'Let\'s Work Together',
    'contact.subtitle': 'Looking to connect? Whether it\'s about job opportunities, collaboration, or just to say hello, I\'d love to hear from you.',
    'contact.getInTouch': 'Get in Touch',
    'contact.name': 'Your Name',
    'contact.email': 'Your Email',
    'contact.subject': 'Subject',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.sendMessage': 'Send me a message',
    'contact.formDescription': 'Fill out the form below and I\'ll get back to you within 24 hours.',
    'contact.whyWorkWithMe': 'Why Work With Me?',
    'contact.fastResponse': 'Fast Response Time',
    'contact.goalOriented': 'Goal-Oriented Approach',
    'contact.iterativeProcess': 'Iterative Process',
    'contact.attentionToDetail': 'Attention to Detail',
    'contact.emailLabel': 'Email',
    'contact.phoneLabel': 'Phone',
    'contact.locationLabel': 'Location',
    'contact.emailValue': 'felipe.mazzeo.barbosa@outlook.com',
    'contact.phoneValue': '+55 (11) 99170-1334',
    'contact.locationValue': 'São Paulo, SP',
    
    // Footer
    'footer.rights': 'All rights reserved',
    'footer.builtWith': 'Built with React, TypeScript, and Tailwind CSS',
    'footer.description': 'Creating digital experiences that matter. Full-stack developer passionate about building beautiful, functional applications.',
    'footer.quickLinks': 'Quick Links',
    'footer.getInTouch': 'Get in Touch',
    'footer.email': 'Email',
    'footer.location': 'Location',
    'footer.status': 'Status',
    'footer.availableForWork': 'Available for work',
    'footer.connect': 'Connect',
    'footer.connectMessage': 'Let\'s connect and build something amazing together!',
    'footer.madeWithLove': 'Made with',
    'footer.top': 'Top',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.projects': 'Projetos',
    'nav.contact': 'Contato',
    
    // Hero Section
    'hero.welcome': 'Bem-vindo ao meu portfólio',
    'hero.greeting': 'Olá, eu sou',
    'hero.subtitle': 'Graduado em Ciência da Computação · Dev de Jogos · Full Stack · Ilustrações Digitais',
    'hero.description': 'Apaixonado por experiências imersivas no desenvolvimento de jogos e soluções full-stack — e recentemente canalizando essa criatividade para ilustração digital no Clip Studio Paint.',
    'hero.viewWork': 'Ver Meu Trabalho',
    'hero.downloadCV': 'Baixar Currículo',
    'hero.cvComingSoon': 'Currículo em Breve',
    'hero.scrollExplore': 'Role para explorar',
    
    // CV Download
    'cv.selectLanguage': 'Selecionar Idioma do Currículo',
    'cv.downloadEnglish': 'Baixar Currículo em Inglês',
    'cv.downloadPortuguese': 'Baixar Currículo em Português',
    'cv.downloadTitle': 'Escolha seu idioma preferido',
    'cv.notAvailable': 'Currículo não está disponível ainda. Volte mais tarde ou entre em contato diretamente.',
    
    // About Section
    'about.title': 'Sobre Mim',
    'about.subtitle': 'Graduado em Ciência da Computação apaixonado por desenvolvimento de jogos, soluções full-stack e ilustração digital.',
    'about.greeting': 'Olá, eu sou Felipe Mazzeo Barbosa [ManoTilts]',
    'about.description1': 'Sou graduado em Ciência da Computação com paixão por criar experiências interativas. Minha base está no desenvolvimento de jogos — onde criatividade encontra código para construir mundos imersivos — complementada por uma sólida expertise full-stack que me permite levar ideias do conceito à produção.',
    'about.description2': 'Além do código, venho explorando meu lado artístico através da ilustração digital no Clip Studio Paint. Descobri que pensar como artista me torna um desenvolvedor melhor: atenção à composição, cor e detalhe se reflete diretamente nas interfaces e experiências que construo.',
    'about.description3': 'Me atraem equipes e projetos onde criatividade e engenharia se cruzam — seja um jogo, um produto web refinado ou algo entre os dois. Estou animado para trazer curiosidade, capricho e energia colaborativa para o próximo desafio. Vamos construir algo que valha a pena jogar — ou admirar.',
    'about.creativeDesign': 'Design Criativo',
    'about.fastDevelopment': 'Desenvolvimento Rápido',
    'about.stats.projects': 'Projetos Concluídos',
    'about.stats.clients': 'Clientes Satisfeitos',
    'about.stats.coffee': 'Xícaras de Café',
    'about.stats.experience': 'Anos de Experiência',
    'about.skillsTitle': 'Habilidades Técnicas',
    'about.skillsSubtitle': 'As ferramentas e tecnologias que uso para dar vida às ideias',
    
    // Projects Section
    'projects.title': 'Meus Projetos',
    'projects.featured': 'Projetos em Destaque',
    'projects.subtitle': 'Uma coleção de projetos que demonstram minhas habilidades e paixão por criar experiências digitais excepcionais que resolvem problemas do mundo real.',
    'projects.allProjects': 'Todos os Projetos',
    'projects.viewAll': 'Ver Todos os Projetos',
    'projects.liveDemo': 'Demo ao Vivo',
    'projects.sourceCode': 'Código Fonte',
    'projects.categories': 'Categorias',
    'projects.technologies': 'Tecnologias Utilizadas',
    'projects.noProjects': 'Nenhum projeto encontrado nesta categoria.',
    'projects.tryDifferent': 'Tente selecionar uma categoria diferente ou volte mais tarde.',
    'projects.visit': 'Visitar Projeto',
    'projects.code': 'Ver Código',
    
    // Contact Section
    'contact.title': 'Entre em Contato',
    'contact.workTogether': 'Vamos Trabalhar Juntos',
    'contact.subtitle': 'Procurando se conectar? Seja sobre oportunidades de trabalho, colaboração, ou apenas para dizer olá, eu adoraria ouvir de você.',
    'contact.getInTouch': 'Entre em Contato',
    'contact.name': 'Seu Nome',
    'contact.email': 'Seu Email',
    'contact.subject': 'Assunto',
    'contact.message': 'Sua Mensagem',
    'contact.send': 'Enviar Mensagem',
    'contact.sending': 'Enviando...',
    'contact.sendMessage': 'Envie-me uma mensagem',
    'contact.formDescription': 'Preencha o formulário abaixo e retornarei em até 24 horas.',
    'contact.whyWorkWithMe': 'Por que Trabalhar Comigo?',
    'contact.fastResponse': 'Tempo de Resposta Rápido',
    'contact.goalOriented': 'Abordagem Orientada a Objetivos',
    'contact.iterativeProcess': 'Processo Iterativo',
    'contact.attentionToDetail': 'Atenção aos Detalhes',
    'contact.emailLabel': 'Email',
    'contact.phoneLabel': 'Telefone',
    'contact.locationLabel': 'Localização',
    'contact.emailValue': 'felipe.mazzeo.barbosa@outlook.com',
    'contact.phoneValue': '+55 (11) 99170-1334',
    'contact.locationValue': 'São Paulo, SP',
    
    // Footer
    'footer.rights': 'Todos os direitos reservados',
    'footer.builtWith': 'Construído com React, TypeScript e Tailwind CSS',
    'footer.description': 'Criando experiências digitais que importam. Desenvolvedor full-stack apaixonado por construir aplicações bonitas e funcionais.',
    'footer.quickLinks': 'Links Rápidos',
    'footer.getInTouch': 'Entre em Contato',
    'footer.email': 'Email',
    'footer.location': 'Localização',
    'footer.status': 'Status',
    'footer.availableForWork': 'Disponível para trabalho',
    'footer.connect': 'Conectar',
    'footer.connectMessage': 'Vamos nos conectar e construir algo incrível juntos!',
    'footer.madeWithLove': 'Feito com',
    'footer.top': 'Topo',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Ocorreu um erro',
    'common.close': 'Fechar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
  }
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or use browser language as default
    const savedLanguage = localStorage.getItem('portfolio-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      return savedLanguage
    }
    
    // Check browser language
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.startsWith('pt')) {
      return 'pt'
    }
    
    return 'en'
  })

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('portfolio-language', lang)
  }

  useEffect(() => {
    document.documentElement.lang = language
    // Force sync localStorage on every language change
    localStorage.setItem('portfolio-language', language)
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
} 