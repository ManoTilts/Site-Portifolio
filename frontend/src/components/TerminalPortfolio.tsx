import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { projectsApi, type Project } from "../lib/api"
import { useTheme } from "../contexts/ThemeContext"

interface Command {
  input: string
  output: React.ReactNode
  timestamp: Date
}

const TerminalPortfolio = () => {
  const [commands, setCommands] = useState<Command[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [projects, setProjects] = useState<Project[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const { setTheme } = useTheme()

  const prompt = "visitor@site-portifolio:~$"

  const availableCommands = {
    help: "Show available commands",
    about: "Display information about me",
    skills: "List technical skills",
    projects: "Show my projects",
    contact: "Display contact information",
    experience: "Show work experience",
    education: "Display educational background",
    clear: "Clear the terminal",
    whoami: "Display brief introduction",
    ls: "List available sections",
    cat: "Display file contents (usage: cat <filename>)",
    neofetch: "Display system information",
    tree: "Show portfolio structure",
    pwd: "Print working directory",
    date: "Show current date and time",
    theme: "Switch themes (usage: theme <default|angler|magic|cmd>)",
    exit: "Return to normal portfolio view",
  }

  const asciiArt = `
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║    ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗    ██╗ ██████╗ ║
    ║    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║    ██║██╔═══██╗║
    ║    ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║    ██║██║   ██║║
    ║    ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║    ██║██║   ██║║
    ║    ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝║
    ║    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
  `

  const neofetchInfo = `
                    visitor@Site-Portifolio
                    ------------------------
    OS              Portfolio Stack v2.0
    Host            React + FastAPI Environment
    Kernel          React 19.1.0 + Python FastAPI
    Uptime          ${Math.floor(Date.now() / 1000 / 60)} minutes
    Packages        TypeScript, Tailwind, Framer Motion, Vite
    Shell           portfolio-terminal v1.0
    Resolution      ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080'}
    Terminal        Interactive CMD Interface
    Database        PostgreSQL with Pydantic models
    Features        Multi-theme UI, Admin panel, File uploads
    Architecture    Full Stack Portfolio System
  `

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsApi.getFeatured(10)
        setProjects(response.data)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        // Set some mock data for demonstration
        setProjects([
          {
            id: '1',
            title: 'Portfolio Terminal',
            description: 'Interactive terminal-style portfolio interface',
            short_description: 'CMD-style portfolio interface',
            technologies: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'],
            images: [],
            links: {
              github: 'https://github.com/user/portfolio',
              demo: 'https://portfolio.dev'
            },
            category: 'Web Development',
            featured: true,
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Full Stack Dashboard',
            description: 'Modern dashboard with real-time data visualization',
            short_description: 'Real-time dashboard',
            technologies: ['React', 'FastAPI', 'PostgreSQL', 'Chart.js'],
            images: [],
            links: {
              github: 'https://github.com/user/dashboard'
            },
            category: 'Full Stack',
            featured: true,
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString()
          }
        ])
      }
    }
    fetchProjects()
  }, [])

  const executeCommand = (input: string) => {
    const [cmd, ...args] = input.toLowerCase().trim().split(" ")
    const timestamp = new Date()

    let output: React.ReactNode

    switch (cmd) {
      case "help":
        output = (
          <div className="space-y-1">
            <div className="text-green-400 font-bold mb-2">Available Commands:</div>
            {Object.entries(availableCommands).map(([command, description]) => (
              <div key={command} className="flex">
                <span className="text-cyan-400 w-16">{command}</span>
                <span className="text-gray-300">- {description}</span>
              </div>
            ))}
          </div>
        )
        break

      case "about":
        output = (
          <div className="space-y-2">
            <div className="text-green-400 font-bold">About ManoTilts</div>
            <div className="text-gray-300"> 
              <p>👋 Hi! I'm <span className="text-cyan-400">ManoTilts</span></p>
              <p>🎓 Computer Science student graduating December 2025</p>
              <p>🎮 Passionate about game development and interactive experiences</p>
              <p>🚀 Currently expanding into full-stack development</p>
              <p>💻 Love problem-solving and building creative solutions</p>
              <p>🔧 Working across the full development spectrum</p>
              <p>🌟 Seeking opportunities to launch my development career</p>
              <p>✨ Let's build something amazing together!</p>
            </div>
            <div className="mt-3">
              <div className="text-yellow-400 text-sm">Type 'projects' to see my work • 'skills' for tech stack</div>
            </div>
          </div>
        )
        break

      case "skills":
        output = (
          <div className="space-y-2">
            <div className="text-green-400 font-bold">Technical Skills</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-gray-300">
              <div>
                <div className="text-cyan-400">Frontend Stack:</div>
                <div>• React 19.1.0</div>
                <div>• TypeScript</div>
                <div>• Vite Build Tool</div>
                <div>• Tailwind CSS</div>
                <div>• Framer Motion</div>
                <div>• Lucide React Icons</div>
                <div>• Axios HTTP Client</div>
              </div>
              <div>
                <div className="text-cyan-400">Backend Stack:</div>
                <div>• Python FastAPI</div>
                <div>• PostgreSQL Database</div>
                <div>• Pydantic Schemas</div>
                <div>• Email Service</div>
                <div>• File Upload System</div>
                <div>• Rate Limiting</div>
                <div>• Error Handling</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-cyan-400">Development Tools:</div>
              <div className="text-gray-300">• ESLint + TypeScript Config • PostCSS • Git Version Control</div>
            </div>
          </div>
        )
        break

      case "projects":
        output = (
          <div className="space-y-3">
            <div className="text-green-400 font-bold">Featured Projects</div>
            <div className="space-y-2 text-gray-300">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <div key={project.id} className="border-l-2 border-cyan-400 pl-3">
                    <div className="text-cyan-400 font-semibold">{project.title}</div>
                    <div>{project.description}</div>
                    <div className="text-sm text-gray-400">
                      Tech: {project.technologies.join(', ')}
                    </div>
                    <div className="text-sm text-gray-400">
                      Category: {project.category}
                    </div>
                    {project.links?.github && (
                      <div className="text-sm text-blue-400">
                        Repository: {project.links.github}
                      </div>
                    )}
                    {project.links?.demo && (
                      <div className="text-sm text-purple-400">
                        Demo: {project.links.demo}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Loading projects from database...</div>
              )}
            </div>
          </div>
        )
        break

      case "contact":
        output = (
          <div className="space-y-2">
            <div className="text-green-400 font-bold">Project Repository & Contact</div>
            <div className="text-gray-300 space-y-1">
              <div>🐙 GitHub: <span className="text-blue-400">Site-Portifolio Repository</span></div>
              <div>🌐 Demo: Interactive Portfolio with Multiple Themes</div>
              <div>📧 Contact: Use the contact form in normal portfolio view</div>
              <div>💻 Features: Terminal UI, Project Showcase, Admin Panel</div>
              <div>🔧 API: FastAPI backend with PostgreSQL database</div>
              <div>📱 Responsive: Works on desktop, tablet, and mobile</div>
              <div className="text-cyan-400 mt-2">Type 'exit' to return to normal view and use the contact form</div>
            </div>
          </div>
        )
        break

      case "experience":
        output = (
          <div className="space-y-2">
            <div className="text-green-400 font-bold">Project Development Experience</div>
            <div className="space-y-3 text-gray-300">
              <div className="border-l-2 border-yellow-400 pl-3">
                <div className="text-yellow-400 font-semibold">Full Stack Portfolio Development</div>
                <div className="text-sm text-gray-400">Current Project</div>
                <div>Complete portfolio system with multiple UI themes</div>
                <div>• FastAPI backend with PostgreSQL integration</div>
                <div>• React frontend with TypeScript and modern tooling</div>
                <div>• Email service, file uploads, and admin functionality</div>
              </div>
              <div className="border-l-2 border-yellow-400 pl-3">
                <div className="text-yellow-400 font-semibold">Terminal Interface Design</div>
                <div className="text-sm text-gray-400">Interactive Feature</div>
                <div>Custom terminal interface with command history and animations</div>
                <div>• Mobile-responsive design with touch support</div>
                <div>• Real-time command execution and project data integration</div>
              </div>
            </div>
          </div>
        )
        break

      case "education":
        output = (
          <div className="space-y-2">
            <div className="text-green-400 font-bold">Technical Learning & Architecture</div>
            <div className="space-y-3 text-gray-300">
              <div className="border-l-2 border-purple-400 pl-3">
                <div className="text-purple-400 font-semibold">Full Stack Architecture</div>
                <div className="text-sm text-gray-400">Modern Web Development</div>
                <div>Implemented industry-standard practices and patterns</div>
                <div>• MVC architecture with FastAPI and Pydantic</div>
                <div>• Component-based React with TypeScript</div>
                <div>• Database design with PostgreSQL</div>
              </div>
              <div className="border-l-2 border-purple-400 pl-3">
                <div className="text-purple-400 font-semibold">DevOps & Development Tools</div>
                <div className="text-sm text-gray-400">Professional Workflow</div>
                <div>Modern development environment and practices</div>
                <div>• Vite build system and hot reload</div>
                <div>• ESLint and TypeScript strict mode</div>
                <div>• Git version control and project structure</div>
              </div>
            </div>
          </div>
        )
        break

      case "whoami":
        output = (
          <div className="text-gray-300">
            <div><span className="text-cyan-400">ManoTilts</span> - Computer Science student and aspiring developer</div>
            <div className="mt-1 text-yellow-400">Type 'about' for more information.</div>
          </div>
        )
        break

      case "ls":
        output = (
          <div className="text-gray-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="text-cyan-400">backend/</div>
              <div className="text-cyan-400">frontend/</div>
              <div className="text-cyan-400">LICENSE</div>
              <div className="text-cyan-400">README.md</div>
              <div className="text-cyan-400">package.json</div>
              <div className="text-cyan-400">.gitignore</div>
            </div>
          </div>
        )
        break

      case "cat":
        if (args[0] === "readme.md") {
          output = (
            <div className="text-gray-300 space-y-2">
              <div className="text-green-400 font-bold"># Site-Portifolio</div>
                              <div>🎯 <span className="text-cyan-400">Modern Full Stack Portfolio System</span></div>
                <div>🚀 Multi-theme portfolio with interactive terminal interface</div>
                <div>⚡ Built with React 19.1.0, TypeScript, FastAPI, and PostgreSQL</div>
                <div>📱 Responsive design with mobile-optimized terminal</div>
                <div>🔧 Features: Project showcase, contact forms, admin panel, file uploads</div>
                <div>🎨 Themes: Default, Angler, Magic, and CMD terminal mode</div>
                <div className="mt-2 text-yellow-400">Use 'help' to explore available commands</div>
            </div>
          )
        } else {
          output = <div className="text-red-400">cat: {args[0] || "filename"}: No such file or directory</div>
        }
        break

      case "neofetch":
        output = <pre className="text-cyan-400 text-xs sm:text-sm leading-tight overflow-x-auto">{neofetchInfo}</pre>
        break

      case "tree":
        output = (
          <pre className="text-gray-300 text-xs sm:text-sm overflow-x-auto">
            {`Site-Portifolio/
├── backend/
│   ├── app/
│   │   ├── config/
│   │   │   ├── database.py
│   │   │   └── settings.py
│   │   ├── middleware/
│   │   │   ├── error_handler.py
│   │   │   └── rate_limiter.py
│   │   ├── models/
│   │   │   ├── admin.py
│   │   │   ├── contact.py
│   │   │   └── project.py
│   │   ├── routes/
│   │   │   ├── admin.py
│   │   │   ├── contact.py
│   │   │   ├── health.py
│   │   │   ├── projects.py
│   │   │   └── upload.py
│   │   ├── services/
│   │   │   ├── email_service.py
│   │   │   ├── file_service.py
│   │   │   └── image_service.py
│   │   └── templates/
│   │       └── emails/
│   ├── main.py
│   ├── requirements.txt
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Projects.tsx
│   │   │   └── TerminalPortfolio.tsx
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── LICENSE
└── README.md`}
          </pre>
        )
        break

      case "pwd":
        output = <div className="text-gray-300">/home/visitor/Site-Portifolio</div>
        break

      case "date":
        output = <div className="text-gray-300">{new Date().toString()}</div>
        break

      case "theme":
        if (args[0]) {
          const themes = ['default', 'angler', 'magic', 'cmd']
          if (themes.includes(args[0])) {
            setTheme(args[0] as any)
            output = (
              <div className="text-green-400">
                ✓ Theme switched to: {args[0]}
                <div className="text-gray-300 mt-1">
                  {args[0] === 'cmd' ? 'Already in terminal mode!' : 'Switching to normal view...'}
                </div>
              </div>
            )
          } else {
            output = <div className="text-red-400">Unknown theme: {args[0]}</div>
          }
        } else {
          output = <div className="text-gray-300">Current theme: cmd</div>
        }
        break

      case "exit":
        output = (
          <div className="text-yellow-400">
            Exiting terminal mode...
            <div className="text-gray-300 mt-1">Switching to default portfolio view</div>
          </div>
        )
        setTimeout(() => setTheme('default'), 1000)
        break

      case "clear":
        setCommands([])
        return

      case "":
        return

      default:
        output = <div className="text-red-400">Command '{cmd}' not found. Type 'help' for available commands.</div>
    }

    const newCommand: Command = {
      input: input,
      output: output,
      timestamp: timestamp,
    }

    setCommands((prev) => [...prev, newCommand])
    setCommandHistory((prev) => [...prev, input])
    setHistoryIndex(-1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentInput.trim()) {
      executeCommand(currentInput)
      setCurrentInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentInput("")
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commands])

  useEffect(() => {
    // Welcome message
    const welcomeCommand: Command = {
      input: "",
      output: (
        <div className="space-y-2">
          <pre className="text-green-400 text-xs sm:text-sm leading-tight overflow-x-auto hidden sm:block">{asciiArt}</pre>
          <div className="text-gray-300">
                          <div className="text-lg sm:text-xl font-bold text-green-400 sm:hidden mb-2">SITE-PORTIFOLIO TERMINAL</div>
            <div>Welcome to the Site-Portifolio terminal interface!</div>
            <div className="text-cyan-400 mt-2">Type 'help' to see available commands.</div>
            <div className="text-yellow-400">Use arrow keys to navigate command history.</div>
            <div className="text-purple-400 hidden sm:block">Full Stack Portfolio • FastAPI + React + PostgreSQL</div>
          </div>
        </div>
      ),
      timestamp: new Date(),
    }
    setCommands([welcomeCommand])
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto p-2 sm:p-4 lg:p-6 max-w-7xl">
        <div ref={terminalRef} className="bg-gray-900 rounded-lg border border-gray-700 shadow-2xl overflow-hidden terminal-scroll">
          {/* Terminal Header */}
          <div className="bg-gray-800 px-3 sm:px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-gray-400 text-xs sm:text-sm ml-2 sm:ml-4 hidden sm:block">portfolio-terminal</div>
            </div>
            <button 
              onClick={() => setTheme('default')}
              className="text-gray-400 hover:text-white text-xs sm:text-sm px-2 py-1 rounded border border-gray-600 hover:border-gray-400 transition-colors"
            >
              <span className="hidden sm:inline">Exit Terminal</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>

          {/* Terminal Content */}
          <div className="p-3 sm:p-4 lg:p-6 h-[60vh] sm:h-[65vh] lg:h-[70vh] xl:h-[75vh] overflow-y-auto terminal-scroll">
            <AnimatePresence>
              {commands.map((command, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-3 sm:mb-4"
                >
                  {command.input && (
                    <div className="flex items-start space-x-1 sm:space-x-2 mb-2 flex-wrap">
                      <span className="text-cyan-400 text-xs sm:text-sm shrink-0">{prompt}</span>
                      <span className="text-white text-xs sm:text-sm break-all">{command.input}</span>
                    </div>
                  )}
                  <div className="ml-2 sm:ml-4 text-xs sm:text-sm overflow-x-auto">{command.output}</div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Current Input */}
            <form onSubmit={handleSubmit} className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-cyan-400 text-xs sm:text-sm shrink-0">{prompt}</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white outline-none border-none ring-0 focus:outline-none focus:ring-0 focus:border-none text-xs sm:text-sm min-w-0"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-white terminal-cursor text-xs sm:text-sm"
              >
                █
              </motion.span>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 sm:mt-4 text-center text-gray-500 text-xs sm:text-sm px-2">
          <div className="hidden sm:block">Press Tab for autocomplete • Use ↑↓ for command history • Type 'exit' to return</div>
          <div className="sm:hidden">Use ↑↓ for history • Type 'help' for commands</div>
          <div className="mt-1">Built with React & TypeScript • Terminal Portfolio v1.0</div>
        </div>
      </div>
    </div>
  )
}

export default TerminalPortfolio 