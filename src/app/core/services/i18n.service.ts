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

  // Days of the week abbreviations
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;

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
  // Países
  unitedStates: string;
  france: string;
  spain: string;
  unitedKingdom: string;
  brazil: string;
  // Estados de agentes
  activeStatus: string;
  draftStatus: string;

  // Account/Settings page
  profile: string;
  security: string;
  billing: string;
  gifts: string;
  personalInfo: string;
  personalInfoDesc: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  saveChanges: string;
  changePassword: string;
  changePasswordDesc: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  updatePassword: string;
  billingInfo: string;
  billingInfoDesc: string;
  plan: string;
  nextBilling: string;
  minutesWord: string;
  withPlan: string;
  basicPlan: string;
  giftsTitle: string;
  giftsDescription: string;
  redeem: string;
  trustpilot: string;
  trustpilotBonus: string;
  trustpilotDescription: string;

  // Modals common
  close: string;
  continue: string;
  cancel: string;

  // Account page missing properties
  profileInfo: string;
  editPaymentMethod: string;
  giftsSubtitle: string;
  profileInfoHint1: string;
  profileInfoHint2: string;
  fullName: string;
  emailNotEditable: string;
  country: string;
  selectCountry: string;
  businessName: string;
  businessWebsite: string;
  forgotPassword: string;
  confirmNewPassword: string;
  deleteAccount: string;
  deleteAccountDescription: string;
  deleteAccountBtn: string;
  currentSubscription: string;
  cancelSubscription: string;
  invoicesHistory: string;
  upgradePlan: string;
  protectedByStripe: string;

  // Delete account modal
  deleteAccountIntro1: string;
  deleteAccountIntro2: string;
  deleteAccountIntro3: string;
  deleteAccountIntro4: string;
  irreversibleAction: string;
  irreversiblePoint1: string;
  irreversiblePoint2: string;
  irreversiblePoint3: string;
  deleteMyAccount: string;

  // Purchase modal
  securePaymentDesc: string;
  oneTime: string;

  // Twilio integration modal
  invalidPhone: string;
  twilioSidLabel: string;
  twilioTokenLabel: string;

  // Error modal
  errorTitleDefault: string;

  // Success modal
  successTitleDefault: string;
  action: string;

  // Warning modal
  warningTitleDefault: string;

  // Delete account modal
  deleteAccountTitle: string;
  modalNotFoundFunction: string;
  modalPlanLimit: string;
  modalSolutionProgram: string;
  modalContactTeam: string;
  modalIrreversibleAction: string;
  modalAllDataDeleted: string;
  modalAllAgentsLost: string;
  modalAccountNotRecoverable: string;
  contactSupport: string;
  deleteMyAccountAndData: string;

  // Twilio integration modal
  twilioIntegrationTitle: string;
  phoneNumberLabel: string;
  invalidPhoneNumber: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  requiredField: string;
  import: string;

  // Twilio success modal
  closeWindow: string;

  // Purchase modal
  confirmPurchaseTitle: string;
  includes: string;
  securePayment: string;
  paymentInfoProtected: string;
  confirmPurchase: string;
  monthly: string;
  yearly: string;
  oneTimePayment: string;

  // Password validation messages
  invalidPassword: string;
  passwordsDoNotMatch: string;
  passwordUpdated: string;
  profileUpdated: string;
  errorUpdatingProfile: string;

  // Create Agent pages
  callType: string;
  language: string;
  voices: string;
  instructions: string;
  addActions: string;
  knowledgeBase: string;
  testAgent: string;
  connectPhoneNumber: string;
  throughTwilio: string;
  advancedSettings: string;
  creatingAgent: string;
  agentCreatedSuccessfully: string;
  finish: string;
  spanish: string;
  english: string;
  french: string;
  italian: string;
  listen: string;
  defineInstructions: string;
  defineInstructionsDesc: string;
  defineCustomGreeting: string;
  agentInstructions: string;
  chooseTemplate: string;
  customerService: string;
  sales: string;
  technicalSupport: string;
  writeHere: string;
  skip: string;
  defineActions: string;
  defineActionsDesc: string;
  defineKnowledge: string;
  defineKnowledgeDesc: string;
  enterPhoneNumber: string;
  receiveCall: string;
  selectCountryPrefix: string;
  enterTwilioNumber: string;
  assignNameLabel: string;
  chooseImportedNumber: string;
  chooseNumber: string;
  customizeAdvancedParams: string;
  customizeAdvancedParamsDesc: string;
  inactivityWaitTime: string;
  maxCallDuration: string;
  recordingNoticeMessage: string;
  recordingNoticeText: string;
  doNotCloseWindow: string;
  doNotCloseWindowDesc: string;
  phoneNumberRequired: string;
  pleaseEnterPhoneNumber: string;
  invalidValue: string;
  inactivityBetween0And300: string;
  durationBetween60And3600: string;
  audioError: string;
  couldNotPlayAudio: string;
  audioLoadProblem: string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage = signal<Language>({
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  });

  private translations: Record<string, Translations> = {
    es: {
      // Home page translations
      summary: 'Resumen',
      totalSuccessfulCalls: 'Total de llamadas exitosas',
      timeSaved: 'Tiempo ahorrado',
      minutesUsed: 'Minutos utilizados',
      activeAgents: 'Agentes activos',
      callsPerDay: 'Llamadas por día',
      agentName: 'Nombre del agente',
      type: 'Tipo',
      totalMinutesSpent: 'Minutos Totales',
      status: 'Estado',
      active: 'Activo',
      draft: 'Borrador',
      inbound: 'Entrante',
      outbound: 'Saliente',
      vsLastYear: 'vs año pasado',

      // Days of the week
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',

      // Days of the week abbreviations
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
      sat: 'Sáb',
      sun: 'Dom',

      // Navigation
      home: 'Inicio',
      agents: 'Agentes',
      numbers: 'Números',
      history: 'Historial',
      metrics: 'Métricas',
      settings: 'Ajustes',
      privateCommunity: 'Comunidad Privada',
      helpCenter: 'Centro de Ayuda',
      logout: 'Cerrar Sesión',

      // Promo card
      promoTitle: '¡Suma Tiempo extra sin pagar!',
      promoDescription: 'Completa retos sencillos y aumenta tus minutos disponibles al instante.',
      promoButton: 'Conseguir ahora',
      remainingMinutes: 'Minutos restantes',
      planPro: 'Plan Pro',

      // New Agents page
      yourAgents: 'Tus Agentes',
      createAgent: 'Crear Agente',
      agent: 'Agente',
      number: 'Número',
      edit: 'Editar',
      delete: 'Eliminar',
      stopPublishing: 'Dejar de Publicar',
      noAgentsYet: 'Aún no tienes agentes',
      createItNow: 'Créalo ahora',
      createAgentButton: 'Crear Agente',

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
      draftStatus: 'Borrador',

      // Account/Settings page
      profile: 'Perfil',
      security: 'Seguridad',
      billing: 'Facturación',
      gifts: 'Regalos',
      personalInfo: 'Información Personal',
      personalInfoDesc: 'Actualiza tu información personal aquí.',
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      saveChanges: 'Guardar cambios',
      changePassword: 'Cambiar contraseña',
      changePasswordDesc: 'Actualiza tu contraseña para mantener tu cuenta segura.',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar contraseña',
      updatePassword: 'Actualizar contraseña',
      billingInfo: 'Información de Facturación',
      billingInfoDesc: 'Gestiona tu plan y facturación.',
      plan: 'Plan',
      nextBilling: 'Próxima facturación',
      minutesWord: 'Minutos',
      withPlan: 'con el plan',
      basicPlan: 'Básico',
      giftsTitle: 'Regalos',
      giftsDescription: 'Los minutos extra que ganes y no uses el mes siguiente no expirarán. ¡Canjea tus recompensas ahora para no olvidarte!',
      redeem: 'Canjear',
      trustpilot: 'Trustpilot',
      trustpilotBonus: '+10 min',
      trustpilotDescription: 'Gana 10 minutos adicionales dejando una reseña sobre Llámalo en Trustpilot. Una vez publicada, envíanos una captura de pantalla en el chat junto con el email de tu cuenta y añadiremos los minutos extra automáticamente.',

      // Modals common
      close: 'Cerrar',
      continue: 'Continuar',
      cancel: 'Cancelar',

      // Account page missing properties
      profileInfo: 'Información del perfil',
      editPaymentMethod: 'Editar método de pago',
      giftsSubtitle: 'Regalos y bonificaciones',
      profileInfoHint1: 'Esta información se utiliza para personalizar tu experiencia',
      profileInfoHint2: 'y para contactarte sobre tu cuenta',
      fullName: 'Nombre completo',
      emailNotEditable: 'El email no se puede editar',
      country: 'País',
      selectCountry: 'Seleccionar país',
      businessName: 'Nombre del negocio',
      businessWebsite: 'Sitio web del negocio',
      forgotPassword: '¿Olvidaste tu contraseña?',
      confirmNewPassword: 'Confirmar nueva contraseña',
      deleteAccount: 'Eliminar cuenta',
      deleteAccountDescription: 'Esta acción no se puede deshacer',
      deleteAccountBtn: 'Eliminar cuenta',
      currentSubscription: 'Suscripción actual',
      cancelSubscription: 'Cancelar suscripción',
      invoicesHistory: 'Historial de facturas',
      upgradePlan: 'Actualizar plan',
      protectedByStripe: 'Protegido por Stripe',

      // Delete account modal
      deleteAccountIntro1: 'Estás a punto de eliminar permanentemente tu cuenta.',
      deleteAccountIntro2: 'Esta acción eliminará todos tus datos, agentes,',
      deleteAccountIntro3: 'configuraciones y historial de llamadas.',
      deleteAccountIntro4: 'No podrás recuperar esta información.',
      irreversibleAction: 'Esta acción es irreversible:',
      irreversiblePoint1: 'Todos tus agentes serán eliminados',
      irreversiblePoint2: 'Se perderá todo el historial de llamadas',
      irreversiblePoint3: 'No podrás acceder a tu cuenta nuevamente',
      deleteMyAccount: 'Sí, eliminar mi cuenta',

      // Purchase modal
      securePaymentDesc: 'Tu información de pago está protegida',
      oneTime: 'Pago único',

      // Twilio integration modal
      invalidPhone: 'Número de teléfono inválido',
      twilioSidLabel: 'Account SID de Twilio',
      twilioTokenLabel: 'Auth Token de Twilio',

      // Error modal
      errorTitleDefault: 'Ha ocurrido un error',

      // Success modal
      successTitleDefault: '¡Éxito!',
      action: 'Acción',

      // Warning modal
      warningTitleDefault: 'Advertencia',

      // Delete account modal
      deleteAccountTitle: 'Estás a punto de eliminar tu cuenta y todos los datos',
      modalNotFoundFunction: '¿No encontraste la función que necesitabas?',
      modalPlanLimit: '¿O tal vez has alcanzado el límite de uso de tu plan?',
      modalSolutionProgram: 'Probablemente podemos ofrecer una solución para que puedas seguir disfrutando del producto.',
      modalContactTeam: 'Contacta con nuestro equipo y te ayudaremos a cubrir tus necesidades.',
      modalIrreversibleAction: 'Esta acción es irreversible',
      modalAllDataDeleted: '• Todos tus datos serán eliminados',
      modalAllAgentsLost: '• Todos tus agentes se perderán',
      modalAccountNotRecoverable: '• No podrás recuperar tu cuenta',
      contactSupport: 'Contactar soporte',
      deleteMyAccountAndData: 'Eliminar mi cuenta y todos mis datos',

      // Twilio integration modal
      twilioIntegrationTitle: 'Integración con Twilio',
      phoneNumberLabel: 'Número de teléfono *',
      invalidPhoneNumber: 'Número inválido (mín 6, máx 15 dígitos)',
      twilioAccountSid: 'Twilio Account SID',
      twilioAuthToken: 'Twilio Auth Token',
      requiredField: 'Este campo es obligatorio.',
      import: 'Importar',

      // Twilio success modal
      closeWindow: 'Cerrar ventana',

      // Purchase modal
      confirmPurchaseTitle: 'Confirmar compra',
      includes: 'Incluye',
      securePayment: 'Pago seguro',
      paymentInfoProtected: 'Tu información de pago está protegida',
      confirmPurchase: 'Confirmar compra',
      monthly: 'Mensual',
      yearly: 'Anual',
      oneTimePayment: 'Pago único',

      // Password validation messages
      invalidPassword: 'La contraseña debe tener al menos 8 caracteres',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      passwordUpdated: 'Contraseña actualizada correctamente',
      profileUpdated: 'Perfil actualizado correctamente',
      errorUpdatingProfile: 'Error al actualizar el perfil',

      // Create Agent pages
      callType: 'Tipo de llamada',
      language: 'Idioma',
      voices: 'Voces',
      instructions: 'Instrucciones',
      addActions: 'Añadir acciones',
      knowledgeBase: 'Base de conocimiento',
      testAgent: 'Probar agente',
      connectPhoneNumber: 'Conectar número de teléfono',
      throughTwilio: 'A través de Twilio',
      advancedSettings: 'Configuración avanzada',
      creatingAgent: 'Creando agente...',
      agentCreatedSuccessfully: '¡Agente creado exitosamente!',
      finish: 'Finalizar',
      spanish: 'Español',
      english: 'Inglés',
      french: 'Francés',
      italian: 'Italiano',
      listen: 'Escuchar',
      defineInstructions: 'Define las instrucciones',
      defineInstructionsDesc: 'Define las instrucciones que seguirá tu agente durante las llamadas.',
      defineCustomGreeting: 'Define un saludo personalizado',
      agentInstructions: 'Instrucciones del agente',
      chooseTemplate: 'Elegir plantilla',
      customerService: 'Atención al cliente',
      sales: 'Ventas',
      technicalSupport: 'Soporte técnico',
      writeHere: 'Escribe aquí...',
      skip: 'Omitir',
      defineActions: 'Define las acciones',
      defineActionsDesc: 'Define las acciones que puede realizar tu agente.',
      defineKnowledge: 'Define la base de conocimiento',
      defineKnowledgeDesc: 'Añade información que tu agente puede consultar durante las llamadas.',
      enterPhoneNumber: 'Ingresa tu número de teléfono',
      receiveCall: 'Recibir llamada',
      selectCountryPrefix: 'Selecciona el prefijo del país',
      enterTwilioNumber: 'Ingresa el número de Twilio',
      assignNameLabel: 'Asignar nombre o etiqueta',
      chooseImportedNumber: 'Elegir número importado*',
      chooseNumber: 'Elegir número',
      customizeAdvancedParams: 'Personaliza los parámetros avanzados de llamada',
      customizeAdvancedParamsDesc: 'Personaliza los parámetros avanzados de llamada para adaptarlos a tus necesidades, como tiempos de espera, duración máxima o avisos de grabación.',
      inactivityWaitTime: 'Tiempo de espera por inactividad',
      maxCallDuration: 'Duración máxima de llamada',
      recordingNoticeMessage: 'Mensaje de aviso de grabación',
      recordingNoticeText: 'Texto de aviso de grabación',
      doNotCloseWindow: 'No cerrar ventana',
      doNotCloseWindowDesc: 'No cierres esta ventana mientras se crea el agente.',
      phoneNumberRequired: 'El número de teléfono es obligatorio',
      pleaseEnterPhoneNumber: 'Por favor, ingresa un número de teléfono válido',
      invalidValue: 'Valor inválido',
      inactivityBetween0And300: 'El tiempo de inactividad debe estar entre 0 y 300 segundos',
      durationBetween60And3600: 'La duración debe estar entre 60 y 3600 segundos',
      audioError: 'Error de audio',
      couldNotPlayAudio: 'No se pudo reproducir el audio',
      audioLoadProblem: 'Problema al cargar el audio'
    },
    en: {
      // Home page translations
      summary: 'Summary',
      totalSuccessfulCalls: 'Total successful calls',
      timeSaved: 'Time saved',
      minutesUsed: 'Minutes used',
      activeAgents: 'Active agents',
      callsPerDay: 'Calls per day',
      agentName: 'Agent name',
      type: 'Type',
      totalMinutesSpent: 'Total Minutes Spent',
      status: 'Status',
      active: 'Active',
      draft: 'Draft',
      inbound: 'Inbound',
      outbound: 'Outbound',
      vsLastYear: 'vs last year',

      // Days of the week
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',

      // Days of the week abbreviations
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',

      // Navigation
      home: 'Home',
      agents: 'Agents',
      numbers: 'Numbers',
      history: 'History',
      metrics: 'Metrics',
      settings: 'Settings',
      privateCommunity: 'Private Community',
      helpCenter: 'Help Center',
      logout: 'Logout',

      // Promo card
      promoTitle: 'Try Llámalo for free!',
      promoDescription: 'Create your first voice agent and get 10 free minutes to test all features.',
      promoButton: 'Start for free',
      remainingMinutes: 'Remaining minutes',
      planPro: 'Pro Plan',

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
      // Agent statuses
      activeStatus: 'Active',
      draftStatus: 'Draft',

      // Account/Settings page
      profile: 'Profile',
      security: 'Security',
      billing: 'Billing',
      gifts: 'Gifts',
      personalInfo: 'Personal Information',
      personalInfoDesc: 'Update your personal information here.',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      saveChanges: 'Save changes',
      changePassword: 'Change password',
      changePasswordDesc: 'Update your password to keep your account secure.',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      updatePassword: 'Update password',
      billingInfo: 'Billing Information',
      billingInfoDesc: 'Manage your plan and billing.',
      plan: 'Plan',
      nextBilling: 'Next billing',
      minutesWord: 'Minutes',
      withPlan: 'with the plan',
      basicPlan: 'Basic',
      giftsTitle: 'Gifts',
      giftsDescription: 'Extra minutes you earn and don\'t use the following month will not expire. Redeem your rewards now so you don\'t forget!',
      redeem: 'Redeem',
      trustpilot: 'Trustpilot',
      trustpilotBonus: '+10 min',
      trustpilotDescription: 'Earn 10 additional minutes by leaving a review about Llámalo on Trustpilot. Once published, send us a screenshot in the chat along with your account\'s email and we\'ll add the extra minutes automatically.',

      // Modals common
      close: 'Close',
      continue: 'Continue',
      cancel: 'Cancel',

      // Account page missing properties
      profileInfo: 'Profile information',
      editPaymentMethod: 'Edit payment method',
      giftsSubtitle: 'Gifts and bonuses',
      profileInfoHint1: 'This information is used to personalize your experience',
      profileInfoHint2: 'and to contact you about your account',
      fullName: 'Full name',
      emailNotEditable: 'Email cannot be edited',
      country: 'Country',
      selectCountry: 'Select country',
      businessName: 'Business name',
      businessWebsite: 'Business website',
      forgotPassword: 'Forgot password?',
      confirmNewPassword: 'Confirm new password',
      deleteAccount: 'Delete account',
      deleteAccountDescription: 'This action cannot be undone',
      deleteAccountBtn: 'Delete account',
      currentSubscription: 'Current subscription',
      cancelSubscription: 'Cancel subscription',
      invoicesHistory: 'Invoices history',
      upgradePlan: 'Upgrade plan',
      protectedByStripe: 'Protected by Stripe',

      // Delete account modal
      deleteAccountIntro1: 'You are about to permanently delete your account.',
      deleteAccountIntro2: 'This action will delete all your data, agents,',
      deleteAccountIntro3: 'settings and call history.',
      deleteAccountIntro4: 'You will not be able to recover this information.',
      irreversibleAction: 'This action is irreversible:',
      irreversiblePoint1: 'All your agents will be deleted',
      irreversiblePoint2: 'All call history will be lost',
      irreversiblePoint3: 'You will not be able to access your account again',
      deleteMyAccount: 'Yes, delete my account',

      // Purchase modal
      securePaymentDesc: 'Your payment information is protected',
      oneTime: 'One-time',

      // Twilio integration modal
      invalidPhone: 'Invalid phone number',
      twilioSidLabel: 'Twilio Account SID',
      twilioTokenLabel: 'Twilio Auth Token',

      // Error modal
      errorTitleDefault: 'An error occurred',

      // Success modal
      successTitleDefault: 'Success!',
      action: 'Action',

      // Warning modal
      warningTitleDefault: 'Warning',

      // Delete account modal
      deleteAccountTitle: 'You are about to delete your account and all data',
      modalNotFoundFunction: 'Couldn\'t find the feature you needed?',
      modalPlanLimit: 'Or maybe you\'ve reached your plan\'s usage limit?',
      modalSolutionProgram: 'We can likely offer a solution so you can keep enjoying the product.',
      modalContactTeam: 'Contact our team and we\'ll help cover your needs.',
      modalIrreversibleAction: 'This action is irreversible',
      modalAllDataDeleted: '• All your data will be deleted',
      modalAllAgentsLost: '• All your agents will be lost',
      modalAccountNotRecoverable: '• You won\'t be able to recover your account',
      contactSupport: 'Contact support',
      deleteMyAccountAndData: 'Delete my account and all my data',

      // Twilio integration modal
      twilioIntegrationTitle: 'Twilio Integration',
      phoneNumberLabel: 'Phone number *',
      invalidPhoneNumber: 'Invalid number (min 6, max 15 digits)',
      twilioAccountSid: 'Twilio Account SID',
      twilioAuthToken: 'Twilio Auth Token',
      requiredField: 'This field is required.',
      import: 'Import',

      // Twilio success modal
      closeWindow: 'Close window',

      // Purchase modal
      confirmPurchaseTitle: 'Confirm purchase',
      includes: 'Includes',
      securePayment: 'Secure payment',
      paymentInfoProtected: 'Your payment information is protected',
      confirmPurchase: 'Confirm purchase',
      monthly: 'Monthly',
      yearly: 'Yearly',
      oneTimePayment: 'One-time payment',

      // Password validation messages
      invalidPassword: 'Password must be at least 8 characters long',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordUpdated: 'Password updated successfully',
      profileUpdated: 'Profile updated successfully',
      errorUpdatingProfile: 'Error updating profile',

      // Create Agent pages
      callType: 'Call type',
      language: 'Language',
      voices: 'Voices',
      instructions: 'Instructions',
      addActions: 'Add actions',
      knowledgeBase: 'Knowledge base',
      testAgent: 'Test agent',
      connectPhoneNumber: 'Connect phone number',
      throughTwilio: 'Through Twilio',
      advancedSettings: 'Advanced settings',
      creatingAgent: 'Creating agent...',
      agentCreatedSuccessfully: 'Agent created successfully!',
      finish: 'Finish',
      spanish: 'Spanish',
      english: 'English',
      french: 'French',
      italian: 'Italian',
      listen: 'Listen',
      defineInstructions: 'Define instructions',
      defineInstructionsDesc: 'Define the instructions your agent will follow during calls.',
      defineCustomGreeting: 'Define a custom greeting',
      agentInstructions: 'Agent instructions',
      chooseTemplate: 'Choose template',
      customerService: 'Customer service',
      sales: 'Sales',
      technicalSupport: 'Technical support',
      writeHere: 'Write here...',
      skip: 'Skip',
      defineActions: 'Define actions',
      defineActionsDesc: 'Define the actions your agent can perform.',
      defineKnowledge: 'Define knowledge base',
      defineKnowledgeDesc: 'Add information your agent can consult during calls.',
      enterPhoneNumber: 'Enter your phone number',
      receiveCall: 'Receive call',
      selectCountryPrefix: 'Select country prefix',
      enterTwilioNumber: 'Enter Twilio number',
      assignNameLabel: 'Assign name or label',
      chooseImportedNumber: 'Choose imported number*',
      chooseNumber: 'Choose number',
      customizeAdvancedParams: 'Customize advanced call parameters',
      customizeAdvancedParamsDesc: 'Customize advanced call parameters to adapt them to your needs, such as wait times, maximum duration or recording notices.',
      inactivityWaitTime: 'Inactivity wait time',
      maxCallDuration: 'Maximum call duration',
      recordingNoticeMessage: 'Recording notice message',
      recordingNoticeText: 'Recording notice text',
      doNotCloseWindow: 'Do not close window',
      doNotCloseWindowDesc: 'Do not close this window while the agent is being created.',
      phoneNumberRequired: 'Phone number is required',
      pleaseEnterPhoneNumber: 'Please enter a valid phone number',
      invalidValue: 'Invalid value',
      inactivityBetween0And300: 'Inactivity time must be between 0 and 300 seconds',
      durationBetween60And3600: 'Duration must be between 60 and 3600 seconds',
      audioError: 'Audio error',
      couldNotPlayAudio: 'Could not play audio',
      audioLoadProblem: 'Problem loading audio'
    }
  };

  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }

  getAvailableLanguages(): Language[] {
    return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
  }

  getTranslations(): Translations {
    return this.translations[this.currentLanguage().code];
  }

  initializeLanguage(): void {
    // Initialize language from localStorage or default to Spanish
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        const language = this.getAvailableLanguages().find(lang => lang.code === savedLanguage);
        if (language) {
          this.setLanguage(language);
        }
      }
    }
  }

  selectedLanguage(): Language {
    return this.currentLanguage();
  }
}