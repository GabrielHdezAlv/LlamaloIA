import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
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
import { UpgradePlanComponent } from './pages/upgrade-plan/upgrade-plan.component';
import { AdminEditAgentComponent } from './pages/admin-edit-agent/admin-edit-agent.component';
import { AdminNewsComponent } from './pages/admin-news/admin-news.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: AuthFormComponent,
    data: {
      type: 'login',
      title: '¡Bienvenido de vuelta!',
      subtitle: '',
      linkText: '',
      linkRoute: '',
      formTitle: 'Iniciar sesión',
      formSubtitle: 'Introduzca sus datos de acceso',
      buttonText: 'Acceder',
      bottomText: '',
      bottomLinkText: '',
      bottomLinkRoute: '',
    },
  },
  // Ruta de registro deshabilitada
  // {
  //   path: 'register',
  //   component: AuthFormComponent,
  //   data: {
  //     type: 'register',
  //     title: 'Bienvenido a Llamalo',
  //     subtitle: '¿Tiene una cuenta? ',
  //     linkText: 'Inicie sesión',
  //     linkRoute: '/login',
  //     formTitle: 'Regístrate',
  //     formSubtitle: '!Crea tu cuenta en segundos!',
  //     buttonText: 'Regístrate con email',
  //     bottomText: '¿Ya tiene una cuenta?',
  //     bottomLinkText: 'Iniciar sesión',
  //     bottomLinkRoute: '/login',
  //   },
  // },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
  },
  // Rutas deshabilitadas temporalmente
  // {
  //   path: 'recover',
  //   component: AuthFormComponent,
  //   data: {
  //     type: 'recover',
  //     title: 'Recuperar contraseña',
  //     subtitle: '¿No tiene una cuenta?',
  //     linkText: 'Regístrese ahora',
  //     linkRoute: '/register',
  //     formTitle: 'Recuperar contraseña',
  //     formSubtitle: 'Introduzca el email',
  //     buttonText: 'Acceder',
  //     bottomText: '¿Todavía no tienes una cuenta?',
  //     bottomLinkText: 'Regístrate',
  //     bottomLinkRoute: '/register',
  //   },
  // },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
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
      { path: 'upgrade-plan', component: UpgradePlanComponent },
      { path: 'billing', component: UpgradePlanComponent },
    ],
  },
  {
    path: 'shopify-onboarding',
    component: ShopifyOnboardingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'shopify-onboarding/success',
    component: ShopifySuccessComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'company-setup',
    component: CompanySetupComponent,
    canActivate: [AuthGuard],
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
