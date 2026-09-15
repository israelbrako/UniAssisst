export interface HelpCategory {
  id: string;
  name: string;
  shortName: string;
  description: string;
  basePrice: number;
  slaHours: number;
  iconName: "Wifi" | "GraduationCap" | "Laptop" | "Cpu" | "KeyRound" | "Printer";
  popular?: boolean;
  commonIssues: string[];
}

export const CATEGORIES: HelpCategory[] = [
  {
    id: "wifi-network",
    name: "XAMPP",
    shortName: "XAMPP",
    description: "Apache and MySQL setup, localhost configuration, PHP troubleshooting, and local development support.",
    basePrice: 150,
    slaHours: 2,
    iconName: "Wifi",
    popular: true,
    commonIssues: ["Apache service will not start", "Localhost project configuration", "PHP and MySQL connection errors"],
  },
  {
    id: "portal-lms",
    name: "WordPress",
    shortName: "WordPress",
    description: "WordPress installation, themes, plugins, content updates, site errors, and website support.",
    basePrice: 180,
    slaHours: 3,
    iconName: "GraduationCap",
    popular: true,
    commonIssues: ["Plugin or theme conflict", "WordPress setup and configuration", "Database connection error"],
  },
  {
    id: "hardware-diagnostics",
    name: "MySQL Workbench",
    shortName: "MySQL Workbench",
    description: "Database connections, schema design, SQL queries, user access, backups, and Workbench troubleshooting.",
    basePrice: 375,
    slaHours: 6,
    iconName: "Laptop",
    commonIssues: ["Cannot connect to database", "Query or schema errors", "User permissions and access setup"],
  },
  {
    id: "software-os",
    name: "Linux Administration",
    shortName: "Linux Administration",
    description: "Linux installation, shell commands, users and permissions, packages, services, networking, and maintenance.",
    basePrice: 270,
    slaHours: 4,
    iconName: "Cpu",
    commonIssues: ["Permission denied errors", "Package or service failure", "Server and network configuration"],
  },
  {
    id: "account-2fa",
    name: "Windows Environment",
    shortName: "Windows Environment",
    description: "Windows setup, updates, drivers, system configuration, performance issues, and workstation troubleshooting.",
    basePrice: 225,
    slaHours: 1,
    iconName: "KeyRound",
    popular: true,
    commonIssues: ["Windows update or activation issue", "Driver installation failure", "Slow or unstable workstation"],
  },
  {
    id: "printing-peripherals",
    name: "General Software & IT Support",
    shortName: "General Software & IT",
    description: "Application setup, software troubleshooting, system guidance, and everyday technical support across devices.",
    basePrice: 120,
    slaHours: 2,
    iconName: "Printer",
    commonIssues: ["Application installation help", "Unexpected software errors", "General troubleshooting and setup"],
  },
];

export function getCategoryById(id: string): HelpCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
