export interface ServiceItem {
  id: string;
  label: string;
  price: number;
  category: "project" | "addon" | "maintenance";
  recurring?: boolean;
}

export const SERVICE_CATALOG: ServiceItem[] = [
  // Proyectos
  { id: "lp-basic",     label: "Smart Landing Page – One Page",           price: 499,  category: "project" },
  { id: "lp-pro",       label: "Smart Landing Page – Multi-sección",      price: 850,  category: "project" },
  { id: "lp-ecomm",     label: "Landing Page E-commerce",                 price: 1200, category: "project" },

  // Add-ons
  { id: "addon-form",   label: "Integración de Formulario",               price: 120,  category: "addon" },
  { id: "addon-seo",    label: "SEO On-Page Avanzado",                    price: 200,  category: "addon" },
  { id: "addon-anim",   label: "Animaciones Premium (Framer Motion)",     price: 150,  category: "addon" },
  { id: "addon-mig",    label: "Migración desde plataforma anterior",     price: 180,  category: "addon" },
  { id: "addon-domain", label: "Setup Dominio + Hosting",                 price: 80,   category: "addon" },

  // Mantenimiento (recurrentes)
  { id: "maint-basic",  label: "Plan Mantenimiento Básico (mensual)",     price: 79,   category: "maintenance", recurring: true },
  { id: "maint-pro",    label: "Plan Mantenimiento Pro (mensual)",        price: 149,  category: "maintenance", recurring: true },
];
