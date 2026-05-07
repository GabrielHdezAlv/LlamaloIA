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
  /** Subtítulo en métricas: consumo alineado al periodo de facturación (Stripe) o calendario */
  metricsUsagePeriodHint: string;
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
  countryDialPopularSection: string;
  countryDialAllSection: string;
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
  /** Etiqueta: coste EUR por minuto extra del plan (Métricas / admin métricas). */
  costPerExtraMinute: string;
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
  /** Lista de fuentes con scroll: indicación cuando hay más filas */
  knowledgeBaseScrollForMore: string;
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
  /** Listado / previsualización noticias (texto truncado con line-clamp) */
  newsReadMore: string;
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
  /** Panel lateral ajustes de voz (creación / ElevenLabs) */
  voiceSettingsSidebarTitle: string;
  voiceParamStability: string;
  voiceParamSimilarity: string;
  voiceParamStyle: string;
  voiceParamSpeed: string;
  voiceParamBoost: string;

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
  /** 403 / Sin permiso */
  forbiddenTitle: string;
  forbiddenDescription: string;
  forbiddenCtaHome: string;
  forbiddenCtaLogin: string;
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
  /** Uso mensual de minutos en cuenta / facturación */
  minuteUsageHeading: string;
  outOfMinutesBannerTitle: string;
  outOfMinutesBannerDesc: string;
  planUnlimitedShort: string;
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
  accountMetricsTimezone: string;
  accountMetricsTimezoneHint: string;
  accountTzEuropeMadrid: string;
  accountTzAtlanticCanary: string;
  accountTzEuropeLondon: string;
  accountTzEuropeParis: string;
  accountTzEuropeBerlin: string;
  accountTzAmericaMexicoCity: string;
  accountTzAmericaNewYork: string;
  accountTzAmericaArgentina: string;
  accountTzUTC: string;
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
  /** Cuenta / trial */
  trialDaysLeft: string;
  planUsageSummaryLabel: string;
  agentsShort: string;
  docsShort: string;
  /** HTTP 403 por límite de plan / trial */
  http403PlanBlocked: string;
  http403PlanSuffix: string;
  planLimitModalTitle: string;
  planLimitModalCta: string;
  metricsPanelBasicHint: string;
  /** Mensaje sobre métricas atenuadas por plan (Starter) */
  metricsUpgradePlanMessage: string;
  metricsExportCsvButton: string;
  trialBannerUpgrade: string;
  /** Franja bajo el título: fin de prueba (día y hora), sin recuadro */
  trialTimeRemainingLabel: string;
  /** Misma idea, texto breve para menús desplegables (avatar / nav) */
  trialTimeRemainingLabelShort: string;
  cancelSubscription: string;
  invoicesHistory: string;
  /** Un solo CTA al Customer Portal (cancelar / método / facturas) */
  manageBilling: string;
  /** Descarga / abre la última factura (Stripe PDF o página alojada) */
  downloadLatestInvoice: string;
  downloadLatestInvoiceError: string;
  stripeBillingError: string;
  stripeNoCustomerYet: string;
  stripeBillingUpdated: string;
  stripeCheckoutCancelled: string;
  /** Facturación pendiente (pago fallido / trial sin tarjeta) */
  stripePaymentPendingTitle: string;
  stripePaymentPendingDesc: string;
  /** Pantalla dedicada sin plan activo (solo planes) */
  billingChurnPageTitle: string;
  billingChurnPageSubtitle: string;
  /** Misma pantalla cuando el cobro en Stripe falló (past_due, etc.) */
  subscribeRequiredPaymentFailedTitle: string;
  subscribeRequiredPaymentFailedSubtitle: string;
  /** Etiqueta corta del plan «sin suscripción» (navbar, cuenta) */
  planDisplaySinPlan: string;
  /** Plan gratis mostrado durante la prueba de 7 días (perfil `gratis` + trial activo) */
  planDisplayTrial: string;
  /** Paso de registro: elegir plan o prueba */
  registrationPlanStepTitle: string;
  registrationCancelCta: string;
  /** Subtítulo bajo el título de planes en el onboarding (paso dedicado, no modal). */
  onboardingPlanStepSubtitle: string;

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
  /** Editar agente: tras validar Twilio, confirmar número en la cuenta */
  twilioAssignNumberToAgentButton: string;
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
  editKnowledgeSource: string;
  errorUpdatingKnowledge: string;
  uploadLimits: string;
  pdfMax: string;
  urlMax: string;
  textMax: string;
  addWebSourceTitle: string;
  addTextTitle: string;
  addTextDocument: string;
  manualTextDefault: string;
  textModalSourceNameLabel: string;
  textModalSourceNamePlaceholder: string;
  textModalContentLabel: string;
  textModalCharactersSuffix: string;
  textModalContentPlaceholder: string;
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
  /** Título del modal de confirmación de borrado */
  knowledgeBaseDeleteConfirmTitle: string;
  /** Confirmación de borrado; sustituir {{name}} por el nombre de la fuente */
  knowledgeBaseDeleteConfirmMessage: string;
  knowledgeBaseDeleteConfirmButton: string;
  knowledgeBaseDeletingSource: string;
  /** Tras borrado OK; sustituir {{name}} */
  knowledgeBaseDeletedSuccess: string;
  /** Tras procesamiento; sustituir {{name}} */
  knowledgeDocumentProcessingComplete: string;
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
  /** Sidebar Make (creación / edición agente): descripción junto al logo */
  makeModalSidebarDesc: string;
  /** Enlace a Make.com desde el panel lateral */
  makeModalOpenMakeSite: string;
  connectShopifyTitle: string;
  /** Subtítulo del paso instrucciones solo para agente saliente. */
  outboundInstructionsLead: string;
  /** Paso elegir tipo de campaña (solo saliente). */
  outboundCampaignStepTitle: string;
  outboundCampaignStepSubtitle: string;
  /** Paso importar CSV de teléfonos (solo saliente, entre instrucciones y segmentación). */
  outboundImportCsvStepTitle: string;
  outboundImportCsvStepSubtitle: string;
  outboundImportCsvDropZone: string;
  outboundImportCsvHint: string;
  outboundImportCsvAcceptedFormats: string;
  outboundImportCsvDownloadTemplate: string;
  outboundImportCsvPhonesCount: string;
  outboundImportCsvClearAll: string;
  outboundImportCsvRemove: string;
  outboundImportCsvPreviewMore: string;
  outboundImportCsvParseErrorInvalidType: string;
  outboundImportCsvParseErrorRead: string;
  outboundImportCsvParseErrorNoPhones: string;
  outboundImportCsvParseErrorGeneric: string;
  /** Paso segmentación (solo saliente, tras campaña). */
  outboundSegmentationStepTitle: string;
  outboundSegmentationStepSubtitle: string;
  /** Campos del paso segmentación (formulario estructurado) */
  outboundSegAbandonTimeLabel: string;
  outboundSegAvgTicketLabel: string;
  outboundSegCountryLabel: string;
  outboundSegStateLabel: string;
  outboundSegAdvancedAccordionTitle: string;
  outboundSegCartProductsLabel: string;
  outboundSegCartValueLabel: string;
  outboundSegCartItemsLabel: string;
  outboundSegSurveyTimeSincePurchaseLabel: string;
  outboundSegSurveyTicketLabel: string;
  outboundSegPurchasedProductLabel: string;
  outboundSegPurchaseFrequencyLabel: string;
  outboundSegPaymentDueLabel: string;
  outboundSegPaymentTicketLabel: string;
  outboundSegPlaceholderEuroExample: string;
  outboundSegPlaceholderUnitsExample: string;
  outboundSegSelectProducts: string;
  outboundSegAbandon24h: string;
  outboundSegAbandon48h: string;
  outboundSegAbandon7d: string;
  outboundSegStateNew: string;
  outboundSegStateRecurring: string;
  outboundSegCountrySpain: string;
  outboundSegCountryPortugal: string;
  outboundSegCountryFrance: string;
  outboundSegCountryMexico: string;
  outboundSegTime1h: string;
  outboundSegTime3h: string;
  outboundSegTime24h: string;
  outboundSegFreqFirstPurchase: string;
  outboundSegFreqRepeat: string;
  outboundSegDue1hBefore: string;
  outboundSegDue24hBefore: string;
  outboundSegDue48hBefore: string;
  /** Programar campaña (solo saliente, tras segmentación). */
  outboundScheduleCampaignTitle: string;
  outboundScheduleCampaignSubtitle: string;
  outboundScheduleHorarioTitle: string;
  outboundScheduleBusinessHoursLabel: string;
  outboundScheduleCustomLabel: string;
  outboundScheduleFrequencyTitle: string;
  outboundScheduleInitialDelayLabel: string;
  outboundScheduleRetriesLabel: string;
  outboundScheduleRetriesTimesEach: string;
  outboundScheduleMaxCallsLabel: string;
  outboundScheduleMaxCallsPerDay: string;
  outboundScheduleDelay30mAbandon: string;
  outboundScheduleDelay1hAbandon: string;
  outboundScheduleDelay2hAbandon: string;
  outboundScheduleDelay24hAbandon: string;
  outboundScheduleCustomModalTitle: string;
  outboundScheduleCustomDaysHint: string;
  outboundScheduleCustomTimeFrom: string;
  outboundScheduleCustomTimeTo: string;
  outboundScheduleCustomSave: string;
  outboundScheduleCustomCancel: string;
  outboundScheduleCustomEditCta: string;
  outboundScheduleWkMon: string;
  outboundScheduleWkTue: string;
  outboundScheduleWkWed: string;
  outboundScheduleWkThu: string;
  outboundScheduleWkFri: string;
  outboundScheduleWkSat: string;
  outboundScheduleWkSun: string;
  /** Tras guardar instrucciones en flujo saliente (antes de salir al listado). */
  outboundInstructionsPhaseSaved: string;
  /** Plantillas de mensaje saliente (bloques bajo instrucciones). */
  outboundTplAbandonedTitle: string;
  outboundTplSatisfactionTitle: string;
  outboundTplPostPurchaseTitle: string;
  outboundTplPaymentTitle: string;
  outboundTplBlockSubtitle: string;
  outboundTplAbandonedPlaceholder: string;
  outboundTplSatisfactionPlaceholder: string;
  outboundTplPostPurchasePlaceholder: string;
  outboundTplPaymentPlaceholder: string;
  linkStoreDescription: string;
  shopifyConnectDesc: string;
  /** Pantallas /shopify-onboarding y /shopify-onboarding/success */
  shopifyOnboardingAuthLoading: string;
  shopifyOnboardingTitle: string;
  shopifyOnboardingLoadingStores: string;
  shopifyOnboardingSubtitleHasStores: string;
  shopifyOnboardingSubtitleNew: string;
  shopifyOnboardingConnectedStoresHeading: string;
  shopifyOnboardingStoreConnectedBadge: string;
  shopifyOnboardingConnectNewStore: string;
  shopifyOnboardingDomainLabel: string;
  shopifyOnboardingDomainPlaceholder: string;
  shopifyOnboardingDomainInvalidHint: string;
  shopifyOnboardingErrorSelectOrDomain: string;
  shopifyOnboardingErrorDomainSuffix: string;
  shopifyOnboardingErrorNoAuthUrl: string;
  shopifyOnboardingErrorServer: string;
  shopifySuccessErrorTitle: string;
  shopifySuccessErrorFallback: string;
  shopifySuccessTitle: string;
  shopifySuccessYourStore: string;
  shopifySuccessLinkedRest: string;
  shopifySuccessContinueCta: string;
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
  /** Shopify en Cuenta: mismo texto que conectar otra cuenta, sin prefijo «+» */
  shopifyConnectAnotherAccount: string;
  /** Cuenta → Conexiones: botón que abre el panel de tiendas Shopify */
  shopifyManageConnectionBtn: string;
  /** Resumen cuando hay varias tiendas en subtítulo */
  shopifyConnectedSummaryManySuffix: string;
  /** Lista desplegable: encabezado sobre las tiendas */
  shopifyConnectedAccountsHeading: string;
  shopifyDisconnectConfirmTitle: string;
  /** Usa {{shop}} para el dominio */
  shopifyDisconnectConfirmMessage: string;
  /** Texto del botón principal en el modal de desvincular */
  shopifyDisconnectConfirmAction: string;
  shopifyDisconnectedSuccess: string;
  shopifyDisconnectError: string;
  /** Cuenta / editar agente: overlay cuando el plan no incluye Shopify (Gratis, Starter). */
  shopifyIntegrationLockedMessage: string;
  /** Una línea encima del botón «Mejorar plan» en tarjeta saliente bloqueada (incluye comillas). */
  outboundFeatureLockedMessage: string;
  testAgentTitle: string;
  talkToAgentDescription: string;
  remainingTime: string;
  backToAgents: string;
  agentReadyDescription: string;
  languageAndVoice: string;
  chooseCountryAndVoice: string;
  countryLabel: string;
  /** Nombres del selector de idioma/región en el paso de voces (locale UI) */
  voiceLang_es: string;
  voiceLang_en: string;
  voiceLang_fr: string;
  voiceLang_it: string;
  voiceLang_de: string;
  voiceLang_pt: string;
  voiceLang_us: string;
  voiceLang_tr: string;
  voiceLang_se: string;
  voiceLang_nl: string;

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

  /** Widget flotante Xenon / asistente de voz */
  supportWidgetSubtitle: string;
  supportWidgetSettingsAria: string;
  supportWidgetPlayTitle: string;
  supportWidgetStopTitle: string;
  supportWidgetMicEnableTitle: string;
  supportWidgetMicDisableTitle: string;
  supportWidgetPoweredBy: string;
  supportWidgetAdvancedContact: string;
  supportWidgetAdvancedContactAria: string;
  supportWidgetLauncherTooltip: string;
  supportWidgetMicPermissionError: string;

  /** Notificaciones y fin de sesión (VoiceTestService) */
  voiceTestEndTimeout: string;
  voiceTestEndUser: string;
  voiceTestEndDisconnect: string;
  voiceTestEndReplaced: string;
  voiceTestEndError: string;
  voiceTestEndDefault: string;
  voiceTestMicPermissionDenied: string;
  voiceTestStartErrorPrefix: string;
  voiceTestUnknownError: string;
  voiceTestWsConnectFailed: string;

  // Edit agent page
  editAgentMainTab: string;
  editAgentAgentNameSection: string;
  editAgentFirstMessageSection: string;
  editAgentSystemMessageSection: string;
  editAgentCompanyNamePlaceholder: string;
  editAgentSystemMessageToggleAria: string;
  editAgentSystemMessagePlaceholder: string;
  editAgentTwilioConnectedAccount: string;
  editAgentTwilioValidatedAccount: string;
  editAgentTwilioAssignedAccountPrefix: string;
  editAgentSavingOnAgent: string;
  editAgentTwilioAccountIdLabel: string;
  editAgentValidate: string;
  editAgentValidated: string;
  editAgentTryAgentSound: string;
  editAgentMicActive: string;
  editAgentVoiceLabel: string;
  editAgentVoiceParamsSection: string;
  editAgentStability: string;
  editAgentSimilarity: string;
  editAgentStyle: string;
  editAgentSpeed: string;
  editAgentUnlinkStoreTitle: string;
  editAgentNotConnected: string;
  editAgentActionSingle: string;
  editAgentActionPlural: string;
  editAgentKnowledgeSourcesTitle: string;
  editAgentNoKnowledgeSourcesTitle: string;
  editAgentNoKnowledgeSourcesDescription: string;
  editAgentAddKnowledgeSourcesTitle: string;
  editAgentUnnamed: string;
  editAgentPdfMaxLabel: string;
  editAgentWebPage: string;
  editAgentLoadingAvailableSources: string;
  editAgentAvailableSources: string;
  editAgentSwipeToAddSource: string;
  editAgentAddSourceTitle: string;
  editAgentLoadingActions: string;
  editAgentConfiguredActions: string;
  editAgentNewAction: string;
  editAgentActionNameLabel: string;
  editAgentActionNamePlaceholder: string;
  editAgentActionDescriptionLabel: string;
  editAgentActionDescriptionPlaceholder: string;
  editAgentWebhookUrlLabel: string;
  editAgentWebhookPlaceholder: string;
  editAgentSaveAction: string;
  editAgentEditActionTitle: string;
  editAgentSaving: string;
  editAgentFieldRequired: string;
  editAgentFieldMin: string;
  editAgentFieldMax: string;
  knowledgeWebSourceInvalidUrl: string;
  knowledgeTextSourceError: string;
  knowledgeSourceLinkError: string;
  knowledgeSourceUnlinkedSuccess: string;
  knowledgeSourceUnlinkNotLinkedError: string;
  knowledgeSourceUnlinkAgentError: string;
  knowledgeSourceUnlinkConnectionError: string;

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
  upgradePlanStarter: string;
  upgradePlanGrowth: string;
  upgradePlanScale: string;
  upgradePlanStarterDesc: string;
  upgradePlanGrowthDesc: string;
  upgradePlanScaleDesc: string;
  upgradePlanStarterButton: string;
  /** Texto informativo bajo el CTA Starter (registro/onboarding), sin enlace. */
  upgradePlanStarterTrialTextLink: string;
  /** Etiqueta sobre la tarjeta Growth (plan destacado). */
  upgradePlanPopularBadge: string;
  upgradePlanGrowthButton: string;
  upgradePlanScaleButton: string;
  /** Botón deshabilitado del tier que ya tiene el usuario (modal Mejorar plan). */
  upgradePlanCurrentBadge: string;
  /** Tras cambiar de plan (API Stripe) desde el modal Mejorar plan. */
  upgradePlanChangeSuccess: string;
  /** Paso intermedio si Stripe no abre el portal de confirmación: resumen de importes. */
  upgradePlanChangeReviewTitle: string;
  upgradePlanChangeReviewHint: string;
  upgradePlanChangeReviewBack: string;
  upgradePlanChangeReviewConfirm: string;
  /** Etiqueta del importe total en el resumen de cambio de plan. */
  upgradePlanChangeReviewTotal: string;
  /** Pantalla dedicada `/dashboard/plan-change`. */
  planChangePageTitle: string;
  planChangePageSubtitle: string;
  planChangeBackPlans: string;
  planChangeBackAccount: string;
  planChangeCurrentPlanLabel: string;
  planChangeTargetPlanLabel: string;
  planChangeStripeNote: string;
  planChangeInvalidSession: string;
  /** Pie estilo portal de pago (Stripe). */
  planChangeStripeSecure: string;
  planChangeLoading: string;
  planChangeConfirming: string;
  planChangeLinesHeading: string;
  pricingFeatureIncludedMinutes: string;
  pricingFeatureAgents: string;
  pricingFeatureDocuments: string;
  pricingFeatureStorage: string;
  pricingFeatureSupport: string;
  pricingDocsStarter: string;
  pricingDocsGrowth: string;
  pricingDocsScale: string;
  pricingStorageScale: string;
  pricingSupportEmail: string;
  pricingSupportPriority: string;
  pricingSupportDedicated: string;
  pricingToggleMonthly: string;
  pricingToggleAnnual: string;
  pricingPerYear: string;
  pricingEquivalentTo: string;
  pricingPerMonthSlash: string;
  /** Texto junto al precio del modal de planes: «/mes» / «/month». */
  pricingPerMonthLabel: string;
  /** Pie del modal de pricing antes del enlace de email (planes enterprise). */
  pricingCustomPlansFooter: string;
  planUpgradeCelebrationTitleStarter: string;
  planUpgradeCelebrationTitleGrowth: string;
  planUpgradeCelebrationTitleScale: string;
  planUpgradeCelebrationMessageStarter: string;
  planUpgradeCelebrationMessageGrowth: string;
  planUpgradeCelebrationMessageScale: string;
  planUpgradeCelebrationTitlePro: string;
  planUpgradeCelebrationTitlePremium: string;
  planUpgradeCelebrationMessagePro: string;
  planUpgradeCelebrationMessagePremium: string;
  planUpgradeCelebrationSubline: string;
  planUpgradeCelebrationButton: string;
  planUpgradeCelebrationContinueDashboard: string;
  planUpgradeCelebrationWelcomeTop: string;
  planUpgradeCelebrationPlanWord: string;
  planUpgradeCelebrationBenefitsHeading: string;

  // Company setup / onboarding
  skipLabel: string;
  createFirstAgent: string;
  onboardingPlanIntroTitle: string;
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
  authGoogleLogin: string;
  authErrorGoogleLogin: string;
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
  /** Registro sin PIN/código por correo (flujo simplificado). */
  authSuccessRegisterNoPin: string;
  authErrorGetProfile: string;
  authErrorFillAll: string;
  authErrorMarketingConsent: string;
  authSuccessVerifyEmail: string;
  authErrorRegister: string;
  authErrorRecoverEmail: string;
  authSuccessRecover: string;
  authWelcomeRegister: string;
  authWelcomeRecover: string;
  authRegisterTitle: string;
  authRegisterSubtitle: string;
  authRegisterButton: string;
  authRecoverTitle: string;
  authRecoverSubtitle: string;
  authRecoverButton: string;
  authPromptNoAccount: string;
  authLinkRegister: string;
  authPromptAlreadyAccount: string;
  authLinkLogin: string;
  authPromptRecoverRemember: string;
  authErrorRecoverRequest: string;
  /** Tour primer agente (dashboard) */
  firstAgentTourStep1Title: string;
  firstAgentTourStep1Desc: string;
  firstAgentTourStep2Title: string;
  firstAgentTourStep2Desc: string;
  firstAgentTourNextToAgents: string;
  firstAgentTourDone: string;
  firstAgentTourSkip: string;
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
      metricsUsagePeriodHint: 'Periodo de facturación',
      minutes: 'Minutos',
      successRate: 'Tasa de éxito de las llamadas',
      planStarter: 'Plan Starter',
      boostEfficiency: 'Maximiza tu Eficiencia',
      unlockAdvancedFeatures: 'Desbloquea funciones avanzadas de automatización',
      upgradePlan: 'Mejorar plan',
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
      countryDialPopularSection: 'Más usadas',
      countryDialAllSection: 'Todos los países',
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
      costPerExtraMinute: 'Coste por minuto extra',
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
      knowledgeBaseScrollForMore: 'Desplázate para ver el resto',
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
      newsReadMore: 'Ver más',
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
      voiceSettingsSidebarTitle: 'Ajustes de voz',
      voiceParamStability: 'Estabilidad',
      voiceParamSimilarity: 'Similitud',
      voiceParamStyle: 'Estilo',
      voiceParamSpeed: 'Velocidad',
      voiceParamBoost: 'Boost',

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
      forbiddenTitle: 'Acceso no permitido',
      forbiddenDescription:
        'No tienes permiso para ver esta página. Si crees que es un error, inicia sesión con una cuenta autorizada o vuelve al panel.',
      forbiddenCtaHome: 'Ir al panel',
      forbiddenCtaLogin: 'Iniciar sesión',
      allRightsReserved: 'Todos los derechos reservados',

      // Metrics page
      last7Days: 'Esta semana',
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
      minuteUsageHeading: 'Uso del mes (UTC)',
      outOfMinutesBannerTitle: 'Sin minutos disponibles este mes',
      outOfMinutesBannerDesc:
        'No se atenderán llamadas entrantes hasta que tengas cupo. Sube de plan, obtén minutos extra o espera al siguiente periodo según tu caso.',
      planUnlimitedShort: 'Ilimitado (Premium)',
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
      accountMetricsTimezone: 'Zona horaria (métricas del panel)',
      accountMetricsTimezoneHint:
        'Define cómo se calculan semana y mes en el panel (lunes y día 1 a las 00:01 en esa zona). Por defecto: España peninsular.',
      accountTzEuropeMadrid: 'España (península)',
      accountTzAtlanticCanary: 'Canarias',
      accountTzEuropeLondon: 'Reino Unido (Londres)',
      accountTzEuropeParis: 'Francia (París)',
      accountTzEuropeBerlin: 'Alemania (Berlín)',
      accountTzAmericaMexicoCity: 'México',
      accountTzAmericaNewYork: 'EE. UU. (Este)',
      accountTzAmericaArgentina: 'Argentina (Buenos Aires)',
      accountTzUTC: 'UTC',
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
      trialDaysLeft: 'Días de prueba restantes',
      planUsageSummaryLabel: 'Uso del plan',
      agentsShort: 'agentes',
      docsShort: 'docs',
      http403PlanBlocked:
        'Tu plan actual no permite esta acción o el periodo de prueba ha finalizado.',
      http403PlanSuffix: 'Puedes mejorar tu plan en Suscripción.',
      planLimitModalTitle: 'Límite del plan',
      planLimitModalCta: 'Ver planes y suscripción',
      metricsPanelBasicHint:
        'Estás viendo el panel resumido de tu plan. Los análisis avanzados (latencia, países, horas pico, etc.) están disponibles desde Growth.',
      metricsUpgradePlanMessage: 'Mejora el plan para ver estas métricas',
      metricsExportCsvButton: 'Exportar CSV',
      trialBannerUpgrade: 'Mejorar plan',
      trialTimeRemainingLabel: 'Tiempo restante de la prueba gratuita',
      trialTimeRemainingLabelShort: 'Tiempo restante',
      cancelSubscription: 'Cancelar suscripción',
      invoicesHistory: 'Historial de facturas',
      manageBilling: 'Gestionar facturación',
      downloadLatestInvoice: 'Descarga última factura',
      downloadLatestInvoiceError:
        'No se pudo obtener la factura. Inténtalo de nuevo o usa «Gestionar facturación».',
      stripeBillingError:
        'No se pudo abrir la facturación. Inténtalo de nuevo o contacta con soporte.',
      stripeNoCustomerYet:
        'Aún no tienes suscripción de pago. Elige un plan en «Mejorar plan».',
      stripeBillingUpdated: 'Datos de suscripción actualizados.',
      stripeCheckoutCancelled: 'Pago cancelado. Puedes intentarlo cuando quieras.',
      stripePaymentPendingTitle: 'Pago pendiente de tu suscripción',
      stripePaymentPendingDesc:
        'Actualiza tu método de pago en el portal de facturación para seguir usando la plataforma.',
      billingChurnPageTitle: 'Tu plan se ha acabado',
      billingChurnPageSubtitle:
        'Para continuar usando la plataforma, elige de nuevo uno de los planes.',
      subscribeRequiredPaymentFailedTitle:
        'El pago no se ha realizado correctamente',
      subscribeRequiredPaymentFailedSubtitle:
        'Actualiza tu método de pago desde el portal de facturación (elige un plan abajo) o contrata de nuevo para seguir usando la plataforma.',
      planDisplaySinPlan: 'Sin plan',
      planDisplayTrial: 'Prueba',
      registrationPlanStepTitle: 'Elige cómo quieres empezar',
      registrationCancelCta: 'Cancelar registro y salir',
      onboardingPlanStepSubtitle:
        'Starter: 7 días de prueba en Stripe al pulsar «Empezar ahora» (tarjeta obligatoria; sin cargo durante la prueba). Growth y Scale: suscripción con tarjeta. Tras la prueba, el plan y facturación siguen las reglas de tu cuenta.',
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
      twilioAssignNumberToAgentButton: 'Asignar número al agente',
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
      editKnowledgeSource: 'Editar fuente',
      errorUpdatingKnowledge: 'No se pudo actualizar la fuente',
      uploadLimits: 'Límites de subida',
      pdfMax: 'PDF: Máximo',
      urlMax: 'URL: Máximo',
      textMax: 'Texto: Máximo',
      addWebSourceTitle: 'Añadir fuente web',
      addTextTitle: 'Añadir texto manual',
      addTextDocument: 'Añadir documento',
      manualTextDefault: 'Texto manual',
      textModalSourceNameLabel: 'Nombre de la fuente',
      textModalSourceNamePlaceholder: 'Ej. Instrucciones del cliente',
      textModalContentLabel: 'Contenido del texto',
      textModalCharactersSuffix: 'caracteres',
      textModalContentPlaceholder:
        'Escribe o pega aquí la información detallada que quieras añadir a la base de conocimiento...',
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
      knowledgeBaseDeleteConfirmTitle: 'Eliminar documento',
      knowledgeBaseDeleteConfirmMessage:
        '¿Seguro que quieres eliminar «{{name}}»? Esta acción no se puede deshacer.',
      knowledgeBaseDeleteConfirmButton: 'Eliminar',
      knowledgeBaseDeletingSource: 'Eliminando…',
      knowledgeBaseDeletedSuccess:
        '«{{name}}» se ha eliminado correctamente de la base de conocimientos.',
      knowledgeDocumentProcessingComplete:
        '«{{name}}» ha terminado de procesarse y ya está listo.',
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
      makeModalSidebarDesc:
        'Configura webhooks en Make.com para que tu agente dispare automatizaciones cuando lo necesites.',
      makeModalOpenMakeSite: 'Abrir Make.com',
      connectShopifyTitle: 'Conecta tu negocio de Shopify',
      outboundInstructionsLead:
        'Define el comportamiento del agente en llamadas salientes.',
      outboundCampaignStepTitle: 'Elegir campaña',
      outboundCampaignStepSubtitle:
        'Selecciona el tipo de acción que realizará el agente con tus clientes.',
      outboundImportCsvStepTitle: 'Importar CSV',
      outboundImportCsvStepSubtitle:
        'Sube un archivo con los números de teléfono a los que llamará el agente en esta campaña.',
      outboundImportCsvDropZone: 'Arrastra un CSV aquí o haz clic para elegir archivo',
      outboundImportCsvHint:
        'La primera columna de cada fila debe contener el teléfono (puedes incluir una fila de cabecera con «teléfono» o «phone»).',
      outboundImportCsvAcceptedFormats: 'Solo archivos .csv',
      outboundImportCsvDownloadTemplate: 'Descargar plantilla',
      outboundImportCsvPhonesCount: 'Números cargados',
      outboundImportCsvClearAll: 'Vaciar lista',
      outboundImportCsvRemove: 'Quitar número',
      outboundImportCsvPreviewMore: 'Y {n} más…',
      outboundImportCsvParseErrorInvalidType:
        'Selecciona un archivo .csv válido.',
      outboundImportCsvParseErrorRead: 'No se pudo leer el archivo. Inténtalo de nuevo.',
      outboundImportCsvParseErrorNoPhones:
        'No encontramos teléfonos válidos en el archivo. Revisa el formato y la primera columna.',
      outboundImportCsvParseErrorGeneric: 'No se pudo procesar el archivo.',
      outboundSegmentationStepTitle: 'Segmentación',
      outboundSegmentationStepSubtitle:
        'Indica a quién debe contactar el agente en esta campaña (perfil, criterios y exclusiones).',
      outboundSegAbandonTimeLabel: 'Tiempo desde abandono:',
      outboundSegAvgTicketLabel: 'Ticket promedio:',
      outboundSegCountryLabel: 'País/es:',
      outboundSegStateLabel: 'Estado:',
      outboundSegAdvancedAccordionTitle:
        'Segmentación de clientes avanzada por campaña',
      outboundSegCartProductsLabel: 'Producto/s en el carrito:',
      outboundSegCartValueLabel: 'Valor del carrito:',
      outboundSegCartItemsLabel: 'Número de ítems en el carrito:',
      outboundSegSurveyTimeSincePurchaseLabel: 'Tiempo desde el envío (compra):',
      outboundSegSurveyTicketLabel: 'Valor de ticket:',
      outboundSegPurchasedProductLabel: 'Producto comprado:',
      outboundSegPurchaseFrequencyLabel: 'Frecuencia de compra:',
      outboundSegPaymentDueLabel: 'Vencimiento del pago:',
      outboundSegPaymentTicketLabel: 'Valor de ticket:',
      outboundSegPlaceholderEuroExample: 'ej: 30€',
      outboundSegPlaceholderUnitsExample: 'ej: 30u',
      outboundSegSelectProducts: 'Producto/s',
      outboundSegAbandon24h: '24h',
      outboundSegAbandon48h: '48h',
      outboundSegAbandon7d: '7 días',
      outboundSegStateNew: 'Nuevo',
      outboundSegStateRecurring: 'Recurrente',
      outboundSegCountrySpain: 'España',
      outboundSegCountryPortugal: 'Portugal',
      outboundSegCountryFrance: 'Francia',
      outboundSegCountryMexico: 'México',
      outboundSegTime1h: '1h',
      outboundSegTime3h: '3h',
      outboundSegTime24h: '24h',
      outboundSegFreqFirstPurchase: 'Primera compra (nuevo cliente)',
      outboundSegFreqRepeat: 'Cliente recurrente',
      outboundSegDue1hBefore: '1h antes',
      outboundSegDue24hBefore: '24h antes',
      outboundSegDue48hBefore: '48h antes',
      outboundScheduleCampaignTitle: 'Programar campaña',
      outboundScheduleCampaignSubtitle:
        'Configura horarios, frecuencia y límites de llamadas.',
      outboundScheduleHorarioTitle: 'Horario de campaña',
      outboundScheduleBusinessHoursLabel: 'Horario comercial (Lun–Vie, 9h–18h)',
      outboundScheduleCustomLabel: 'Personalizado',
      outboundScheduleFrequencyTitle: 'Frecuencia y reglas',
      outboundScheduleInitialDelayLabel: 'Retraso inicial',
      outboundScheduleRetriesLabel: 'Reintentos',
      outboundScheduleRetriesTimesEach: 'veces cada',
      outboundScheduleMaxCallsLabel: 'Máx. llamadas:',
      outboundScheduleMaxCallsPerDay: 'por cliente/día',
      outboundScheduleDelay30mAbandon: '30 min después del abandono',
      outboundScheduleDelay1hAbandon: '1 h después del abandono',
      outboundScheduleDelay2hAbandon: '2 h después del abandono',
      outboundScheduleDelay24hAbandon: '24 h después del abandono',
      outboundScheduleCustomModalTitle: 'Horario personalizado',
      outboundScheduleCustomDaysHint: 'Días de llamada',
      outboundScheduleCustomTimeFrom: 'Desde',
      outboundScheduleCustomTimeTo: 'Hasta',
      outboundScheduleCustomSave: 'Guardar',
      outboundScheduleCustomCancel: 'Cancelar',
      outboundScheduleCustomEditCta: 'Editar horario',
      outboundScheduleWkMon: 'L',
      outboundScheduleWkTue: 'M',
      outboundScheduleWkWed: 'X',
      outboundScheduleWkThu: 'J',
      outboundScheduleWkFri: 'V',
      outboundScheduleWkSat: 'S',
      outboundScheduleWkSun: 'D',
      outboundInstructionsPhaseSaved:
        'Instrucciones guardadas. El alta saliente continuará en siguientes pasos; puedes seguir desde el panel.',
      outboundTplAbandonedTitle: 'Recuperación de carritos abandonados',
      outboundTplSatisfactionTitle: 'Encuestas de satisfacción',
      outboundTplPostPurchaseTitle: 'Ofertas post-compra',
      outboundTplPaymentTitle: 'Recordatorio de pago',
      outboundTplBlockSubtitle: 'Definir un mensaje de saludo personalizado',
      outboundTplAbandonedPlaceholder:
        'Hola {{customer_name}}, notamos que olvidaste completar tu compra de {{product_name}}. El total de tu carrito es {{cart_total}}. ¿Quieres que te ayude a finalizar el pedido ahora mismo?',
      outboundTplSatisfactionPlaceholder:
        'Hola {{customer_name}}, gracias por comprar en {{store_name}}. Queremos mejorar cada día y tu opinión es muy importante. En una escala del 1 al 5, ¿cómo valorarías tu experiencia con {{product_name}}?',
      outboundTplPostPurchasePlaceholder:
        'Hola {{customer_name}}, gracias por tu compra en {{store_name}}. Como agradecimiento, te damos un {{discount_code}} para tu próxima compra. Además, clientes que compraron {{product_name}} también suelen llevarse {{recommended_product}}. ¿Quieres que te lo enseñe ahora mismo?',
      outboundTplPaymentPlaceholder:
        'Hola {{customer_name}}, notamos que tu pago de {{cart_total}} en {{store_name}} aún está pendiente. Tu pedido está en estado: {{order_status}}. ¿Quieres que te ayude a completarlo antes de que el plazo venza {{due_date}}?',
      linkStoreDescription: 'Vincula tu tienda para que tu agente pueda usar tus datos reales.',
      shopifyConnectDesc: 'Conecta tu tienda para sincronizar productos, pedidos y clientes.',
      shopifyOnboardingAuthLoading:
        'Completando el proceso de asignar tienda a tu cuenta de Llamalo AI…',
      shopifyOnboardingTitle: 'Conecta tu cuenta de Shopify',
      shopifyOnboardingLoadingStores: 'Cargando tus tiendas conectadas...',
      shopifyOnboardingSubtitleHasStores:
        'Selecciona una de tus tiendas conectadas o conecta una nueva.',
      shopifyOnboardingSubtitleNew:
        'Introduce los datos de tu tienda para vincularla con Llamalo y empezar a configurar tu agente.',
      shopifyOnboardingConnectedStoresHeading: 'Tiendas conectadas',
      shopifyOnboardingStoreConnectedBadge: 'Tienda conectada',
      shopifyOnboardingConnectNewStore: '+ Conectar nueva tienda',
      shopifyOnboardingDomainLabel: 'Dominio de Shopify',
      shopifyOnboardingDomainPlaceholder: 'Ej. mi-tienda.myshopify.com',
      shopifyOnboardingDomainInvalidHint:
        'El dominio debe terminar en .myshopify.com (ej. mi-tienda.myshopify.com)',
      shopifyOnboardingErrorSelectOrDomain:
        'Por favor, selecciona una tienda o ingresa un dominio válido.',
      shopifyOnboardingErrorDomainSuffix:
        'El dominio debe terminar en .myshopify.com',
      shopifyOnboardingErrorNoAuthUrl:
        'No se recibió la URL de autorización.',
      shopifyOnboardingErrorServer:
        'No se pudo conectar con el servidor. Inténtalo de nuevo.',
      shopifySuccessErrorTitle: 'Error al conectar con Shopify',
      shopifySuccessErrorFallback:
        'No se pudo completar la conexión. Comprueba el dominio e inténtalo de nuevo.',
      shopifySuccessTitle: 'Cuenta de Shopify conectada',
      shopifySuccessYourStore: 'Tu tienda',
      shopifySuccessLinkedRest:
        'se ha vinculado correctamente con Llamalo. Puedes continuar configurando tu agente.',
      shopifySuccessContinueCta: 'Continuar configurando el agente',
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
      shopifyConnectAnotherAccount: 'Conectar nueva cuenta',
      shopifyManageConnectionBtn: 'Gestionar',
      shopifyConnectedSummaryManySuffix: 'tiendas conectadas',
      shopifyConnectedAccountsHeading: 'Tiendas conectadas',
      shopifyDisconnectConfirmTitle: 'Desvincular tienda Shopify',
      shopifyDisconnectConfirmMessage:
        '¿Seguro que quieres desvincular la tienda {{shop}}? Los agentes que la usen dejarán de sincronizar con esa tienda hasta que vuelvas a conectarla.',
      shopifyDisconnectConfirmAction: 'Desvincular',
      shopifyDisconnectedSuccess: 'Tienda Shopify desvinculada.',
      shopifyDisconnectError: 'No se pudo desvincular la tienda. Inténtalo de nuevo.',
      shopifyIntegrationLockedMessage:
        'La integración con Shopify está disponible desde el plan Growth.',
      outboundFeatureLockedMessage:
        '"Saliente" Disponible en planes superiores',
      testAgentTitle: 'Prueba de agente',
      talkToAgentDescription: 'Habla con tu agente para verificar su voz, idioma e instrucciones antes de crear.',
      remainingTime: 'restantes',
      backToAgents: 'Volver a Agentes',
      agentReadyDescription: 'Tu agente está listo para recibir llamadas. Ya puedes volver atrás y gestionarlo desde la página de agentes.',
      languageAndVoice: 'Lenguaje y voz',
      chooseCountryAndVoice: 'Elige el país y la voz de tu agente',
      countryLabel: 'País',
      voiceLang_es: 'Español',
      voiceLang_en: 'Inglés',
      voiceLang_fr: 'Francés',
      voiceLang_it: 'Italiano',
      voiceLang_de: 'Alemán',
      voiceLang_pt: 'Portugués',
      voiceLang_us: 'Inglés (EE. UU.)',
      voiceLang_tr: 'Turco',
      voiceLang_se: 'Sueco',
      voiceLang_nl: 'Neerlandés',

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
      editAgentMainTab: 'Principal',
      editAgentAgentNameSection: 'Nombre del agente',
      editAgentFirstMessageSection: 'Primer mensaje',
      editAgentSystemMessageSection: 'Mensaje del sistema',
      editAgentCompanyNamePlaceholder: 'Nombre de la empresa',
      editAgentSystemMessageToggleAria: 'Expandir o contraer mensaje del sistema',
      editAgentSystemMessagePlaceholder: 'Eres un asistente útil.',
      editAgentTwilioConnectedAccount: 'Cuenta conectada',
      editAgentTwilioValidatedAccount: 'Cuenta validada',
      editAgentTwilioAssignedAccountPrefix: 'Cuenta asignada al agente · ID',
      editAgentSavingOnAgent: 'Guardando en el agente...',
      editAgentTwilioAccountIdLabel: 'Cuenta ID:',
      editAgentValidate: 'Validar',
      editAgentValidated: 'Validado',
      editAgentTryAgentSound: 'Prueba cómo suena este agente',
      editAgentMicActive: 'Micrófono activo',
      editAgentVoiceLabel: 'Voz',
      editAgentVoiceParamsSection: 'Parámetros de voz',
      editAgentStability: 'Estabilidad',
      editAgentSimilarity: 'Similitud',
      editAgentStyle: 'Estilo',
      editAgentSpeed: 'Velocidad',
      editAgentUnlinkStoreTitle: 'Desvincular tienda',
      editAgentNotConnected: 'No conectado',
      editAgentActionSingle: 'acción',
      editAgentActionPlural: 'acciones',
      editAgentKnowledgeSourcesTitle: 'Fuentes de conocimiento',
      editAgentNoKnowledgeSourcesTitle:
        'Este agente no tiene fuentes de conocimiento configuradas.',
      editAgentNoKnowledgeSourcesDescription:
        'Las fuentes de conocimiento ayudan al agente a proporcionar respuestas más precisas.',
      editAgentAddKnowledgeSourcesTitle: 'Añadir fuentes de conocimiento',
      editAgentUnnamed: 'Sin nombre',
      editAgentPdfMaxLabel: 'Máx. 10MB',
      editAgentWebPage: 'Página web',
      editAgentLoadingAvailableSources: 'Cargando fuentes disponibles...',
      editAgentAvailableSources: 'Fuentes disponibles',
      editAgentSwipeToAddSource: 'Desliza hacia la derecha para añadir la fuente',
      editAgentAddSourceTitle: 'Añadir fuente',
      editAgentLoadingActions: 'Cargando acciones...',
      editAgentConfiguredActions: 'Acciones configuradas',
      editAgentNewAction: 'Nueva acción',
      editAgentActionNameLabel: 'Nombre de la acción *',
      editAgentActionNamePlaceholder: 'Ej. Avisar equipo ventas',
      editAgentActionDescriptionLabel: 'Descripción (opcional)',
      editAgentActionDescriptionPlaceholder: 'Cuándo debe usarla la IA',
      editAgentWebhookUrlLabel: 'URL del webhook (HTTPS) *',
      editAgentWebhookPlaceholder: 'https://hook.eu2.make.com/...',
      editAgentSaveAction: 'Guardar acción',
      editAgentEditActionTitle: 'Editar acción',
      editAgentSaving: 'Guardando...',
      editAgentFieldRequired: 'Este campo es obligatorio',
      editAgentFieldMin: 'El valor mínimo es',
      editAgentFieldMax: 'El valor máximo es',
      knowledgeWebSourceInvalidUrl: 'URL inválida o no accesible',
      knowledgeTextSourceError: 'Error al crear la fuente de texto',
      knowledgeSourceLinkError: 'Error al vincular la fuente de conocimiento al agente',
      knowledgeSourceUnlinkedSuccess: 'Fuente desvinculada exitosamente',
      knowledgeSourceUnlinkNotLinkedError:
        'La fuente de conocimiento no estaba vinculada a este agente',
      knowledgeSourceUnlinkAgentError:
        'Error al desvincular la fuente de conocimiento del agente',
      knowledgeSourceUnlinkConnectionError:
        'Error de conexión al desvincular la fuente de conocimiento',

      supportWidgetSubtitle: 'chat de soporte',
      supportWidgetSettingsAria: 'Ajustes',
      supportWidgetPlayTitle: 'Reproducir',
      supportWidgetStopTitle: 'Detener',
      supportWidgetMicEnableTitle: 'Activar micrófono',
      supportWidgetMicDisableTitle: 'Desactivar micrófono',
      supportWidgetPoweredBy: 'Powered by Llamalo AI',
      supportWidgetAdvancedContact:
        'Para consultas avanzadas, contáctanos en',
      supportWidgetAdvancedContactAria:
        'Contacto para consultas avanzadas',
      supportWidgetLauncherTooltip: 'Asistente de voz',
      supportWidgetMicPermissionError:
        'No se pudo acceder al micrófono. Por favor, verifica los permisos.',

      voiceTestEndTimeout:
        'La prueba ha finalizado porque se alcanzó el tiempo máximo de 2 minutos.',
      voiceTestEndUser: 'Has finalizado la prueba.',
      voiceTestEndDisconnect: 'La conexión se ha perdido.',
      voiceTestEndReplaced: 'La sesión fue reemplazada por otra prueba.',
      voiceTestEndError: 'La sesión finalizó debido a un error.',
      voiceTestEndDefault: 'La prueba ha finalizado.',
      voiceTestMicPermissionDenied:
        'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en tu navegador.',
      voiceTestStartErrorPrefix: 'Error al iniciar la prueba de voz: ',
      voiceTestUnknownError: 'Error desconocido',
      voiceTestWsConnectFailed:
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',

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
      upgradePlanStarter: 'Starter',
      upgradePlanGrowth: 'Growth',
      upgradePlanScale: 'Scale',
      upgradePlanStarterDesc: 'Para empezar con agentes de voz y base de conocimiento.',
      upgradePlanGrowthDesc: 'Más minutos y capacidad para equipos en crecimiento.',
      upgradePlanScaleDesc: 'Escala máxima para alto volumen.\nSoporte dedicado.',
      upgradePlanStarterButton: 'Empezar ahora',
      upgradePlanStarterTrialTextLink:
        'Prueba de 7 días en Stripe: se pedirá tarjeta sin cargo hasta que termine la prueba.',
      upgradePlanPopularBadge: 'POPULAR',
      upgradePlanGrowthButton: 'Empezar ahora',
      upgradePlanScaleButton: 'Comenzar ahora',
      upgradePlanCurrentBadge: 'PLAN ACTUAL',
      upgradePlanChangeSuccess:
        'Plan actualizado correctamente. Los cambios de facturación los verás en Stripe.',
      upgradePlanChangeReviewTitle: 'Resumen del cambio de plan',
      upgradePlanChangeReviewHint:
        'Vista previa de la próxima factura (prorrateo). Si no se abrió la página de confirmación de Stripe, puedes confirmar aquí.',
      upgradePlanChangeReviewBack: 'Volver a planes',
      upgradePlanChangeReviewConfirm: 'Confirmar cambio',
      upgradePlanChangeReviewTotal: 'Total estimado a pagar',
      planChangePageTitle: 'Confirmar cambio de plan',
      planChangePageSubtitle:
        'Revisa el resumen calculado por Stripe (prorrateo e importes). Al confirmar, actualizamos tu suscripción y el cobro lo gestiona Stripe.',
      planChangeBackPlans: 'Volver a planes',
      planChangeBackAccount: 'Ir a facturación',
      planChangeCurrentPlanLabel: 'Plan actual',
      planChangeTargetPlanLabel: 'Nuevo plan',
      planChangeStripeNote:
        'Los importes son una vista previa; el cargo final puede variar ligeramente según el momento exacto del cambio y tu método de pago.',
      planChangeInvalidSession:
        'No hay una suscripción activa para cambiar de plan. Contrata o revisa facturación.',
      planChangeStripeSecure: 'Pago seguro con Stripe',
      planChangeLoading: 'Calculando el resumen…',
      planChangeConfirming: 'Confirmando…',
      planChangeLinesHeading: 'Desglose',
      pricingFeatureIncludedMinutes: 'Minutos incluidos',
      pricingFeatureAgents: 'Agentes',
      pricingFeatureDocuments: 'Documentos',
      pricingFeatureStorage: 'Almacenamiento',
      pricingFeatureSupport: 'Soporte',
      pricingDocsStarter: '5',
      pricingDocsGrowth: '20',
      pricingDocsScale: '60',
      pricingStorageScale: '1,5 GB',
      pricingSupportEmail: 'Email',
      pricingSupportPriority: 'Prioritario',
      pricingSupportDedicated: 'Dedicado',
      pricingToggleMonthly: 'Mensual',
      pricingToggleAnnual: 'Anual',
      pricingPerYear: 'año',
      pricingEquivalentTo: 'Equivale a',
      pricingPerMonthSlash: '/mes',
      pricingPerMonthLabel: '/mes',
      pricingCustomPlansFooter:
        'Para planes personalizados dirigidos a grandes corporaciones, puedes contactarnos en',
      planUpgradeCelebrationTitleStarter: '¡Bienvenido a tu plan Starter!',
      planUpgradeCelebrationTitleGrowth: '¡Bienvenido a tu plan Growth!',
      planUpgradeCelebrationTitleScale: '¡Bienvenido a tu plan Scale!',
      planUpgradeCelebrationMessageStarter:
        'Disfruta de minutos incluidos, agentes y documentos para empezar fuerte con Llamalo.',
      planUpgradeCelebrationMessageGrowth:
        'Has dado un salto de escala: más minutos, agentes y almacenamiento para tu equipo.',
      planUpgradeCelebrationMessageScale:
        'Estás en el plan más completo: máxima capacidad, almacenamiento y soporte dedicado.',
      planUpgradeCelebrationTitlePro: '¡Bienvenido a tu nuevo plan Pro!',
      planUpgradeCelebrationTitlePremium: '¡Bienvenido a tu nuevo plan Premium!',
      planUpgradeCelebrationMessagePro:
        'Has dado un gran salto: más agentes, minutos e integraciones para seguir creciendo con Llamalo.',
      planUpgradeCelebrationMessagePremium:
        'Estás en el plan más completo: capacidad ampliada, prioridad y el mejor acompañamiento.',
      planUpgradeCelebrationSubline:
        'Desde el panel puedes seguir creando agentes, revisar métricas y conectar todo lo que tu negocio necesita.',
      planUpgradeCelebrationButton: '¡Genial!',
      planUpgradeCelebrationContinueDashboard: 'Volver al dashboard',
      planUpgradeCelebrationWelcomeTop: 'Bienvenido a tu nuevo plan',
      planUpgradeCelebrationPlanWord: 'Plan',
      planUpgradeCelebrationBenefitsHeading: 'Ventajas adquiridas',

      // Company setup
      skipLabel: 'Saltar',
      createFirstAgent: 'Crea tu primer agente',
      onboardingPlanIntroTitle: 'Elige tu plan',
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
      authGoogleLogin: 'Continuar con Google',
      authErrorGoogleLogin:
        'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
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
      authSuccessRegisterNoPin:
        'Cuenta creada. Ya puedes continuar con la configuración.',
      authErrorGetProfile: 'Error al obtener perfil de usuario',
      authErrorFillAll: 'Por favor, completa todos los campos',
      authErrorMarketingConsent: 'Debes aceptar el consentimiento de marketing para continuar',
      authSuccessVerifyEmail: 'Ahora debe ir a su correo electrónico y validarlo para poder acceder a su cuenta.',
      authErrorRegister: 'Error al registrar usuario. Por favor, inténtelo de nuevo.',
      authErrorRecoverEmail: 'Ingresa tu correo para recuperar la contraseña',
      authSuccessRecover: 'Si el correo existe, recibirás instrucciones de recuperación.',
      authWelcomeRegister: 'Crea tu cuenta en Llamalo',
      authWelcomeRecover: 'Recupera el acceso a tu cuenta',
      authRegisterTitle: 'Crear cuenta',
      authRegisterSubtitle: 'Completa tus datos para registrarte',
      authRegisterButton: 'Registrarse',
      authRecoverTitle: 'Recuperar contraseña',
      authRecoverSubtitle: 'Te enviaremos un enlace a tu correo',
      authRecoverButton: 'Enviar enlace',
      authPromptNoAccount: '¿No tienes cuenta?',
      authLinkRegister: 'Regístrate',
      authPromptAlreadyAccount: '¿Ya tienes cuenta?',
      authLinkLogin: 'Iniciar sesión',
      authPromptRecoverRemember: '¿Recordaste tu contraseña?',
      authErrorRecoverRequest:
        'No se pudo enviar el correo de recuperación. Inténtalo de nuevo.',
      firstAgentTourStep1Title: 'Tu primer agente de voz',
      firstAgentTourStep1Desc:
        'En el menú lateral, pulsa <strong>Agentes</strong> para abrir la lista. Después te indicaremos cómo crear uno.',
      firstAgentTourStep2Title: 'Crear tu agente',
      firstAgentTourStep2Desc:
        'Pulsa <strong>Agregar agente</strong> para comenzar el asistente guiado de creación.',
      firstAgentTourNextToAgents: 'Ir a Agentes',
      firstAgentTourDone: 'Entendido',
      firstAgentTourSkip: 'Saltar',
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
      metricsUsagePeriodHint: 'Billing period',
      minutes: 'Minutes',
      successRate: 'Call success rate',
      planStarter: 'Starter Plan',
      boostEfficiency: 'Maximize Your Efficiency',
      unlockAdvancedFeatures: 'Unlock advanced automation features',
      upgradePlan: 'Upgrade plan',
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
      countryDialPopularSection: 'Most used',
      countryDialAllSection: 'All countries',
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
      costPerExtraMinute: 'Cost per extra minute',
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
      knowledgeBaseScrollForMore: 'Scroll to see more',
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
      newsReadMore: 'Read more',
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
      voiceSettingsSidebarTitle: 'Voice settings',
      voiceParamStability: 'Stability',
      voiceParamSimilarity: 'Similarity',
      voiceParamStyle: 'Style',
      voiceParamSpeed: 'Speed',
      voiceParamBoost: 'Boost',

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
      forbiddenTitle: 'Access denied',
      forbiddenDescription:
        'You do not have permission to view this page. If you think this is a mistake, sign in with an authorized account or return to the dashboard.',
      forbiddenCtaHome: 'Go to dashboard',
      forbiddenCtaLogin: 'Sign in',
      allRightsReserved: 'All rights reserved',

      // Metrics page
      last7Days: 'This week',
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
      minuteUsageHeading: 'Usage this month (UTC)',
      outOfMinutesBannerTitle: 'No minutes left this month',
      outOfMinutesBannerDesc:
        'Inbound calls will not be answered until you have quota. Upgrade your plan, earn extra minutes, or wait for the next period as applicable.',
      planUnlimitedShort: 'Unlimited (Premium)',
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
      accountMetricsTimezone: 'Time zone (panel metrics)',
      accountMetricsTimezoneHint:
        'Defines how week and month boundaries are calculated in the panel (Monday and 1st at 00:01 in that zone). Default: mainland Spain.',
      accountTzEuropeMadrid: 'Spain (mainland)',
      accountTzAtlanticCanary: 'Canary Islands',
      accountTzEuropeLondon: 'United Kingdom (London)',
      accountTzEuropeParis: 'France (Paris)',
      accountTzEuropeBerlin: 'Germany (Berlin)',
      accountTzAmericaMexicoCity: 'Mexico',
      accountTzAmericaNewYork: 'US (Eastern)',
      accountTzAmericaArgentina: 'Argentina (Buenos Aires)',
      accountTzUTC: 'UTC',
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
      trialDaysLeft: 'Trial days left',
      planUsageSummaryLabel: 'Plan usage',
      agentsShort: 'agents',
      docsShort: 'docs',
      http403PlanBlocked:
        'Your current plan does not allow this action or your trial has ended.',
      http403PlanSuffix: 'You can upgrade in Subscription.',
      planLimitModalTitle: 'Plan limit',
      planLimitModalCta: 'View plans and billing',
      metricsPanelBasicHint:
        'You are viewing the summary dashboard for your plan. Advanced analytics (latency, countries, peak hours, etc.) are available from Growth.',
      metricsUpgradePlanMessage: 'Upgrade your plan to see these metrics',
      metricsExportCsvButton: 'Export CSV',
      trialBannerUpgrade: 'Upgrade plan',
      trialTimeRemainingLabel: 'Time remaining on the free trial',
      trialTimeRemainingLabelShort: 'Time remaining',
      cancelSubscription: 'Cancel subscription',
      invoicesHistory: 'Invoices history',
      manageBilling: 'Manage billing',
      downloadLatestInvoice: 'Download latest invoice',
      downloadLatestInvoiceError:
        'Could not fetch the invoice. Try again or use Manage billing.',
      stripeBillingError:
        'Could not open billing. Please try again or contact support.',
      stripeNoCustomerYet:
        'You do not have an active paid subscription yet. Choose a plan under Upgrade.',
      stripeBillingUpdated: 'Subscription details updated.',
      stripeCheckoutCancelled: 'Payment cancelled. You can try again anytime.',
      stripePaymentPendingTitle: 'Subscription payment pending',
      stripePaymentPendingDesc:
        'Update your payment method in the billing portal to keep using the platform.',
      billingChurnPageTitle: 'Your plan has ended',
      billingChurnPageSubtitle:
        'To keep using the platform, choose a plan again below.',
      subscribeRequiredPaymentFailedTitle: 'Your payment could not be completed',
      subscribeRequiredPaymentFailedSubtitle:
        'Update your payment method in the billing portal (choose a plan below) or subscribe again to keep using the platform.',
      planDisplaySinPlan: 'No plan',
      planDisplayTrial: 'Trial',
      registrationPlanStepTitle: 'Choose how to get started',
      registrationCancelCta: 'Cancel sign-up and exit',
      onboardingPlanStepSubtitle:
        'Starter: start a 7-day trial in Stripe with «Start now» (card required; no charge during the trial). Growth and Scale: subscribe with a card. After the trial, billing follows your account rules.',
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
      twilioAssignNumberToAgentButton: 'Assign number to agent',
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
      editKnowledgeSource: 'Edit source',
      errorUpdatingKnowledge: 'Could not update the source',
      uploadLimits: 'Upload limits',
      pdfMax: 'PDF: Max',
      urlMax: 'URL: Max',
      textMax: 'Text: Max',
      addWebSourceTitle: 'Add web source',
      addTextTitle: 'Add manual text',
      addTextDocument: 'Add document',
      manualTextDefault: 'Manual text',
      textModalSourceNameLabel: 'Source name',
      textModalSourceNamePlaceholder: 'e.g. Customer instructions',
      textModalContentLabel: 'Text content',
      textModalCharactersSuffix: 'characters',
      textModalContentPlaceholder:
        'Write or paste here the detailed information you want to add to the knowledge base...',
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
      knowledgeBaseDeleteConfirmTitle: 'Delete document',
      knowledgeBaseDeleteConfirmMessage:
        'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
      knowledgeBaseDeleteConfirmButton: 'Delete',
      knowledgeBaseDeletingSource: 'Deleting…',
      knowledgeBaseDeletedSuccess:
        '"{{name}}" has been deleted from your knowledge base.',
      knowledgeDocumentProcessingComplete:
        '"{{name}}" has finished processing and is ready.',
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
      makeModalSidebarDesc:
        'Set up webhooks in Make.com so your agent can trigger automations when needed.',
      makeModalOpenMakeSite: 'Open Make.com',
      connectShopifyTitle: 'Connect your Shopify business',
      outboundInstructionsLead:
        'Define how the agent should behave on outbound calls.',
      outboundCampaignStepTitle: 'Choose campaign',
      outboundCampaignStepSubtitle:
        'Select the type of action the agent will perform with your customers.',
      outboundImportCsvStepTitle: 'Import CSV',
      outboundImportCsvStepSubtitle:
        'Upload a file with the phone numbers your agent will call in this campaign.',
      outboundImportCsvDropZone: 'Drag a CSV here or click to browse',
      outboundImportCsvHint:
        'The first column of each row must contain the phone number (you may use a header row like “phone” or “teléfono”).',
      outboundImportCsvAcceptedFormats: '.csv files only',
      outboundImportCsvDownloadTemplate: 'Download template',
      outboundImportCsvPhonesCount: 'Loaded numbers',
      outboundImportCsvClearAll: 'Clear list',
      outboundImportCsvRemove: 'Remove number',
      outboundImportCsvPreviewMore: 'And {n} more…',
      outboundImportCsvParseErrorInvalidType: 'Please choose a valid .csv file.',
      outboundImportCsvParseErrorRead: 'Could not read the file. Please try again.',
      outboundImportCsvParseErrorNoPhones:
        'No valid phone numbers were found. Check the format and the first column.',
      outboundImportCsvParseErrorGeneric: 'Could not process the file.',
      outboundSegmentationStepTitle: 'Segmentation',
      outboundSegmentationStepSubtitle:
        'Describe who the agent should reach in this campaign (profile, criteria, exclusions).',
      outboundSegAbandonTimeLabel: 'Time since abandonment:',
      outboundSegAvgTicketLabel: 'Average order value:',
      outboundSegCountryLabel: 'Country / countries:',
      outboundSegStateLabel: 'Status:',
      outboundSegAdvancedAccordionTitle: 'Advanced customer segmentation by campaign',
      outboundSegCartProductsLabel: 'Product(s) in cart:',
      outboundSegCartValueLabel: 'Cart value:',
      outboundSegCartItemsLabel: 'Number of items in cart:',
      outboundSegSurveyTimeSincePurchaseLabel: 'Time since shipping (purchase):',
      outboundSegSurveyTicketLabel: 'Order value:',
      outboundSegPurchasedProductLabel: 'Purchased product:',
      outboundSegPurchaseFrequencyLabel: 'Purchase frequency:',
      outboundSegPaymentDueLabel: 'Payment due:',
      outboundSegPaymentTicketLabel: 'Order value:',
      outboundSegPlaceholderEuroExample: 'e.g. 30€',
      outboundSegPlaceholderUnitsExample: 'e.g. 30 units',
      outboundSegSelectProducts: 'Product(s)',
      outboundSegAbandon24h: '24h',
      outboundSegAbandon48h: '48h',
      outboundSegAbandon7d: '7 days',
      outboundSegStateNew: 'New',
      outboundSegStateRecurring: 'Returning',
      outboundSegCountrySpain: 'Spain',
      outboundSegCountryPortugal: 'Portugal',
      outboundSegCountryFrance: 'France',
      outboundSegCountryMexico: 'Mexico',
      outboundSegTime1h: '1h',
      outboundSegTime3h: '3h',
      outboundSegTime24h: '24h',
      outboundSegFreqFirstPurchase: 'First purchase (new customer)',
      outboundSegFreqRepeat: 'Returning customer',
      outboundSegDue1hBefore: '1h before',
      outboundSegDue24hBefore: '24h before',
      outboundSegDue48hBefore: '48h before',
      outboundScheduleCampaignTitle: 'Schedule campaign',
      outboundScheduleCampaignSubtitle:
        'Set schedules, frequency, and call limits.',
      outboundScheduleHorarioTitle: 'Campaign schedule',
      outboundScheduleBusinessHoursLabel: 'Business hours (Mon–Fri, 9am–6pm)',
      outboundScheduleCustomLabel: 'Custom',
      outboundScheduleFrequencyTitle: 'Frequency and rules',
      outboundScheduleInitialDelayLabel: 'Initial delay',
      outboundScheduleRetriesLabel: 'Retries',
      outboundScheduleRetriesTimesEach: 'times every',
      outboundScheduleMaxCallsLabel: 'Max. calls:',
      outboundScheduleMaxCallsPerDay: 'per customer/day',
      outboundScheduleDelay30mAbandon: '30 min after abandonment',
      outboundScheduleDelay1hAbandon: '1 h after abandonment',
      outboundScheduleDelay2hAbandon: '2 h after abandonment',
      outboundScheduleDelay24hAbandon: '24 h after abandonment',
      outboundScheduleCustomModalTitle: 'Custom schedule',
      outboundScheduleCustomDaysHint: 'Call days',
      outboundScheduleCustomTimeFrom: 'From',
      outboundScheduleCustomTimeTo: 'To',
      outboundScheduleCustomSave: 'Save',
      outboundScheduleCustomCancel: 'Cancel',
      outboundScheduleCustomEditCta: 'Edit schedule',
      outboundScheduleWkMon: 'Mo',
      outboundScheduleWkTue: 'Tu',
      outboundScheduleWkWed: 'We',
      outboundScheduleWkThu: 'Th',
      outboundScheduleWkFri: 'Fr',
      outboundScheduleWkSat: 'Sa',
      outboundScheduleWkSun: 'Su',
      outboundInstructionsPhaseSaved:
        'Instructions saved. Outbound setup will continue in further steps; you can resume from the dashboard.',
      outboundTplAbandonedTitle: 'Abandoned cart recovery',
      outboundTplSatisfactionTitle: 'Satisfaction surveys',
      outboundTplPostPurchaseTitle: 'Post-purchase offers',
      outboundTplPaymentTitle: 'Payment reminder',
      outboundTplBlockSubtitle: 'Define a personalized greeting message',
      outboundTplAbandonedPlaceholder:
        'Hi {{customer_name}}, we noticed you didn\'t complete your purchase of {{product_name}}. Your cart total is {{cart_total}}. Would you like me to help you finish the order now?',
      outboundTplSatisfactionPlaceholder:
        'Hi {{customer_name}}, thanks for shopping at {{store_name}}. We\'re always improving and your feedback matters. On a scale of 1 to 5, how would you rate your experience with {{product_name}}?',
      outboundTplPostPurchasePlaceholder:
        'Hi {{customer_name}}, thanks for your purchase at {{store_name}}. As a thank-you, here\'s {{discount_code}} for your next purchase. Customers who bought {{product_name}} often also get {{recommended_product}}. Would you like me to tell you more now?',
      outboundTplPaymentPlaceholder:
        'Hi {{customer_name}}, we noticed your payment of {{cart_total}} at {{store_name}} is still pending. Your order status is: {{order_status}}. Would you like help completing it before the deadline {{due_date}}?',
      linkStoreDescription: 'Link your store so your agent can use your real data.',
      shopifyConnectDesc: 'Connect your store to sync products, orders and customers.',
      shopifyOnboardingAuthLoading:
        'Completing the process of linking your store to your Llamalo AI account…',
      shopifyOnboardingTitle: 'Connect your Shopify account',
      shopifyOnboardingLoadingStores: 'Loading your connected stores...',
      shopifyOnboardingSubtitleHasStores:
        'Select one of your connected stores or connect a new one.',
      shopifyOnboardingSubtitleNew:
        'Enter your store details to link it with Llamalo and start configuring your agent.',
      shopifyOnboardingConnectedStoresHeading: 'Connected stores',
      shopifyOnboardingStoreConnectedBadge: 'Connected store',
      shopifyOnboardingConnectNewStore: '+ Connect new store',
      shopifyOnboardingDomainLabel: 'Shopify domain',
      shopifyOnboardingDomainPlaceholder: 'E.g. my-store.myshopify.com',
      shopifyOnboardingDomainInvalidHint:
        'The domain must end in .myshopify.com (e.g. my-store.myshopify.com)',
      shopifyOnboardingErrorSelectOrDomain:
        'Please select a store or enter a valid domain.',
      shopifyOnboardingErrorDomainSuffix:
        'The domain must end in .myshopify.com',
      shopifyOnboardingErrorNoAuthUrl: 'Authorization URL was not received.',
      shopifyOnboardingErrorServer:
        'Could not connect to the server. Please try again.',
      shopifySuccessErrorTitle: 'Error connecting to Shopify',
      shopifySuccessErrorFallback:
        'The connection could not be completed. Check the domain and try again.',
      shopifySuccessTitle: 'Shopify account connected',
      shopifySuccessYourStore: 'Your store',
      shopifySuccessLinkedRest:
        'has been linked successfully with Llamalo. You can continue configuring your agent.',
      shopifySuccessContinueCta: 'Continue configuring your agent',
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
      shopifyConnectAnotherAccount: 'Connect new account',
      shopifyManageConnectionBtn: 'Manage',
      shopifyConnectedSummaryManySuffix: 'connected stores',
      shopifyConnectedAccountsHeading: 'Connected stores',
      shopifyDisconnectConfirmTitle: 'Disconnect Shopify store',
      shopifyDisconnectConfirmMessage:
        'Are you sure you want to disconnect {{shop}}? Agents using it will stop syncing with that store until you connect it again.',
      shopifyDisconnectConfirmAction: 'Disconnect',
      shopifyDisconnectedSuccess: 'Shopify store disconnected.',
      shopifyDisconnectError: 'Could not disconnect the store. Please try again.',
      shopifyIntegrationLockedMessage:
        'Shopify integration is available from the Growth plan.',
      outboundFeatureLockedMessage:
        '"Outbound" Available on higher plans',
      testAgentTitle: 'Agent test',
      talkToAgentDescription: 'Talk to your agent to verify its voice, language and instructions before creating.',
      remainingTime: 'remaining',
      backToAgents: 'Back to Agents',
      agentReadyDescription: 'Your agent is ready to receive calls. You can go back and manage it from the agents page.',
      languageAndVoice: 'Language and voice',
      chooseCountryAndVoice: 'Choose your agent\'s country and voice',
      countryLabel: 'Country',
      voiceLang_es: 'Spanish',
      voiceLang_en: 'English',
      voiceLang_fr: 'French',
      voiceLang_it: 'Italian',
      voiceLang_de: 'German',
      voiceLang_pt: 'Portuguese',
      voiceLang_us: 'English (US)',
      voiceLang_tr: 'Turkish',
      voiceLang_se: 'Swedish',
      voiceLang_nl: 'Dutch',

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
      editAgentMainTab: 'Main',
      editAgentAgentNameSection: 'Agent name',
      editAgentFirstMessageSection: 'First message',
      editAgentSystemMessageSection: 'System message',
      editAgentCompanyNamePlaceholder: 'Company name',
      editAgentSystemMessageToggleAria: 'Expand or collapse system message',
      editAgentSystemMessagePlaceholder: 'You are a helpful assistant.',
      editAgentTwilioConnectedAccount: 'Connected account',
      editAgentTwilioValidatedAccount: 'Validated account',
      editAgentTwilioAssignedAccountPrefix: 'Account assigned to the agent · ID',
      editAgentSavingOnAgent: 'Saving to the agent...',
      editAgentTwilioAccountIdLabel: 'Account ID:',
      editAgentValidate: 'Validate',
      editAgentValidated: 'Validated',
      editAgentTryAgentSound: 'Try how this agent sounds',
      editAgentMicActive: 'Microphone active',
      editAgentVoiceLabel: 'Voice',
      editAgentVoiceParamsSection: 'Voice parameters',
      editAgentStability: 'Stability',
      editAgentSimilarity: 'Similarity',
      editAgentStyle: 'Style',
      editAgentSpeed: 'Speed',
      editAgentUnlinkStoreTitle: 'Unlink store',
      editAgentNotConnected: 'Not connected',
      editAgentActionSingle: 'action',
      editAgentActionPlural: 'actions',
      editAgentKnowledgeSourcesTitle: 'Knowledge sources',
      editAgentNoKnowledgeSourcesTitle:
        'This agent has no configured knowledge sources.',
      editAgentNoKnowledgeSourcesDescription:
        'Knowledge sources help the agent provide more accurate answers.',
      editAgentAddKnowledgeSourcesTitle: 'Add knowledge sources',
      editAgentUnnamed: 'Unnamed',
      editAgentPdfMaxLabel: 'Max. 10MB',
      editAgentWebPage: 'Web page',
      editAgentLoadingAvailableSources: 'Loading available sources...',
      editAgentAvailableSources: 'Available sources',
      editAgentSwipeToAddSource: 'Swipe right to add the source',
      editAgentAddSourceTitle: 'Add source',
      editAgentLoadingActions: 'Loading actions...',
      editAgentConfiguredActions: 'Configured actions',
      editAgentNewAction: 'New action',
      editAgentActionNameLabel: 'Action name *',
      editAgentActionNamePlaceholder: 'e.g. Notify sales team',
      editAgentActionDescriptionLabel: 'Description (optional)',
      editAgentActionDescriptionPlaceholder: 'When the AI should use it',
      editAgentWebhookUrlLabel: 'Webhook URL (HTTPS) *',
      editAgentWebhookPlaceholder: 'https://hook.eu2.make.com/...',
      editAgentSaveAction: 'Save action',
      editAgentEditActionTitle: 'Edit action',
      editAgentSaving: 'Saving...',
      editAgentFieldRequired: 'This field is required',
      editAgentFieldMin: 'Minimum value is',
      editAgentFieldMax: 'Maximum value is',
      knowledgeWebSourceInvalidUrl: 'Invalid or inaccessible URL',
      knowledgeTextSourceError: 'Error creating text source',
      knowledgeSourceLinkError:
        'Error linking the knowledge source to the agent',
      knowledgeSourceUnlinkedSuccess: 'Source unlinked successfully',
      knowledgeSourceUnlinkNotLinkedError:
        'The knowledge source was not linked to this agent',
      knowledgeSourceUnlinkAgentError:
        'Error unlinking the knowledge source from the agent',
      knowledgeSourceUnlinkConnectionError:
        'Connection error while unlinking the knowledge source',

      supportWidgetSubtitle: 'support chat',
      supportWidgetSettingsAria: 'Settings',
      supportWidgetPlayTitle: 'Play',
      supportWidgetStopTitle: 'Stop',
      supportWidgetMicEnableTitle: 'Turn on microphone',
      supportWidgetMicDisableTitle: 'Turn off microphone',
      supportWidgetPoweredBy: 'Powered by Llamalo AI',
      supportWidgetAdvancedContact:
        'For advanced inquiries, contact us at',
      supportWidgetAdvancedContactAria: 'Contact for advanced inquiries',
      supportWidgetLauncherTooltip: 'Voice assistant',
      supportWidgetMicPermissionError:
        'Could not access the microphone. Please check your permissions.',

      voiceTestEndTimeout:
        'The test ended because the maximum time of 2 minutes was reached.',
      voiceTestEndUser: 'You ended the test.',
      voiceTestEndDisconnect: 'The connection was lost.',
      voiceTestEndReplaced: 'The session was replaced by another test.',
      voiceTestEndError: 'The session ended due to an error.',
      voiceTestEndDefault: 'The test has ended.',
      voiceTestMicPermissionDenied:
        'Microphone permission denied. Please allow microphone access in your browser.',
      voiceTestStartErrorPrefix: 'Could not start the voice test: ',
      voiceTestUnknownError: 'Unknown error',
      voiceTestWsConnectFailed:
        'Could not connect to the server. Check your internet connection.',

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
      upgradePlanStarter: 'Starter',
      upgradePlanGrowth: 'Growth',
      upgradePlanScale: 'Scale',
      upgradePlanStarterDesc: 'Get started with voice agents and a knowledge base.',
      upgradePlanGrowthDesc: 'More minutes and room for growing teams.',
      upgradePlanScaleDesc: 'Maximum scale for high volume.\nDedicated support.',
      upgradePlanStarterButton: 'Start now',
      upgradePlanStarterTrialTextLink:
        '7-day Stripe trial: card required; no charge until the trial ends.',
      upgradePlanPopularBadge: 'POPULAR',
      upgradePlanGrowthButton: 'Start now',
      upgradePlanScaleButton: 'Get started now',
      upgradePlanCurrentBadge: 'CURRENT PLAN',
      upgradePlanChangeSuccess:
        'Your plan was updated. Billing details will appear in Stripe.',
      upgradePlanChangeReviewTitle: 'Review plan change',
      upgradePlanChangeReviewHint:
        'Preview of your next invoice (proration). If Stripe’s confirmation page did not open, you can confirm here.',
      upgradePlanChangeReviewBack: 'Back to plans',
      upgradePlanChangeReviewConfirm: 'Confirm change',
      upgradePlanChangeReviewTotal: 'Estimated total due',
      planChangePageTitle: 'Confirm plan change',
      planChangePageSubtitle:
        'Review the summary from Stripe (proration and line items). When you confirm, we update your subscription and Stripe handles billing.',
      planChangeBackPlans: 'Back to plans',
      planChangeBackAccount: 'Go to billing',
      planChangeCurrentPlanLabel: 'Current plan',
      planChangeTargetPlanLabel: 'New plan',
      planChangeStripeNote:
        'Amounts are a preview; the final charge may differ slightly based on timing and your payment method.',
      planChangeInvalidSession:
        'There is no active subscription to change. Subscribe or check billing.',
      planChangeStripeSecure: 'Secure payment with Stripe',
      planChangeLoading: 'Calculating summary…',
      planChangeConfirming: 'Confirming…',
      planChangeLinesHeading: 'Breakdown',
      pricingFeatureIncludedMinutes: 'Included minutes',
      pricingFeatureAgents: 'Agents',
      pricingFeatureDocuments: 'Documents',
      pricingFeatureStorage: 'Storage',
      pricingFeatureSupport: 'Support',
      pricingDocsStarter: '5',
      pricingDocsGrowth: '20',
      pricingDocsScale: '60',
      pricingStorageScale: '1.5 GB',
      pricingSupportEmail: 'Email',
      pricingSupportPriority: 'Priority',
      pricingSupportDedicated: 'Dedicated',
      pricingToggleMonthly: 'Monthly',
      pricingToggleAnnual: 'Annual',
      pricingPerYear: 'year',
      pricingEquivalentTo: 'Equivalent to',
      pricingPerMonthSlash: '/month',
      pricingPerMonthLabel: '/month',
      pricingCustomPlansFooter:
        'For custom plans for large enterprises, contact us at',
      planUpgradeCelebrationTitleStarter: 'Welcome to your Starter plan!',
      planUpgradeCelebrationTitleGrowth: 'Welcome to your Growth plan!',
      planUpgradeCelebrationTitleScale: 'Welcome to your Scale plan!',
      planUpgradeCelebrationMessageStarter:
        'Enjoy included minutes, agents, and documents to hit the ground running with Llamalo.',
      planUpgradeCelebrationMessageGrowth:
        'You have leveled up: more minutes, agents, and storage for your team.',
      planUpgradeCelebrationMessageScale:
        'You are on the fullest plan: top capacity, storage, and dedicated support.',
      planUpgradeCelebrationTitlePro: 'Welcome to your new Pro plan!',
      planUpgradeCelebrationTitlePremium: 'Welcome to your new Premium plan!',
      planUpgradeCelebrationMessagePro:
        'Great step forward: more agents, minutes, and integrations to grow with Llamalo.',
      planUpgradeCelebrationMessagePremium:
        'You are on our fullest plan: expanded capacity, priority support, and the best experience.',
      planUpgradeCelebrationSubline:
        'In your dashboard you can keep building agents, track metrics, and connect everything your business needs.',
      planUpgradeCelebrationButton: 'Awesome!',
      planUpgradeCelebrationContinueDashboard: 'Back to dashboard',
      planUpgradeCelebrationWelcomeTop: 'Welcome to your new plan',
      planUpgradeCelebrationPlanWord: 'Plan',
      planUpgradeCelebrationBenefitsHeading: 'Benefits included',

      // Company setup
      skipLabel: 'Skip',
      createFirstAgent: 'Create your first agent',
      onboardingPlanIntroTitle: 'Choose your plan',
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
      authGoogleLogin: 'Continue with Google',
      authErrorGoogleLogin: 'Could not sign in with Google. Please try again.',
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
      authSuccessRegisterNoPin:
        'Account created. You can continue with setup.',
      authErrorGetProfile: 'Error getting user profile',
      authErrorFillAll: 'Please fill in all fields',
      authErrorMarketingConsent: 'You must accept marketing consent to continue',
      authSuccessVerifyEmail: 'Please check your email and verify it to access your account.',
      authErrorRegister: 'Error registering user. Please try again.',
      authErrorRecoverEmail: 'Enter your email to recover your password',
      authSuccessRecover: 'If the email exists, you will receive recovery instructions.',
      authWelcomeRegister: 'Create your Llamalo account',
      authWelcomeRecover: 'Recover access to your account',
      authRegisterTitle: 'Sign up',
      authRegisterSubtitle: 'Fill in your details to create an account',
      authRegisterButton: 'Sign up',
      authRecoverTitle: 'Reset password',
      authRecoverSubtitle: 'We will email you a reset link',
      authRecoverButton: 'Send link',
      authPromptNoAccount: "Don't have an account?",
      authLinkRegister: 'Sign up',
      authPromptAlreadyAccount: 'Already have an account?',
      authLinkLogin: 'Log in',
      authPromptRecoverRemember: 'Remember your password?',
      authErrorRecoverRequest:
        'Could not send the recovery email. Please try again.',
      firstAgentTourStep1Title: 'Your first voice agent',
      firstAgentTourStep1Desc:
        'In the sidebar, tap <strong>Agents</strong> to open the list. We will then show you how to create one.',
      firstAgentTourStep2Title: 'Create your agent',
      firstAgentTourStep2Desc:
        'Click <strong>Add agent</strong> to start the guided creation flow.',
      firstAgentTourNextToAgents: 'Go to Agents',
      firstAgentTourDone: 'Got it',
      firstAgentTourSkip: 'Skip',
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
