import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { RegisterLocalhostGuard } from './core/guards/register-localhost.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { HomeComponent } from './pages/home/home.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { AuthFormComponent } from './auth/auth-form/auth-form.component';
import { NewAgentsComponent } from './pages/new-agents/new-agents.component';
import { NewCreateAgentsComponent } from './pages/new-create-agents/new-create-agents.component';
import { NumbersComponent } from './pages/numbers/numbers.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { MetricsComponent } from './pages/metrics/metrics.component';
import { AccountComponent } from './pages/account/account.component';
import { CompanySetupComponent } from './pages/company-setup/company-setup.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { AdminMetricsComponent } from './pages/admin-metrics/admin-metrics.component';
import { AdminTokensComponent } from './pages/admin-tokens/admin-tokens.component';
import { AdminRedesSocialesComponent } from './pages/admin-redes-sociales/admin-redes-sociales.component';
import { AdminRecordatorioComponent } from './pages/admin-recordatorio/admin-recordatorio.component';
import { EditAgentComponent } from './pages/edit-agent/edit-agent.component';
import { KnowledgeBaseComponent } from './pages/knowledge-base/knowledge-base.component';
import { ShopifyOnboardingComponent } from './pages/shopify-onboarding/shopify-onboarding.component';
import { ShopifySuccessComponent } from './pages/shopify-success/shopify-success.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { EmailPreviewComponent } from './pages/email-preview/email-preview.component';
import { AdminEditAgentComponent } from './pages/admin-edit-agent/admin-edit-agent.component';
import { AdminNewsComponent } from './pages/admin-news/admin-news.component';
import { AdminDocsComponent } from './pages/admin-docs/admin-docs.component';
import { AdminSystemLogsComponent } from './pages/admin-system-logs/admin-system-logs';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { ShopifyComponent } from './pages/shopify/shopify.component';
import { subscriptionPaywallGuard } from './core/guards/subscription-paywall.guard';
import { onboardingCompleteGuard } from './core/guards/onboarding-complete.guard';
import { subscribeRequiredAccessGuard } from './core/guards/subscribe-required-access.guard';
import { companySetupAccessGuard } from './core/guards/company-setup-access.guard';
import { SubscribeRequiredComponent } from './pages/subscribe-required/subscribe-required.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: AuthFormComponent,
    canActivate: [GuestGuard],
    data: {
      type: 'login',
    },
  },
  {
    path: 'register',
    component: AuthFormComponent,
    canActivate: [GuestGuard, RegisterLocalhostGuard],
    data: {
      type: 'register',
    },
  },
  {
    path: 'signup',
    redirectTo: 'register',
    pathMatch: 'full',
  },
  {
    path: 'registro',
    redirectTo: 'register',
    pathMatch: 'full',
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
  },
  {
    path: 'email',
    component: EmailPreviewComponent,
  },
  {
    path: 'shopify',
    component: ShopifyComponent,
    data: { hideSupportWidget: true },
  },
  {
    path: 'recover',
    component: AuthFormComponent,
    canActivate: [GuestGuard],
    data: {
      type: 'recover',
    },
  },
  {
    path: 'forgot-password',
    redirectTo: 'recover',
    pathMatch: 'full',
  },
  {
    path: 'recuperar',
    redirectTo: 'recover',
    pathMatch: 'full',
  },
  {
    path: 'billing',
    redirectTo: 'dashboard/home?pricing=1',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [subscriptionPaywallGuard, onboardingCompleteGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'myAgents', component: HomeComponent },
      { path: 'agents', component: NewAgentsComponent },
      { path: 'agents/create', component: NewCreateAgentsComponent },
      { path: 'agents/edit/:agentId', component: EditAgentComponent },
      { path: 'numbers', component: NumbersComponent },
      { path: 'history', component: HistorialComponent },
      { path: 'metrics', component: MetricsComponent },
      { path: 'knowledge-base', component: KnowledgeBaseComponent },

      // 🔽 Nuevas rutas del dropdown
      { path: 'account', component: AccountComponent },
      {
        path: 'upgrade-plan',
        redirectTo: 'home?pricing=1',
        pathMatch: 'full',
      },
      {
        path: 'billing',
        redirectTo: 'home?pricing=1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'shopify-onboarding',
    component: ShopifyOnboardingComponent,
    canActivate: [AuthGuard, subscriptionPaywallGuard, onboardingCompleteGuard],
  },
  {
    path: 'shopify-onboarding/success',
    component: ShopifySuccessComponent,
    canActivate: [AuthGuard, subscriptionPaywallGuard, onboardingCompleteGuard],
  },
  {
    path: 'company-setup',
    component: CompanySetupComponent,
    canActivate: [
      AuthGuard,
      subscriptionPaywallGuard,
      companySetupAccessGuard,
    ],
  },
  {
    path: 'subscribe-required',
    component: SubscribeRequiredComponent,
    canActivate: [
      AuthGuard,
      subscriptionPaywallGuard,
      subscribeRequiredAccessGuard,
    ],
    data: { hideSupportWidget: true },
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
    data: { hideSupportWidget: true },
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: AdminHomeComponent },
      { path: 'home', component: AdminHomeComponent },
      { path: 'metrics', component: AdminMetricsComponent },
      { path: 'tokens', component: AdminTokensComponent },
      { path: 'redes-sociales', component: AdminRedesSocialesComponent },
      { path: 'recordatorio', component: AdminRecordatorioComponent },
      { path: 'news', component: AdminNewsComponent },
      { path: 'docs', component: AdminDocsComponent },
      { path: 'system-logs', component: AdminSystemLogsComponent },
      { path: 'agents/edit/:agentId', component: AdminEditAgentComponent },
      // Aquí puedes agregar más rutas de admin en el futuro
      // { path: 'users', component: AdminUsersComponent },
      // { path: 'analytics', component: AdminAnalyticsComponent },
      // { path: 'settings', component: AdminSettingsComponent },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { hideSupportWidget: true },
  },
];
