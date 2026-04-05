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
  vsLastWeek: string;
  totalCalls: string;
  successfulCalls: string;
  totalMinutes: string;
  minutes: string;
  successRate: string;
  planStarter: string;
  boostEfficiency: string;
  unlockAdvancedFeatures: string;
  upgradePlan: string;
  dashboard: string;
  configuration: string;

  // Agents page translations
  searchAgents: string;
  agentNameHeader: string;
  phoneNumberHeader: string;
  noNumberAssigned: string;
  inactive: string;
  publishAgain: string;
  noAgentsCreated: string;

  // Numbers page translations
  searchNumbers: string;
  phoneNumberHeaderNumbers: string;
  phoneNumberImportLabel: string;
  twilioAccountSidLabel: string;
  twilioAccountTokenLabel: string;
  phoneNumberPlaceholder: string;
  twilioSidPlaceholder: string;
  twilioTokenPlaceholder: string;
  noImportedNumbers: string;
  importFirstNumberNow: string;
  validating: string;

  // Metrics page translations
  callsText: string;
  totalCallsLabel: string;
  averagePerDayLabel: string;
  peakHoursDataNotAvailable: string;
  waitingForEndpointData: string;
  millisecondsLabel: string;
  minutesLabel: string;
  secondsLabel: string;
  costPerMinute: string;
  subscription: string;
  peakHours: string;
  systemStatus: string;
  starterPlan: string;
  for7Days: string;
  successEvaluation: string;
  title: string;
  desktopMobileView: string;
  for30Days: string;
  compactHorizontalBarChart: string;
  statisticalSummary: string;
  desktopAreaView: string;
  semicircularMeter: string;
  semicircularGiant: string;
  semicircleBackground: string;
  dynamicProgressArc: string;
  progressMarker: string;
  gradientDefinition: string;
  simpleStriped: string;
  fullBandEmptyBand: string;
  daysOfWeek: string;
  desktopAndMobileHiddenTablet: string;
  barChartWithRealData: string;
  hourBars: string;
  hourLabelsBelowChart: string;
  countriesMovedFromOriginal: string;
  callCompletionReason: string;
  contentBasedOnPeakHoursData: string;
  tooltipHover: string;
  tooltipArrow: string;
  statusIndicator: string;
  messageWhenNoData: string;
  systemStatusTabletOnly: string;

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
  knowledgeBase: string;
  knowledgeBaseEmpty: string;
  knowledgeBaseMoreResults: string;
  knowledgeBaseVia: string;
  knowledgeBasePdf: string;
  knowledgeBaseWeb: string;
  knowledgeBaseText: string;
  knowledgeBaseOther: string;
  knowledgeBaseAddPdf: string;
  knowledgeBaseAddWeb: string;
  knowledgeBaseAddText: string;
  knowledgeBaseNoDocuments: string;
  knowledgeBaseNoDocumentsYet: string;
  knowledgeBaseSearchPlaceholder: string;
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

  // Topbar / invites
  noNews: string;
  /** Fechas relativas en el listado de noticias (placeholders {{n}} = minutos u horas) */
  newsDateJustNow: string;
  newsDateOneMinuteAgo: string;
  newsDateMinutesAgo: string;
  newsDateOneHourAgo: string;
  newsDateHoursAgo: string;
  newsDateYesterday: string;
  inviteTeamTitle: string;
  inviteTeamDescription: string;
  inviteEmailPlaceholder: string;
  sendInvite: string;
  invitedMembers: string;
  noInvitesYet: string;
  copyLink: string;
  savedDraftLabel: string;
  /** Banner inferior: pregunta antes de recuperar borrador de creación de agente */
  continueAgentCreationQuestion: string;
  agentLabelTopbar: string;
  noName: string;
  stepLabel: string;
  deleteLabel: string;
  openMenu: string;

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
  fromTwilio: string;
  fromSipTrunk: string;
  importNumberFromTwilio: string;
  labelPlaceholder: string;
  twilioAccountSidPlaceholder: string;
  routingRegionConfig: string;
  routingRegionDesc: string;
  comingSoon: string;

  // Historial page
  searchNumber: string;
  resolved: string;
  pending: string;
  selectContactToView: string;
  back: string;

  // Common
  new: string;

  // 404 / Not Found page
  notFoundTitle: string;
  notFoundBackToDashboard: string;
  allRightsReserved: string;

  // Metrics page
  last7Days: string;
  last30Days: string;
  thisMonth: string;
  lastYear: string;
  all: string;
  agent1: string;
  agent2: string;

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
  connections: string;
  manageConnections: string;
  twilioIntegrationDesc: string;
  editTwilioAccount: string;
  addTwilioAccount: string;
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
  redeemed: string;
  trustpilot: string;
  trustpilotBonus: string;
  trustpilotDescription: string;
  gift2Title: string;
  gift2Bonus: string;
  gift2Description: string;
  gift2SocialInstagram: string;
  gift2SocialLinkedIn: string;
  gift2SocialX: string;
  gift3Title: string;
  gift3Bonus: string;
  gift3Description: string;
  giftRedeemedSuccess: string;

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
  addAccount: string;
  editAccount: string;
  noConnections: string;
  cancelBtn: string;
  saveBtn: string;
  importHelp: string;
  deleteAccountDescription: string;
  deleteAccountBtn: string;
  currentSubscription: string;
  cancelSubscription: string;
  invoicesHistory: string;

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
  accountDeletionScheduled: string;
  accountDeletionScheduledMessage: string;
  accountDeletionScheduledDetails: string;
  accountDeletionRecoveryInfo: string;
  accountDeletionError: string;
  accountDeletionUnauthorized: string;
  accountDeletionNotFound: string;
  accountDeletionBadRequest: string;
  accountDeletionScheduledWarning: string;
  daysRemaining: string;
  accountDeletionCancelInfo: string;
  deleteAccountRecoveryPeriod: string;

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

  // Knowledge base page
  loadingKnowledgeSources: string;
  refreshDocuments: string;
  typeColumn: string;
  statusColumn: string;
  fragmentsAndWords: string;
  fragments: string;
  words: string;
  statusProcessing: string;
  statusCompleted: string;
  statusFailed: string;
  statusError: string;
  viewPreview: string;
  downloadKnowledgeFile: string;
  errorDownloadingKnowledge: string;
  uploadLimits: string;
  pdfMax: string;
  urlMax: string;
  textMax: string;
  addWebSourceTitle: string;
  addTextTitle: string;
  manualTextDefault: string;
  noDocumentsTitle: string;
  noDocumentsDescription: string;
  knowledgeBaseLoadError: string;
  retry: string;
  deleteDocument: string;
  dateColumn: string;
  actionsColumn: string;
  pdfMaxError: string;
  urlMaxError: string;
  textMaxError: string;
  errorNoFileInfo: string;
  errorUploadingFile: string;
  errorCreatingWeb: string;
  errorServerResponse: string;
  errorDeletingKnowledge: string;
  urlTooLong: string;
  textTooLong: string;

  // Create agent steps
  completeAgent: string;
  chooseAgentNameDesc: string;
  agentNameLabel: string;
  agentNamePlaceholder: string;
  callTypeTitle: string;
  whatCallType: string;
  notAvailable: string;
  instructionsStepTitle: string;
  defineInstructionsForAgent: string;
  customGreetingLabel: string;
  greetingPlaceholder: string;
  generateWithAI: string;
  generateInstructionsWithAI: string;
  describeAgentBehavior: string;
  exampleInstructionsPlaceholder: string;
  generating: string;
  generateBtn: string;
  viewFullTextTitle: string;
  externalActionsMake: string;
  makeExternalDescription: string;
  makeComingSoon: string;
  connectShopifyTitle: string;
  linkStoreDescription: string;
  shopifyConnectDesc: string;
  connected: string;
  connect: string;
  connectPhoneTitle: string;
  configureTwilioDescription: string;
  accountConnected: string;
  connectedAccounts: string;
  accountValidated: string;
  connectTwilioAccount: string;
  closeBtn: string;
  openBtn: string;
  /** Subtítulo Twilio: exactamente una cuenta */
  twilioConnectedSummaryOne: string;
  /** Parte plural: "N " + suffix → "3 cuentas conectadas" */
  twilioConnectedSummaryManySuffix: string;
  accountIdLabel: string;
  changeBtn: string;
  availableNumbers: string;
  connectNewAccount: string;
  testAgentTitle: string;
  talkToAgentDescription: string;
  remainingTime: string;
  backToAgents: string;
  agentReadyDescription: string;
  languageAndVoice: string;
  chooseCountryAndVoice: string;
  countryLabel: string;

  // Test agent step states
  agentStateThinking: string;
  agentStateSpeaking: string;
  agentStateDone: string;
  agentStateWaiting: string;
  connectionConnecting: string;
  connectionEnded: string;
  speakToStart: string;
  connectingToAgent: string;
  testCall: string;
  mutedLabel: string;
  microphoneLabel: string;
  endCallLabel: string;
  tryAgainLabel: string;

  // Account page extra
  acceptMarketing: string;
  accountDeletionUntilPermanent: string;
  accountScheduledDeletionYouHave: string;
  selectAvatar: string;
  uploadMyPhoto: string;
  contact: string;
  contactSubtitle: string;
  contactEmpty: string;
  contactMessageLabel: string;
  contactMessagePlaceholder: string;
  contactMessageButton: string;
  contactMessageRequired: string;
  contactMessageSuccess: string;
  contactMeetingTitle: string;
  contactMeetingSubtitle: string;
  contactMeetingDateLabel: string;
  contactMeetingTimeLabel: string;
  contactMeetingButton: string;
  contactMeetingRequired: string;
  contactMeetingSuccess: string;

  // Upgrade plan page
  upgradeTitle: string;
  upgradeSubtitle: string;
  perMonth: string;
  whatIncluded: string;
  everythingInFreePlus: string;
  everythingInProPlus: string;
  comparisonTitle: string;
  comparisonSubtitle: string;
  choosePlan: string;
  upgradePlanFree: string;
  upgradePlanPro: string;
  upgradePlanPremium: string;
  upgradePlanFreeDesc: string;
  upgradePlanProDesc: string;
  upgradePlanPremiumDesc: string;
  upgradePlanFreeButton: string;
  upgradePlanProButton: string;
  upgradePlanPremiumButton: string;
  upgradeFeatureFree1: string;
  upgradeFeatureFree2: string;
  upgradeFeatureFree3: string;
  upgradeFeatureFree4: string;
  upgradeFeatureFree5: string;
  upgradeFeaturePro1: string;
  upgradeFeaturePro2: string;
  upgradeFeaturePro3: string;
  upgradeFeaturePro4: string;
  upgradeFeaturePro5: string;
  upgradeFeaturePremium1: string;
  upgradeFeaturePremium2: string;
  upgradeFeaturePremium3: string;
  upgradeFeaturePremium4: string;
  upgradeFeaturePremium5: string;
  upgradeComp1: string;
  upgradeComp2: string;
  upgradeComp3: string;
  upgradeComp4: string;
  upgradeComp5: string;
  upgradeComp6: string;
  upgradeComp7: string;
  upgradeComp8: string;
  upgradeComp9: string;
  upgradeComp10: string;

  // Company setup / onboarding
  skipLabel: string;
  createFirstAgent: string;
  whatDoYouWantToAchieve: string;
  youCanSelectMultiple: string;
  customerServiceInbound: string;
  customerServiceInboundDesc: string;
  cartRecovery: string;
  cartRecoveryDesc: string;
  outboundSales: string;
  outboundSalesDesc: string;
  confirmationsReminders: string;
  confirmationsRemindersDesc: string;
  otherOption: string;
  howDidYouFindUs: string;
  socialNetworks: string;
  youtube: string;
  googleSearch: string;
  communities: string;
  eventWebinar: string;
  friendRecommendation: string;
  welcomeToLlamalo: string;
  letAiSpeakForYou: string;
  startButton: string;

  // Auth (login / register)
  authWelcomeBack: string;
  authLoginTitle: string;
  authLoginSubtitle: string;
  authLoginButton: string;
  authFullName: string;
  authEmail: string;
  authPassword: string;
  authCountry: string;
  authSelectCountry: string;
  authMarketingConsentLlamalo: string;
  authRememberMe: string;
  authOrContinueWith: string;
  authTermsPrefix: string;
  authTermsConditions: string;
  authTermsAnd: string;
  authTermsPrivacy: string;
  authTermsSuffix: string;
  authPlaceholderName: string;
  authPlaceholderEmail: string;
  authCountryES: string;
  authCountryFR: string;
  authCountryIT: string;
  authCountryPT: string;
  authCountryDE: string;
  authCountryGB: string;
  authCountryUS: string;
  authCountryMX: string;
  authCountryAR: string;
  authCountryCO: string;
  authErrorEmailPassword: string;
  authErrorLogin: string;
  authSuccessLogin: string;
  authErrorGetProfile: string;
  authErrorFillAll: string;
  authErrorMarketingConsent: string;
  authSuccessVerifyEmail: string;
  authErrorRegister: string;
  authErrorRecoverEmail: string;
  authSuccessRecover: string;
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
      totalSuccessfulCalls: 'Total de llamadas',
      timeSaved: 'Tiempo ahorrado',
      minutesUsed: 'Minutos utilizados',
      activeAgents: 'Tus agentes',
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
      vsLastWeek: 'vs semana pasada',
      totalCalls: 'Total de llamadas',
      successfulCalls: 'Llamadas exitosas',
      totalMinutes: 'Minutos Totales',
      minutes: 'Minutos',
      successRate: 'Tasa de éxito de las llamadas',
      planStarter: 'Plan Starter',
      boostEfficiency: 'Maximiza tu Eficiencia',
      unlockAdvancedFeatures: 'Desbloquea funciones avanzadas de automatización',
      upgradePlan: 'Mejorar Plan',
      dashboard: 'Panel de control',
      configuration: 'Configuración',

      // Agents page translations
      searchAgents: 'Buscar agentes...',
      agentNameHeader: 'Nombre',
      phoneNumberHeader: 'Número teléfono',
      noNumberAssigned: 'Sin número asignado',
      inactive: 'Inactivo',
      publishAgain: 'Publicar de nuevo',
      noAgentsCreated: 'Aún no tiene agentes creados',

      // Numbers page translations
      searchNumbers: 'Buscar números...',
      phoneNumberHeaderNumbers: 'Número teléfono',
      phoneNumberImportLabel: 'Número de teléfono',
      twilioAccountSidLabel: 'SID de cuenta Twilio',
      twilioAccountTokenLabel: 'Token de cuenta Twilio',
      phoneNumberPlaceholder: '630 00 00 00',
      twilioSidPlaceholder: 'SID de cuenta Twilio',
      twilioTokenPlaceholder: 'Token de cuenta Twilio',
      noImportedNumbers: 'Aún no tiene números de teléfono importados',
      importFirstNumberNow: '¡Importa tu primer número ahora!',
      validating: 'Validando...',

      // Metrics page translations
      callsText: 'llamadas',
      totalCallsLabel: 'Total llamadas',
      averagePerDayLabel: 'Promedio/día',
      peakHoursDataNotAvailable: 'Datos de horas pico no disponibles',
      waitingForEndpointData: 'Esperando datos del endpoint...',
      millisecondsLabel: 'MS',
      minutesLabel: 'M',
      secondsLabel: 'S',
      costPerMinute: 'Coste por minuto',
      subscription: 'Suscripción',
      peakHours: 'Llamadas por hora',
      averageCallDuration: 'Duración media',
      systemStatus: 'Estado del sistema',
      starterPlan: 'Starter',
      for7Days: 'Para 7 días',
      successEvaluation: 'Evaluación de éxito',
      title: 'Título',
      desktopMobileView: 'Vista móvil',
      for30Days: 'Para 30 días',
      compactHorizontalBarChart: 'Gráfico de barras horizontales compacto',
      statisticalSummary: 'Resumen estadístico compacto',
      desktopAreaView: 'Vista desktop: Gráfico de área original',
      semicircularMeter: 'Medidor semicircular dinámico',
      semicircularGiant: 'Medidor semicircular gigante',
      semicircleBackground: 'Fondo del semicírculo',
      dynamicProgressArc: 'Arco de progreso dinámico',
      progressMarker: 'Marcador al final del progreso',
      gradientDefinition: 'Definición del gradiente',
      simpleStriped: 'Rayado simple: banda llena y banda vacía',
      fullBandEmptyBand: 'banda llena y banda vacía',
      daysOfWeek: 'Días de la semana',
      desktopAndMobileHiddenTablet: 'desktop y móvil, oculto en tablet',
      barChartWithRealData: 'Gráfico de barras con datos reales',
      hourBars: 'Barras de horas',
      hourLabelsBelowChart: 'Etiquetas de horas debajo del gráfico',
      countriesMovedFromOriginal: 'Países (movido desde su recuadro original)',
      callCompletionReason: 'Razón de finalización de la llamada',
      contentBasedOnPeakHoursData: 'Contenido basado en si hay datos de horas pico',
      tooltipHover: 'Tooltip hover',
      tooltipArrow: 'Flecha del tooltip',
      statusIndicator: 'Indicador de estado',
      messageWhenNoData: 'Mensaje cuando no hay datos',
      systemStatusTabletOnly: 'solo en tablets (md)',

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
      knowledgeBase: 'Base de conocimientos',
      knowledgeBaseEmpty: 'Esta sección está vacía por ahora.',
      knowledgeBaseMoreResults: 'más resultados',
      knowledgeBaseVia: 'vía',
      knowledgeBasePdf: 'PDF',
      knowledgeBaseWeb: 'Web',
      knowledgeBaseText: 'Texto',
      knowledgeBaseOther: 'Otro',
      knowledgeBaseAddPdf: 'Añadir PDF',
      knowledgeBaseAddWeb: 'Añadir Web',
      knowledgeBaseAddText: 'Añadir Texto',
      knowledgeBaseNoDocuments: 'No se encontraron documentos',
      knowledgeBaseNoDocumentsYet: 'Aún no tienes documentos.',
      knowledgeBaseSearchPlaceholder: 'Buscar documentos...',
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

      // Topbar / invites
      noNews: 'No hay noticias',
      newsDateJustNow: 'Justo ahora',
      newsDateOneMinuteAgo: 'hace 1 minuto',
      newsDateMinutesAgo: 'hace {{n}} minutos',
      newsDateOneHourAgo: 'hace 1 hora',
      newsDateHoursAgo: 'hace {{n}} horas',
      newsDateYesterday: 'Ayer',
      inviteTeamTitle: 'Invita a tu equipo y trabaja con ellos',
      inviteTeamDescription:
        'Comparte tu enlace con tu equipo y colaboradores. Cuando empiecen a usar Llamalo, recibirás minutos extra en tu cuenta.',
      inviteEmailPlaceholder: 'Email o usuario',
      sendInvite: 'Enviar invitación',
      invitedMembers: 'Miembros invitados',
      noInvitesYet: 'Todavía no hay invitaciones. Empieza enviando tu primera invitación.',
      copyLink: 'Copiar enlace',
      savedDraftLabel: 'Borrador guardado',
      continueAgentCreationQuestion: '¿Deseas seguir con la creación del agente?',
      agentLabelTopbar: 'Agente',
      noName: 'Sin nombre',
      stepLabel: 'Paso',
      deleteLabel: 'Eliminar',
      openMenu: 'Abrir menú',

      // New Agents page
      yourAgents: 'Tus Agentes',
      createAgent: 'Crear Agente',
      agent: 'Agente',
      number: 'ID',
      edit: 'Editar',
      delete: 'Eliminar',
      stopPublishing: 'Dejar de Publicar',
      noAgentsYet: 'Aún no tienes agentes',
      createItNow: 'Créalo ahora',
      createAgentButton: 'Crear Agente',

      // Numbers page
      importNumber: 'Importar Numero',
      importedFrom: 'Importado de',
      clientNumber: 'ID Cliente',
      storeNumber: 'Numero de tienda',
      label: 'Etiqueta',
      fromTwilio: 'Desde Twilio',
      fromSipTrunk: 'Desde SIP Trunk',
      importNumberFromTwilio: 'Importar número de teléfono desde Twilio',
      labelPlaceholder: 'Nombre fácil de identificar del número de teléfono',
      twilioAccountSidPlaceholder: 'SID de Cuenta Twilio',
      routingRegionConfig: 'Configuración de la región de enrutamiento',
      routingRegionDesc: 'Configura una región de enrutamiento específica con un token dedicado',
      comingSoon: 'Próximamente',

      // Historial page
      searchNumber: 'Buscar el número',
      resolved: 'Resuelto',
      pending: 'Pendiente',
      selectContactToView: 'Selecciona una conversación',
      back: 'Volver',

      // Common
      new: 'Nuevo',

      // 404 / Not Found page
      notFoundTitle: 'Página no encontrada',
      notFoundBackToDashboard: 'Volver al panel',
      allRightsReserved: 'Todos los derechos reservados',

      // Metrics page
      last7Days: 'Últimos 7 días',
      last30Days: 'Últimos 30 días',
      thisMonth: 'Este mes',
      lastYear: 'Año pasado',
      all: 'Todos',
      agent1: 'Agente 1',
      agent2: 'Agente 2',
      extraMinutes: 'Minutos Extra',
      latency: 'Latencia',
      fast: 'RÁPIDO',
      normal: 'NORMAL',
      slow: 'LENTO',
      latencyDescription: 'Tiempo que tarda el sistema en responder durante una llamada. Un valor más bajo indica mayor rapidez.',
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
      connections: 'Conexiones',
      manageConnections: 'Gestiona tus integraciones',
      twilioIntegrationDesc: 'Conecta tu cuenta de Twilio para importar números de teléfono.',
      editTwilioAccount: 'Editar cuenta de Twilio',
      addTwilioAccount: 'Añadir nueva cuenta de Twilio',
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
      redeemed: 'Canjeado',
      trustpilot: 'Trustpilot',
      trustpilotBonus: '+10 min',
      trustpilotDescription: 'Gana 10 minutos adicionales dejando una reseña sobre Llamalo en Trustpilot. Una vez publicada, envíanos una captura de pantalla en el chat junto con el email de tu cuenta y añadiremos los minutos extra automáticamente.',
      gift2Title: 'Seguir en redes sociales',
      gift2Bonus: 'Máx. +3 min',
      gift2Description:
        'Consigue un minuto gratis por cada red social seguida (hasta tres minutos en total). Cuando lo tengas, envíanos una captura por el chat con el email de tu cuenta.',
      gift2SocialInstagram: 'Instagram',
      gift2SocialLinkedIn: 'LinkedIn',
      gift2SocialX: 'X',
      gift3Title: 'Recompensa eCommerce',
      gift3Bonus: '+20 min',
      gift3Description:
        'Si dejas una mención visible sobre Llamalo en tu canal de venta (tienda online, ficha de producto, redes o donde encaje con tu negocio), te sumamos 20 minutos de llamadas. Para acreditarlos, envíanos por el chat una captura de la publicación y el correo con el que usas la cuenta.',
      giftRedeemedSuccess: '¡Recompensa canjeada! Te contactaremos pronto.',

      // Modals common
      close: 'Cerrar',
      continue: 'Continuar',
      cancel: 'Cancelar',

      // Account page missing properties
      profileInfo: 'Información del perfil',
      editPaymentMethod: 'Editar método de pago',
      giftsSubtitle: 'Regalos y bonificaciones',
      profileInfoHint1: 'Esta información se utiliza para personalizar tu experiencia en la plataforma, para contactarte sobre tu cuenta y para mejorar el servicio que te ofrecemos.',
      profileInfoHint2: 'Mantenemos tus datos seguros y solo los usamos conforme a nuestra política de privacidad.',
      fullName: 'Nombre completo',
      emailNotEditable: 'El email no se puede editar',
      country: 'País',
      selectCountry: 'Seleccionar país',
      businessName: 'Nombre del negocio',
      businessWebsite: 'Sitio web del negocio',
      forgotPassword: '¿Olvidaste tu contraseña?',
      confirmNewPassword: 'Confirmar nueva contraseña',
      deleteAccount: 'Eliminar cuenta',
      addAccount: 'Añadir cuenta',
      editAccount: 'Editar cuenta',
      noConnections: 'No tienes conexiones configuradas',
      cancelBtn: 'Cancelar',
      saveBtn: 'Guardar configuración',
      importHelp: 'Conecta tu cuenta de Twilio para importar números de teléfono.',
      deleteAccountDescription: 'Esta acción no se puede deshacer',
      deleteAccountBtn: 'Eliminar cuenta',
      currentSubscription: 'Suscripción actual',
      cancelSubscription: 'Cancelar suscripción',
      invoicesHistory: 'Historial de facturas',
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
      accountDeletionScheduled: 'Cuenta programada para eliminación',
      accountDeletionScheduledMessage: 'Tu cuenta ha sido programada para eliminación en 10 días.',
      accountDeletionScheduledDetails: 'La eliminación se realizará el',
      accountDeletionRecoveryInfo: 'Tienes 10 días para recuperar tus datos si cambias de opinión.',
      accountDeletionError: 'Error al programar la eliminación de cuenta',
      accountDeletionUnauthorized: 'No autorizado. Por favor, inicia sesión nuevamente.',
      accountDeletionNotFound: 'Usuario no encontrado.',
      accountDeletionBadRequest: 'Error al procesar la solicitud.',
      accountDeletionScheduledWarning: 'Tu cuenta está programada para eliminación',
      daysRemaining: 'días restantes',
      accountDeletionCancelInfo: 'Puedes cancelar la eliminación contactando con soporte.',
      deleteAccountRecoveryPeriod: 'Tendrás 10 días para recuperar tus datos antes de que la eliminación sea permanente.',

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
      audioLoadProblem: 'Problema al cargar el audio',

      // Knowledge base page
      loadingKnowledgeSources: 'Cargando fuentes de conocimiento...',
      refreshDocuments: 'Actualizar documentos',
      typeColumn: 'Tipo',
      statusColumn: 'Estado',
      fragmentsAndWords: 'Fragmentos y palabras',
      fragments: 'fragmentos',
      words: 'palabras',
      statusProcessing: 'Procesando',
      statusCompleted: 'Completado',
      statusFailed: 'Fallido',
      statusError: 'Error',
      viewPreview: 'Ver vista previa',
      downloadKnowledgeFile: 'Descargar archivo',
      errorDownloadingKnowledge: 'No se pudo descargar el archivo',
      uploadLimits: 'Límites de subida',
      pdfMax: 'PDF: Máximo',
      urlMax: 'URL: Máximo',
      textMax: 'Texto: Máximo',
      addWebSourceTitle: 'Añadir fuente web',
      addTextTitle: 'Añadir texto manual',
      manualTextDefault: 'Texto manual',
      noDocumentsTitle: 'No hay documentos',
      noDocumentsDescription: 'Comienza agregando tu primer documento para crear la base de conocimientos de tu agente.',
      knowledgeBaseLoadError: 'No se pudieron cargar los documentos. Por favor, intenta de nuevo.',
      retry: 'Reintentar',
      deleteDocument: 'Eliminar documento',
      dateColumn: 'Fecha',
      actionsColumn: 'Acciones',
      pdfMaxError: 'El PDF no puede exceder los 10MB',
      urlMaxError: 'La URL no puede exceder los 2048 caracteres',
      textMaxError: 'El texto no puede exceder los 50,000 caracteres',
      errorNoFileInfo: 'Error: No se recibió información del archivo subido',
      errorUploadingFile: 'Error al subir el archivo',
      errorCreatingWeb: 'Error al crear la fuente web',
      errorServerResponse: 'Error en la respuesta del servidor',
      errorDeletingKnowledge: 'Error al eliminar la fuente de conocimiento',
      urlTooLong: 'La URL no puede exceder los 2048 caracteres',
      textTooLong: 'El texto no puede exceder los 50,000 caracteres',

      // Create agent steps
      completeAgent: 'Completa tu agente',
      chooseAgentNameDesc: 'Elige un nombre que refleje el propósito de tu agente',
      agentNameLabel: 'Nombre del Agente *',
      agentNamePlaceholder: 'Introduce el nombre del agente...',
      callTypeTitle: 'Tipo de llamada',
      whatCallType: '¿Qué tipo de llamadas atenderá tu agente?',
      notAvailable: 'No disponible',
      instructionsStepTitle: 'Instrucciones',
      defineInstructionsForAgent: 'Define las instrucciones que seguirá tu agente de IA.',
      customGreetingLabel: 'Saludo personalizado',
      greetingPlaceholder: 'Hola, gracias por llamar a...',
      generateWithAI: 'Generar con IA',
      generateInstructionsWithAI: 'Generar instrucciones con IA',
      describeAgentBehavior: 'Describe brevemente cómo debe comportarse el agente.',
      exampleInstructionsPlaceholder: 'Ej: Agente amable que atiende reservas y dudas de un restaurante...',
      generating: 'Generando...',
      generateBtn: 'Generar',
      viewFullTextTitle: 'Ver texto completo ampliado',
      externalActionsMake: 'Acciones externas',
      makeExternalDescription: 'Automatiza tus flujos',
      makeComingSoon: 'Próximamente',
      connectShopifyTitle: 'Conecta tu negocio de Shopify',
      linkStoreDescription: 'Vincula tu tienda para que tu agente pueda usar tus datos reales.',
      shopifyConnectDesc: 'Conecta tu tienda para sincronizar productos, pedidos y clientes.',
      connected: 'Conectado',
      connect: 'Conectar',
      connectPhoneTitle: 'Conecta tu número de teléfono',
      configureTwilioDescription: 'Configura Twilio y tu número para recibir llamadas con tu agente.',
      accountConnected: 'Cuenta conectada',
      connectedAccounts: 'Cuentas conectadas',
      accountValidated: 'Cuenta validada',
      connectTwilioAccount: 'Conecta tu cuenta de Twilio',
      closeBtn: 'Cerrar',
      openBtn: 'Abrir',
      twilioConnectedSummaryOne: '1 cuenta conectada',
      twilioConnectedSummaryManySuffix: 'cuentas conectadas',
      accountIdLabel: 'Cuenta ID:',
      changeBtn: 'Cambiar',
      availableNumbers: 'Números disponibles',
      connectNewAccount: '+ Conectar nueva cuenta',
      testAgentTitle: 'Prueba de agente',
      talkToAgentDescription: 'Habla con tu agente para verificar su voz, idioma e instrucciones antes de crear.',
      remainingTime: 'restantes',
      backToAgents: 'Volver a Agentes',
      agentReadyDescription: 'Tu agente está listo para recibir llamadas. Ya puedes volver atrás y gestionarlo desde la página de agentes.',
      languageAndVoice: 'Lenguaje y voz',
      chooseCountryAndVoice: 'Elige el país y la voz de tu agente',
      countryLabel: 'País',

      agentStateThinking: 'Pensando...',
      agentStateSpeaking: 'Hablando...',
      agentStateDone: 'Listo',
      agentStateWaiting: 'Esperando...',
      connectionConnecting: 'Conectando...',
      connectionEnded: 'Finalizado',
      speakToStart: 'Habla para comenzar la conversación',
      connectingToAgent: 'Conectando con el agente...',
      testCall: 'Probar llamada',
      mutedLabel: 'Silenciado',
      microphoneLabel: 'Micrófono',
      endCallLabel: 'Terminar',
      tryAgainLabel: 'Probar de nuevo',

      // Account page extra
      acceptMarketing: 'Acepto recibir comunicaciones de marketing y promociones',
      accountDeletionUntilPermanent: 'hasta la eliminación permanente de tu cuenta.',
      accountScheduledDeletionYouHave: 'Tu cuenta está programada para eliminación. Tienes',
      selectAvatar: 'Selecciona un avatar',
      uploadMyPhoto: 'Subir mi propia foto',
      contact: 'Contacto',
      contactSubtitle: 'Ponte en contacto con nuestro equipo',
      contactEmpty: 'Pronto verás aquí las opciones de contacto.',
      contactMessageLabel: 'Mensaje para el equipo técnico',
      contactMessagePlaceholder: 'Escribe aquí con qué necesitas ayuda...',
      contactMessageButton: 'Enviar mensaje',
      contactMessageRequired: 'Por favor, escribe un mensaje para el equipo técnico.',
      contactMessageSuccess: 'Tu mensaje se ha enviado al equipo técnico.',
      contactMeetingTitle: 'Agendar una reunión',
      contactMeetingSubtitle: 'Elige fecha y hora para hablar con el equipo técnico.',
      contactMeetingDateLabel: 'Fecha de la reunión',
      contactMeetingTimeLabel: 'Hora de la reunión',
      contactMeetingButton: 'Agendar reunión',
      contactMeetingRequired: 'Selecciona una fecha y una hora para la reunión.',
      contactMeetingSuccess: 'Tu solicitud de reunión se ha enviado al equipo técnico.',

      // Upgrade plan page
      upgradeTitle: 'Precios que crecen contigo',
      upgradeSubtitle: 'Escucha lo que dicen nuestros clientes sobre cómo LlamaloIA ha transformado su comunicación.',
      perMonth: 'Mes',
      whatIncluded: 'LO QUE INCLUYE:',
      everythingInFreePlus: 'TODO EN GRATIS, MÁS:',
      everythingInProPlus: 'TODO EN PRO, MÁS:',
      comparisonTitle: 'Comparación de funciones',
      comparisonSubtitle: 'Llamalo es el socio perfecto para tu negocio.',
      choosePlan: 'Elegir Plan',
      upgradePlanFree: 'Gratis',
      upgradePlanPro: 'Pro',
      upgradePlanPremium: 'Premium',
      upgradePlanFreeDesc: 'Ideal para empezar y probar la plataforma.',
      upgradePlanProDesc: 'Para equipos que quieren escalar su comunicación.',
      upgradePlanPremiumDesc: 'Máxima capacidad y soporte prioritario.',
      upgradePlanFreeButton: 'Empezar gratis',
      upgradePlanProButton: 'Elegir Pro',
      upgradePlanPremiumButton: 'Elegir Premium',
      upgradeFeatureFree1: '1 agente de voz',
      upgradeFeatureFree2: '100 minutos/mes',
      upgradeFeatureFree3: 'Integración básica',
      upgradeFeatureFree4: 'Soporte por email',
      upgradeFeatureFree5: 'Prueba 14 días',
      upgradeFeaturePro1: '5 agentes de voz',
      upgradeFeaturePro2: '1.000 minutos/mes',
      upgradeFeaturePro3: 'Integraciones avanzadas',
      upgradeFeaturePro4: 'Soporte prioritario',
      upgradeFeaturePro5: 'Analíticas avanzadas',
      upgradeFeaturePremium1: 'Agentes ilimitados',
      upgradeFeaturePremium2: 'Minutos ilimitados',
      upgradeFeaturePremium3: 'API y webhooks',
      upgradeFeaturePremium4: 'Gestor de cuenta dedicado',
      upgradeFeaturePremium5: 'SLA 99.9%',
      upgradeComp1: 'Agentes de voz',
      upgradeComp2: 'Minutos/mes',
      upgradeComp3: 'Integraciones',
      upgradeComp4: 'Soporte',
      upgradeComp5: 'Analíticas',
      upgradeComp6: 'API',
      upgradeComp7: 'Webhooks',
      upgradeComp8: 'Gestor dedicado',
      upgradeComp9: 'SLA',
      upgradeComp10: 'Precio',

      // Company setup
      skipLabel: 'Saltar',
      createFirstAgent: 'Crea tu primer agente',
      whatDoYouWantToAchieve: '¿Qué quieres conseguir con Llamalo?',
      youCanSelectMultiple: 'Puedes seleccionar varias opciones para esta pregunta.',
      customerServiceInbound: 'Atención al cliente (Inbound)',
      customerServiceInboundDesc: 'Soporta llamadas entrantes: consultas, incidencias y seguimiento post‑venta.',
      cartRecovery: 'Recuperar carritos abandonados',
      cartRecoveryDesc: 'Llamadas salientes para recuperar ventas y ofrecer ayuda personalizada.',
      outboundSales: 'Ventas salientes (Outbound Sales)',
      outboundSalesDesc: 'Agente que realiza llamadas para presentar ofertas, upsells y cerrar pedidos.',
      confirmationsReminders: 'Confirmaciones y recordatorios',
      confirmationsRemindersDesc: 'Confirmar pedidos, citas, entregas y enviar recordatorios automáticos.',
      otherOption: 'Otro',
      howDidYouFindUs: '¿Cómo nos conociste?',
      socialNetworks: 'Redes sociales (Instagram / TikTok / Twitter / LinkedIn)',
      youtube: 'YouTube',
      googleSearch: 'Google / Buscando alternativas',
      communities: 'Comunidades / Grupos (Slack, Discord, Telegram)',
      eventWebinar: 'Evento o webinar',
      friendRecommendation: 'Recomendación de un amigo o colega',
      welcomeToLlamalo: 'Bienvenido a Llamalo AI',
      letAiSpeakForYou: 'Deja que la IA hable por ti.',
      startButton: 'Empezar',

      // Auth
      authWelcomeBack: '¡Bienvenido de vuelta!',
      authLoginTitle: 'Iniciar sesión',
      authLoginSubtitle: 'Introduzca sus datos de acceso',
      authLoginButton: 'Acceder',
      authFullName: 'Nombre completo',
      authEmail: 'Correo electrónico',
      authPassword: 'Contraseña',
      authCountry: 'País',
      authSelectCountry: 'Selecciona un país',
      authMarketingConsentLlamalo: 'Acepto recibir comunicaciones de marketing y promociones de Llamalo AI',
      authRememberMe: 'Mantener sesión activa',
      authOrContinueWith: 'O continuar con',
      authTermsPrefix: 'Al registrarme para crear una cuenta acepto las',
      authTermsConditions: 'Condiciones de uso',
      authTermsAnd: 'y la',
      authTermsPrivacy: 'Política de privacidad',
      authTermsSuffix: 'de Llamalo AI',
      authPlaceholderName: 'Juan Carlos',
      authPlaceholderEmail: 'info@example.com',
      authCountryES: 'España',
      authCountryFR: 'Francia',
      authCountryIT: 'Italia',
      authCountryPT: 'Portugal',
      authCountryDE: 'Alemania',
      authCountryGB: 'Reino Unido',
      authCountryUS: 'Estados Unidos',
      authCountryMX: 'México',
      authCountryAR: 'Argentina',
      authCountryCO: 'Colombia',
      authErrorEmailPassword: 'Por favor, ingrese email y contraseña',
      authErrorLogin: 'Error en inicio de sesión. Por favor, revisa tus credenciales.',
      authSuccessLogin: '¡Bienvenido de vuelta! Has iniciado sesión correctamente.',
      authErrorGetProfile: 'Error al obtener perfil de usuario',
      authErrorFillAll: 'Por favor, completa todos los campos',
      authErrorMarketingConsent: 'Debes aceptar el consentimiento de marketing para continuar',
      authSuccessVerifyEmail: 'Ahora debe ir a su correo electrónico y validarlo para poder acceder a su cuenta.',
      authErrorRegister: 'Error al registrar usuario. Por favor, inténtelo de nuevo.',
      authErrorRecoverEmail: 'Ingresa tu correo para recuperar la contraseña',
      authSuccessRecover: 'Si el correo existe, recibirás instrucciones de recuperación.',
    },
    en: {
      // Home page translations
      summary: 'Summary',
      totalSuccessfulCalls: 'Total calls',
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
      vsLastWeek: 'vs last week',
      totalCalls: 'Total calls',
      successfulCalls: 'Successful calls',
      totalMinutes: 'Total Minutes',
      minutes: 'Minutes',
      successRate: 'Call success rate',
      planStarter: 'Starter Plan',
      boostEfficiency: 'Maximize Your Efficiency',
      unlockAdvancedFeatures: 'Unlock advanced automation features',
      upgradePlan: 'Upgrade Plan',
      dashboard: 'Dashboard',
      configuration: 'Configuration',

      // Agents page translations
      searchAgents: 'Search agents...',
      agentNameHeader: 'Name',
      phoneNumberHeader: 'Phone Number',
      noNumberAssigned: 'No number assigned',
      inactive: 'Inactive',
      publishAgain: 'Publish again',
      noAgentsCreated: 'No agents created yet',

      // Numbers page translations
      searchNumbers: 'Search numbers...',
      phoneNumberHeaderNumbers: 'Phone Number',
      phoneNumberImportLabel: 'Phone Number',
      twilioAccountSidLabel: 'Twilio Account SID',
      twilioAccountTokenLabel: 'Twilio Account Token',
      phoneNumberPlaceholder: '630 00 00 00',
      twilioSidPlaceholder: 'Twilio Account SID',
      twilioTokenPlaceholder: 'Twilio Account Token',
      noImportedNumbers: 'You don\'t have any imported phone numbers yet',
      importFirstNumberNow: 'Import your first number now!',
      validating: 'Validating...',

      // Metrics page translations
      callsText: 'calls',
      totalCallsLabel: 'Total calls',
      averagePerDayLabel: 'Average/day',
      peakHoursDataNotAvailable: 'Peak hours data not available',
      waitingForEndpointData: 'Waiting for endpoint data...',
      millisecondsLabel: 'MS',
      minutesLabel: 'M',
      secondsLabel: 'S',
      costPerMinute: 'Cost per minute',
      subscription: 'Subscription',
      peakHours: 'Calls per hour',
      averageCallDuration: 'Average duration',
      systemStatus: 'System status',
      starterPlan: 'Starter',
      for7Days: 'For 7 days',
      successEvaluation: 'Success evaluation',
      title: 'Title',
      desktopMobileView: 'Mobile view',
      for30Days: 'For 30 days',
      compactHorizontalBarChart: 'Compact horizontal bar chart',
      statisticalSummary: 'Compact statistical summary',
      desktopAreaView: 'Desktop view: Original area chart',
      semicircularMeter: 'Dynamic semicircular meter',
      semicircularGiant: 'Giant semicircular meter',
      semicircleBackground: 'Semicircle background',
      dynamicProgressArc: 'Dynamic progress arc',
      progressMarker: 'Progress marker at the end',
      gradientDefinition: 'Gradient definition',
      simpleStriped: 'Simple striped: full band and empty band',
      fullBandEmptyBand: 'full band and empty band',
      daysOfWeek: 'Days of the week',
      desktopAndMobileHiddenTablet: 'desktop and mobile, hidden on tablet',
      barChartWithRealData: 'Bar chart with real data',
      hourBars: 'Hour bars',
      hourLabelsBelowChart: 'Hour labels below chart',
      countriesMovedFromOriginal: 'Countries (moved from original box)',
      callCompletionReason: 'Call completion reason',
      contentBasedOnPeakHoursData: 'Content based on peak hours data',
      tooltipHover: 'Tooltip hover',
      tooltipArrow: 'Tooltip arrow',
      statusIndicator: 'Status indicator',
      messageWhenNoData: 'Message when no data',
      systemStatusTabletOnly: 'tablet only (md)',

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
      knowledgeBase: 'Knowledge base',
      knowledgeBaseEmpty: 'This section is empty for now.',
      knowledgeBaseMoreResults: 'more results',
      knowledgeBaseVia: 'via',
      knowledgeBasePdf: 'PDF',
      knowledgeBaseWeb: 'Web',
      knowledgeBaseText: 'Text',
      knowledgeBaseOther: 'Other',
      knowledgeBaseAddPdf: 'Add PDF',
      knowledgeBaseAddWeb: 'Add Web',
      knowledgeBaseAddText: 'Add Text',
      knowledgeBaseNoDocuments: 'No documents found',
      knowledgeBaseNoDocumentsYet: 'You don\'t have any documents yet.',
      knowledgeBaseSearchPlaceholder: 'Search documents...',
      settings: 'Settings',
      privateCommunity: 'Private Community',
      helpCenter: 'Help Center',
      logout: 'Logout',

      // Promo card
      promoTitle: 'Try Llamalo for free!',
      promoDescription: 'Create your first voice agent and get 10 free minutes to test all features.',
      promoButton: 'Start for free',
      remainingMinutes: 'Remaining minutes',
      planPro: 'Pro Plan',

      // Topbar / invites
      noNews: 'No news',
      newsDateJustNow: 'Just now',
      newsDateOneMinuteAgo: '1 minute ago',
      newsDateMinutesAgo: '{{n}} minutes ago',
      newsDateOneHourAgo: '1 hour ago',
      newsDateHoursAgo: '{{n}} hours ago',
      newsDateYesterday: 'Yesterday',
      inviteTeamTitle: 'Invite your team and work together',
      inviteTeamDescription:
        'Share your link with your team and collaborators. When they start using Llamalo, you\'ll get extra minutes in your account.',
      inviteEmailPlaceholder: 'Email or username',
      sendInvite: 'Send invite',
      invitedMembers: 'Invited members',
      noInvitesYet: 'No invites yet. Start by sending your first invite.',
      copyLink: 'Copy link',
      savedDraftLabel: 'Draft saved',
      continueAgentCreationQuestion: 'Do you want to continue creating your agent?',
      agentLabelTopbar: 'Agent',
      noName: 'No name',
      stepLabel: 'Step',
      deleteLabel: 'Delete',
      openMenu: 'Open menu',

      // New Agents page
      yourAgents: 'Your agents',
      createAgent: 'Create Agent',
      agent: 'Agent',
      number: 'ID',
      edit: 'Edit',
      delete: 'Delete',
      stopPublishing: 'Stop publishing',
      noAgentsYet: 'You don\'t have any phone agents yet.',
      createItNow: 'Create it now!',
      createAgentButton: 'Create agent',

      // Numbers page
      importNumber: 'Import Number',
      importedFrom: 'Imported from',
      clientNumber: 'Client ID',
      storeNumber: 'Store Number',
      label: 'Label',
      fromTwilio: 'From Twilio',
      fromSipTrunk: 'From SIP Trunk',
      importNumberFromTwilio: 'Import phone number from Twilio',
      labelPlaceholder: 'Easy-to-identify name for the phone number',
      twilioAccountSidPlaceholder: 'Twilio Account SID',
      routingRegionConfig: 'Routing region configuration',
      routingRegionDesc: 'Configure a specific routing region with a dedicated token',
      comingSoon: 'Coming soon',

      // Historial page
      searchNumber: 'Search number',
      resolved: 'Resolved',
      pending: 'Pending',
      selectContactToView: 'Select a conversation',
      back: 'Back',

      // Common
      new: 'New',

      // 404 / Not Found page
      notFoundTitle: 'Page not found',
      notFoundBackToDashboard: 'Back to dashboard',
      allRightsReserved: 'All rights reserved',

      // Metrics page
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      thisMonth: 'This month',
      lastYear: 'Last year',
      all: 'All',
      agent1: 'Agent 1',
      agent2: 'Agent 2',
      extraMinutes: 'Extra Minutes',
      latency: 'Latency',
      fast: 'FAST',
      normal: 'NORMAL',
      slow: 'SLOW',
      latencyDescription: 'Time it takes for the system to respond during a call. A lower value indicates greater speed.',
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
      connections: 'Connections',
      manageConnections: 'Manage your integrations',
      twilioIntegrationDesc: 'Connect your Twilio account to import phone numbers.',
      editTwilioAccount: 'Edit Twilio Account',
      addTwilioAccount: 'Add New Twilio Account',
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
      redeemed: 'Redeemed',
      trustpilot: 'Trustpilot',
      trustpilotBonus: '+10 min',
      trustpilotDescription: 'Earn 10 extra minutes by leaving a review about Llamalo on Trustpilot. Once published, send us a screenshot in the chat along with your account email and we will add the extra minutes automatically.',
      gift2Title: 'Follow on social media',
      gift2Bonus: 'Max. +3 min',
      gift2Description:
        'Get one free minute for each social network you follow (up to three minutes in total). When done, send us a screenshot in the chat with your account email.',
      gift2SocialInstagram: 'Instagram',
      gift2SocialLinkedIn: 'LinkedIn',
      gift2SocialX: 'X',
      gift3Title: 'eCommerce reward',
      gift3Bonus: '+20 min',
      gift3Description:
        'Post a public mention of Llamalo in your sales channel (your store, a listing, socials—anywhere it fits your business) and we will add 20 minutes of calling time. Send a screenshot in the chat plus the email you use to log in so we can verify it and apply the bonus.',
      giftRedeemedSuccess: 'Reward redeemed! We will contact you soon.',

      // Modals common
      close: 'Close',
      continue: 'Continue',
      cancel: 'Cancel',

      // Account page missing properties
      profileInfo: 'Profile information',
      editPaymentMethod: 'Edit payment method',
      giftsSubtitle: 'Gifts and bonuses',
      profileInfoHint1: 'This information is used to personalize your experience on the platform, to contact you about your account and to improve the service we offer you.',
      profileInfoHint2: 'We keep your data secure and only use it in accordance with our privacy policy.',
      fullName: 'Full name',
      emailNotEditable: 'Email cannot be edited',
      country: 'Country',
      selectCountry: 'Select country',
      businessName: 'Business name',
      businessWebsite: 'Business website',
      forgotPassword: 'Forgot password?',
      confirmNewPassword: 'Confirm new password',
      deleteAccount: 'Delete account',
      addAccount: 'Add account',
      editAccount: 'Edit account',
      noConnections: 'No connections configured',
      cancelBtn: 'Cancel',
      saveBtn: 'Save configuration',
      importHelp: 'Connect your Twilio account to import phone numbers.',
      deleteAccountDescription: 'This action cannot be undone',
      deleteAccountBtn: 'Delete account',
      currentSubscription: 'Current subscription',
      cancelSubscription: 'Cancel subscription',
      invoicesHistory: 'Invoices history',
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
      accountDeletionScheduled: 'Account scheduled for deletion',
      accountDeletionScheduledMessage: 'Your account has been scheduled for deletion in 10 days.',
      accountDeletionScheduledDetails: 'Deletion will occur on',
      accountDeletionRecoveryInfo: 'You have 10 days to recover your data if you change your mind.',
      accountDeletionError: 'Error scheduling account deletion',
      accountDeletionUnauthorized: 'Unauthorized. Please log in again.',
      accountDeletionNotFound: 'User not found.',
      accountDeletionBadRequest: 'Error processing the request.',
      accountDeletionScheduledWarning: 'Your account is scheduled for deletion',
      daysRemaining: 'days remaining',
      accountDeletionCancelInfo: 'You can cancel the deletion by contacting support.',
      deleteAccountRecoveryPeriod: 'You will have 10 days to recover your data before the deletion becomes permanent.',

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
      audioLoadProblem: 'Problem loading audio',

      // Knowledge base page
      loadingKnowledgeSources: 'Loading knowledge sources...',
      refreshDocuments: 'Refresh documents',
      typeColumn: 'Type',
      statusColumn: 'Status',
      fragmentsAndWords: 'Fragments and words',
      fragments: 'fragments',
      words: 'words',
      statusProcessing: 'Processing',
      statusCompleted: 'Completed',
      statusFailed: 'Failed',
      statusError: 'Error',
      viewPreview: 'View preview',
      downloadKnowledgeFile: 'Download file',
      errorDownloadingKnowledge: 'Could not download the file',
      uploadLimits: 'Upload limits',
      pdfMax: 'PDF: Max',
      urlMax: 'URL: Max',
      textMax: 'Text: Max',
      addWebSourceTitle: 'Add web source',
      addTextTitle: 'Add manual text',
      manualTextDefault: 'Manual text',
      noDocumentsTitle: 'No documents',
      noDocumentsDescription: 'Start by adding your first document to build your agent\'s knowledge base.',
      knowledgeBaseLoadError: 'Could not load documents. Please try again.',
      retry: 'Retry',
      deleteDocument: 'Delete document',
      dateColumn: 'Date',
      actionsColumn: 'Actions',
      pdfMaxError: 'PDF cannot exceed 10MB',
      urlMaxError: 'URL cannot exceed 2,048 characters',
      textMaxError: 'Text cannot exceed 50,000 characters',
      errorNoFileInfo: 'Error: No file information received',
      errorUploadingFile: 'Error uploading file',
      errorCreatingWeb: 'Error creating web source',
      errorServerResponse: 'Server response error',
      errorDeletingKnowledge: 'Error deleting knowledge source',
      urlTooLong: 'URL cannot exceed 2,048 characters',
      textTooLong: 'Text cannot exceed 50,000 characters',

      // Create agent steps
      completeAgent: 'Complete your agent',
      chooseAgentNameDesc: 'Choose a name that reflects your agent\'s purpose',
      agentNameLabel: 'Agent Name *',
      agentNamePlaceholder: 'Enter the agent name...',
      callTypeTitle: 'Call type',
      whatCallType: 'What type of calls will your agent handle?',
      notAvailable: 'Not available',
      instructionsStepTitle: 'Instructions',
      defineInstructionsForAgent: 'Define the instructions your AI agent will follow.',
      customGreetingLabel: 'Custom greeting',
      greetingPlaceholder: 'Hello, thank you for calling...',
      generateWithAI: 'Generate with AI',
      generateInstructionsWithAI: 'Generate instructions with AI',
      describeAgentBehavior: 'Briefly describe how the agent should behave.',
      exampleInstructionsPlaceholder: 'E.g.: Friendly agent that handles reservations and questions for a restaurant...',
      generating: 'Generating...',
      generateBtn: 'Generate',
      viewFullTextTitle: 'View full expanded text',
      externalActionsMake: 'External actions',
      makeExternalDescription: 'Automate your workflows',
      makeComingSoon: 'Coming soon',
      connectShopifyTitle: 'Connect your Shopify business',
      linkStoreDescription: 'Link your store so your agent can use your real data.',
      shopifyConnectDesc: 'Connect your store to sync products, orders and customers.',
      connected: 'Connected',
      connect: 'Connect',
      connectPhoneTitle: 'Connect your phone number',
      configureTwilioDescription: 'Set up Twilio and your number to receive calls with your agent.',
      accountConnected: 'Account connected',
      connectedAccounts: 'Connected accounts',
      accountValidated: 'Account validated',
      connectTwilioAccount: 'Connect your Twilio account',
      closeBtn: 'Close',
      openBtn: 'Open',
      twilioConnectedSummaryOne: '1 connected account',
      twilioConnectedSummaryManySuffix: 'connected accounts',
      accountIdLabel: 'Account ID:',
      changeBtn: 'Change',
      availableNumbers: 'Available numbers',
      connectNewAccount: '+ Connect new account',
      testAgentTitle: 'Agent test',
      talkToAgentDescription: 'Talk to your agent to verify its voice, language and instructions before creating.',
      remainingTime: 'remaining',
      backToAgents: 'Back to Agents',
      agentReadyDescription: 'Your agent is ready to receive calls. You can go back and manage it from the agents page.',
      languageAndVoice: 'Language and voice',
      chooseCountryAndVoice: 'Choose your agent\'s country and voice',
      countryLabel: 'Country',

      agentStateThinking: 'Thinking...',
      agentStateSpeaking: 'Speaking...',
      agentStateDone: 'Ready',
      agentStateWaiting: 'Waiting...',
      connectionConnecting: 'Connecting...',
      connectionEnded: 'Ended',
      speakToStart: 'Speak to start the conversation',
      connectingToAgent: 'Connecting to agent...',
      testCall: 'Test call',
      mutedLabel: 'Muted',
      microphoneLabel: 'Microphone',
      endCallLabel: 'End',
      tryAgainLabel: 'Try again',

      // Account page extra
      acceptMarketing: 'I agree to receive marketing and promotional communications',
      accountDeletionUntilPermanent: 'until permanent account deletion.',
      accountScheduledDeletionYouHave: 'Your account is scheduled for deletion. You have',
      selectAvatar: 'Select an avatar',
      uploadMyPhoto: 'Upload my own photo',
      contact: 'Contact',
      contactSubtitle: 'Get in touch with our team',
      contactEmpty: 'Contact options will appear here soon.',
      contactMessageLabel: 'Message to the technical team',
      contactMessagePlaceholder: 'Write here what you need help with...',
      contactMessageButton: 'Send message',
      contactMessageRequired: 'Please write a message for the technical team.',
      contactMessageSuccess: 'Your message has been sent to the technical team.',
      contactMeetingTitle: 'Schedule a meeting',
      contactMeetingSubtitle: 'Choose a date and time to talk with the technical team.',
      contactMeetingDateLabel: 'Meeting date',
      contactMeetingTimeLabel: 'Meeting time',
      contactMeetingButton: 'Schedule meeting',
      contactMeetingRequired: 'Please select a date and time for the meeting.',
      contactMeetingSuccess: 'Your meeting request has been sent to the technical team.',

      // Upgrade plan page
      upgradeTitle: 'Pricing that grows with you',
      upgradeSubtitle: 'Hear what our customers say about how LlamaloIA has transformed their communication.',
      perMonth: 'Month',
      whatIncluded: 'WHAT\'S INCLUDED:',
      everythingInFreePlus: 'EVERYTHING IN FREE, PLUS:',
      everythingInProPlus: 'EVERYTHING IN PRO, PLUS:',
      comparisonTitle: 'Feature comparison',
      comparisonSubtitle: 'Llamalo is the perfect partner for your business.',
      choosePlan: 'Choose Plan',
      upgradePlanFree: 'Free',
      upgradePlanPro: 'Pro',
      upgradePlanPremium: 'Premium',
      upgradePlanFreeDesc: 'Ideal to get started and try the platform.',
      upgradePlanProDesc: 'For teams that want to scale their communication.',
      upgradePlanPremiumDesc: 'Maximum capacity and priority support.',
      upgradePlanFreeButton: 'Start free',
      upgradePlanProButton: 'Choose Pro',
      upgradePlanPremiumButton: 'Choose Premium',
      upgradeFeatureFree1: '1 voice agent',
      upgradeFeatureFree2: '100 minutes/month',
      upgradeFeatureFree3: 'Basic integration',
      upgradeFeatureFree4: 'Email support',
      upgradeFeatureFree5: '14-day trial',
      upgradeFeaturePro1: '5 voice agents',
      upgradeFeaturePro2: '1,000 minutes/month',
      upgradeFeaturePro3: 'Advanced integrations',
      upgradeFeaturePro4: 'Priority support',
      upgradeFeaturePro5: 'Advanced analytics',
      upgradeFeaturePremium1: 'Unlimited agents',
      upgradeFeaturePremium2: 'Unlimited minutes',
      upgradeFeaturePremium3: 'API and webhooks',
      upgradeFeaturePremium4: 'Dedicated account manager',
      upgradeFeaturePremium5: '99.9% SLA',
      upgradeComp1: 'Voice agents',
      upgradeComp2: 'Minutes/month',
      upgradeComp3: 'Integrations',
      upgradeComp4: 'Support',
      upgradeComp5: 'Analytics',
      upgradeComp6: 'API',
      upgradeComp7: 'Webhooks',
      upgradeComp8: 'Dedicated manager',
      upgradeComp9: 'SLA',
      upgradeComp10: 'Price',

      // Company setup
      skipLabel: 'Skip',
      createFirstAgent: 'Create your first agent',
      whatDoYouWantToAchieve: 'What do you want to achieve with Llamalo?',
      youCanSelectMultiple: 'You can select multiple options for this question.',
      customerServiceInbound: 'Customer service (Inbound)',
      customerServiceInboundDesc: 'Handle incoming calls with AI 24/7.',
      cartRecovery: 'Recover abandoned carts',
      cartRecoveryDesc: 'Recover sales with automated calls.',
      outboundSales: 'Outbound sales',
      outboundSalesDesc: 'Run sales campaigns with AI.',
      confirmationsReminders: 'Confirmations and reminders',
      confirmationsRemindersDesc: 'Appointment confirmations and automatic reminders.',
      otherOption: 'Other',
      howDidYouFindUs: 'How did you find us?',
      socialNetworks: 'Social media (Instagram / TikTok / Twitter / LinkedIn)',
      youtube: 'YouTube',
      googleSearch: 'Google / Searching for alternatives',
      communities: 'Communities / Groups (Slack, Discord, Telegram)',
      eventWebinar: 'Event or webinar',
      friendRecommendation: 'Friend or colleague recommendation',
      welcomeToLlamalo: 'Welcome to Llamalo AI',
      letAiSpeakForYou: 'Let AI speak for you.',
      startButton: 'Start',

      // Auth
      authWelcomeBack: 'Welcome back!',
      authLoginTitle: 'Log in',
      authLoginSubtitle: 'Enter your access details',
      authLoginButton: 'Log in',
      authFullName: 'Full name',
      authEmail: 'Email',
      authPassword: 'Password',
      authCountry: 'Country',
      authSelectCountry: 'Select a country',
      authMarketingConsentLlamalo: 'I agree to receive marketing and promotional communications from Llamalo AI',
      authRememberMe: 'Keep me signed in',
      authOrContinueWith: 'Or continue with',
      authTermsPrefix: 'By signing up I accept the',
      authTermsConditions: 'Terms of use',
      authTermsAnd: 'and the',
      authTermsPrivacy: 'Privacy policy',
      authTermsSuffix: 'of Llamalo AI',
      authPlaceholderName: 'John Doe',
      authPlaceholderEmail: 'info@example.com',
      authCountryES: 'Spain',
      authCountryFR: 'France',
      authCountryIT: 'Italy',
      authCountryPT: 'Portugal',
      authCountryDE: 'Germany',
      authCountryGB: 'United Kingdom',
      authCountryUS: 'United States',
      authCountryMX: 'Mexico',
      authCountryAR: 'Argentina',
      authCountryCO: 'Colombia',
      authErrorEmailPassword: 'Please enter email and password',
      authErrorLogin: 'Login failed. Please check your credentials.',
      authSuccessLogin: 'Welcome back! You have logged in successfully.',
      authErrorGetProfile: 'Error getting user profile',
      authErrorFillAll: 'Please fill in all fields',
      authErrorMarketingConsent: 'You must accept marketing consent to continue',
      authSuccessVerifyEmail: 'Please check your email and verify it to access your account.',
      authErrorRegister: 'Error registering user. Please try again.',
      authErrorRecoverEmail: 'Enter your email to recover your password',
      authSuccessRecover: 'If the email exists, you will receive recovery instructions.',
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
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('selectedLanguage', language.code);
      } catch {
        // Ignorar errores de localStorage (modo privado, etc.)
      }
    }
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
