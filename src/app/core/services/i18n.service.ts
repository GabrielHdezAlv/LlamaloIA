import { Injectable, signal } from '@angular/core';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Translations {
  // Home page translations
  summary: string;
  totalSuccessfulCalls: string;
  timeSaved: string;
  minutesUsed: string;
  activeAgents: string;
  callsPerDay: string;
  agentName: string;
  type: string;
  totalMinutesSpent: string;
  status: string;
  active: string;
  draft: string;
  inbound: string;
  outbound: string;
  vsLastYear: string;
  
  // Days of the week
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  
  // Navigation
  home: string;
  agents: string;
  numbers: string;
  history: string;
  metrics: string;
  settings: string;
  privateCommunity: string;
  helpCenter: string;
  logout: string;
  
  // Promo card
  promoTitle: string;
  promoDescription: string;
  promoButton: string;
  remainingMinutes: string;
  planPro: string;
  
  // New Agents page
  yourAgents: string;
  createAgent: string;
  agent: string;
  number: string;
  edit: string;
  delete: string;
  stopPublishing: string;
  noAgentsYet: string;
  createItNow: string;
  createAgentButton: string;
  
  // Numbers page
  importNumber: string;
  importedFrom: string;
  clientNumber: string;
  storeNumber: string;
  label: string;
  
  // Historial page
  searchNumber: string;
  resolved: string;
  pending: string;
  selectContactToView: string;
  
  // Common
  new: string;
  
  // Metrics page
  last7Days: string;
  last30Days: string;
  thisMonth: string;
  lastYear: string;
  all: string;
  agent1: string;
  agent2: string;
  totalMinutes: string;
  extraMinutes: string;
  latency: string;
  fast: string;
  normal: string;
  slow: string;
  latencyDescription: string;
  averageCallDuration: string;
  long: string;
  durationDescription: string;
  callTypes: string;
  createdAgents: string;
  name: string;
  countries: string;
  // Countries
  unitedStates: string;
  france: string;
  spain: string;
  unitedKingdom: string;
  brazil: string;
  // Agent status
  activeStatus: string;
  draftStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage = signal<Language>({
    code: 'es',
    name: 'Español',
    flag: 'https://flagcdn.com/w40/es.png'
  });

  private translations: Record<string, Translations> = {
    es: {
      summary: 'Resumen',
      totalSuccessfulCalls: 'Total de llamadas exitosas',
      timeSaved: 'Tiempo Ahorrado',
      minutesUsed: 'Minutos usados',
      activeAgents: 'Agentes Activos',
      callsPerDay: 'Llamadas por día',
      agentName: 'Nombre del Agente',
      type: 'Tipo',
      totalMinutesSpent: 'Total Minutos Gastados',
      status: 'Estado',
      active: 'Activo',
      draft: 'Borrador',
      inbound: 'Inbound',
      outbound: 'Outbound',
      vsLastYear: 'vs last year',
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mie',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sab',
      sunday: 'Dom',
      home: 'Inicio',
      agents: 'Agentes',
      numbers: 'Números',
      history: 'Historial',
      metrics: 'Métricas',
      settings: 'Ajustes',
      privateCommunity: 'Comunidad Privada',
      helpCenter: 'Centro de ayuda',
      logout: 'Cerrar Sesión',
      promoTitle: '¡Suma tiempo extra sin pagar!',
      promoDescription: 'Completa retos sencillos y aumenta tus minutos disponibles al instante.',
      promoButton: 'Conseguir ahora',
      remainingMinutes: 'Minutos Restantes',
      planPro: 'Plan PRO',
      
      // New Agents page
      yourAgents: 'Tus agentes',
      createAgent: 'Crear Agente',
      agent: 'Agente',
      number: 'Número',
      edit: 'Editar',
      delete: 'Eliminar',
      stopPublishing: 'Dejar de publicar',
      noAgentsYet: 'Aún no tienes ningún agente telefonico.',
      createItNow: '¡Créalo ahora!',
      createAgentButton: 'Crear agente',
      
      // Numbers page
      importNumber: 'Importar Numero',
      importedFrom: 'Importado de',
      clientNumber: 'Numero Cliente',
      storeNumber: 'Numero de tienda',
      label: 'Etiqueta',
      
      // Historial page
      searchNumber: 'Buscar el número',
      resolved: 'Resuelto',
      pending: 'Pendiente',
      selectContactToView: 'Selecciona un contacto para ver la conversación.',
      
      // Common
      new: 'Nuevo',
      
      // Metrics page
      last7Days: 'Últimos 7 días',
      last30Days: 'Últimos 30 días',
      thisMonth: 'Este mes',
      lastYear: 'Año pasado',
      all: 'Todos',
      agent1: 'Agente 1',
      agent2: 'Agente 2',
      totalMinutes: 'Total Minutos',
      extraMinutes: 'Minutos Extra',
      latency: 'Latencia',
      fast: 'RÁPIDO',
      normal: 'NORMAL',
      slow: 'LENTO',
      latencyDescription: 'Tiempo que tarda el sistema en responder durante una llamada. Un valor más bajo indica mayor rapidez.',
      averageCallDuration: 'Duración media de las llamadas',
      long: 'LARGA',
      durationDescription: 'Promedio de tiempo que duran las llamadas gestionadas por el agente.',
      callTypes: 'Tipo de llamadas',
      createdAgents: 'Agentes Creados',
      name: 'Nombre',
      countries: 'Países',
      // Países
      unitedStates: 'Estados Unidos',
      france: 'Francia',
      spain: 'España',
      unitedKingdom: 'Reino Unido',
      brazil: 'Brasil',
      // Estados de agentes
      activeStatus: 'Activo',
      draftStatus: 'Borrador'
    },
    en: {
      summary: 'Summary',
      totalSuccessfulCalls: 'Total successful calls',
      timeSaved: 'Time Saved',
      minutesUsed: 'Minutes used',
      activeAgents: 'Active Agents',
      callsPerDay: 'Calls per day',
      agentName: 'Agent Name',
      type: 'Type',
      totalMinutesSpent: 'Total Minutes Spent',
      status: 'Status',
      active: 'Active',
      draft: 'Draft',
      inbound: 'Inbound',
      outbound: 'Outbound',
      vsLastYear: 'vs last year',
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
      home: 'Home',
      agents: 'Agents',
      numbers: 'Numbers',
      history: 'History',
      metrics: 'Metrics',
      settings: 'Settings',
      privateCommunity: 'Private Community',
      helpCenter: 'Help Center',
      logout: 'Logout',
      promoTitle: 'Add extra time without paying!',
      promoDescription: 'Complete simple challenges and increase your available minutes instantly.',
      promoButton: 'Get now',
      remainingMinutes: 'Remaining Minutes',
      planPro: 'PRO Plan',
      
      // New Agents page
      yourAgents: 'Your agents',
      createAgent: 'Create Agent',
      agent: 'Agent',
      number: 'Number',
      edit: 'Edit',
      delete: 'Delete',
      stopPublishing: 'Stop publishing',
      noAgentsYet: 'You don\'t have any phone agents yet.',
      createItNow: 'Create it now!',
      createAgentButton: 'Create agent',
      
      // Numbers page
      importNumber: 'Import Number',
      importedFrom: 'Imported from',
      clientNumber: 'Client Number',
      storeNumber: 'Store Number',
      label: 'Label',
      
      // Historial page
      searchNumber: 'Search number',
      resolved: 'Resolved',
      pending: 'Pending',
      selectContactToView: 'Select a contact to view the conversation.',
      
      // Common
      new: 'New',
      
      // Metrics page
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      thisMonth: 'This month',
      lastYear: 'Last year',
      all: 'All',
      agent1: 'Agent 1',
      agent2: 'Agent 2',
      totalMinutes: 'Total Minutes',
      extraMinutes: 'Extra Minutes',
      latency: 'Latency',
      fast: 'FAST',
      normal: 'NORMAL',
      slow: 'SLOW',
      latencyDescription: 'Time it takes for the system to respond during a call. A lower value indicates greater speed.',
      averageCallDuration: 'Average call duration',
      long: 'LONG',
      durationDescription: 'Average time that calls managed by the agent last.',
      callTypes: 'Call types',
      createdAgents: 'Created Agents',
      name: 'Name',
      countries: 'Countries',
      // Countries
      unitedStates: 'United States',
      france: 'France',
      spain: 'Spain',
      unitedKingdom: 'United Kingdom',
      brazil: 'Brazil',
      // Agent status
      activeStatus: 'Active',
      draftStatus: 'Draft'
    }
  };

  getCurrentLanguage() {
    return this.currentLanguage.asReadonly();
  }

  getTranslations(): Translations {
    return this.translations[this.currentLanguage().code];
  }

  setLanguage(language: Language) {
    this.currentLanguage.set(language);
    // Guardar en localStorage para persistir la selección
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('selectedLanguage', JSON.stringify(language));
    }
  }

  getAvailableLanguages(): Language[] {
    return [
      { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
      { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
      { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' }
    ];
  }

  initializeLanguage() {
    // Cargar idioma guardado del localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        try {
          const language = JSON.parse(savedLanguage);
          this.currentLanguage.set(language);
        } catch (error) {
          console.error('Error parsing saved language:', error);
        }
      }
    }
  }
}
