export const SOCIAL_LINKS = {
  github: "https://github.com/cotrain-ai",
  twitter: "https://twitter.com/cotrain_ai",
  discord: "https://discord.gg/cotrain",
  telegram: "https://t.me/cotrain_ai",
  linkedin: "https://linkedin.com/company/cotrain",
  youtube: "https://youtube.com/@cotrain-ai",
}

export const NAVIGATION_ITEMS = [
  { id: "home", label: "Home", href: "/" },
  { id: "terminal", label: "Terminal", href: "/terminal" },
  { id: "training", label: "Training", href: "/training" },
  { id: "history", label: "History", href: "/history" },
  { id: "docs", label: "Docs", href: "/docs" },
  { id: "community", label: "Community", href: "/community" },
  { id: "about", label: "About", href: "/about" },
]

export const FOOTER_LINKS = {
  Product: [
    { name: "Terminal", href: "/terminal" },
    { name: "Training Hub", href: "/training" },
    { name: "Analytics", href: "/analytics" },
    { name: "API", href: "/api" },
    { name: "Mobile App", href: "/mobile" },
  ],
  Resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "Blog", href: "/blog" },
    { name: "Research Papers", href: "/research" },
    { name: "Whitepaper", href: "/whitepaper" },
  ],
  Community: [
    { name: "Discord Server", href: SOCIAL_LINKS.discord },
    { name: "Forum", href: "/forum" },
    { name: "Contributors", href: "/contributors" },
    { name: "Events", href: "/events" },
    { name: "Newsletter", href: "/newsletter" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Contact", href: "/contact" },
    { name: "Investors", href: "/investors" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Security", href: "/security" },
  ],
}

export const COMMANDS = {
  help: "Show available commands",
  start: "Start distributed training",
  stop: "Stop current training session",
  status: "Show system status",
  nodes: "List all network nodes",
  clear: "Clear terminal output",
  connect: "Connect to network",
  disconnect: "Disconnect from network",
  progress: "Show training progress",
  logs: "Show recent system logs",
  contributors: "Show contributor statistics",
  training: "Open training selection interface",
  history: "View training history",
  home: "Return to home page",
  profile: "View user profile",
  settings: "Open settings",
  rewards: "Check rewards and tokens",
  leaderboard: "View contributor leaderboard",
  network: "Show network topology",
  version: "Show system version",
  exit: "Exit terminal session",
}

export const SYSTEM_INFO = {
  name: "CoTrain",
  version: "2.1.0",
  description: "Decentralized AI Training Platform",
  author: "CoTrain Team",
  license: "MIT",
  repository: "https://github.com/cotrain-ai/cotrain",
  website: "https://cotrain.ai",
  support: "support@cotrain.ai",
}

export const HARDWARE_REQUIREMENTS = {
  minimum: {
    gpu: "GTX 1060 6GB",
    ram: "8GB",
    storage: "100GB",
    bandwidth: "10 Mbps",
  },
  recommended: {
    gpu: "RTX 3080 10GB",
    ram: "32GB",
    storage: "500GB SSD",
    bandwidth: "100 Mbps",
  },
  optimal: {
    gpu: "H100 80GB",
    ram: "128GB",
    storage: "2TB NVMe",
    bandwidth: "1 Gbps",
  },
}
