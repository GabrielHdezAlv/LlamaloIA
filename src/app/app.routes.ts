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
import { AdminGastoComponent } from './pages/admin-gasto/admin-gasto.component';


export const routes: Routes = [
  {
    path: 'login',
    component: AuthFormComponent,
    data: {
      type: 'login',
      title: '¡Bienvenido de vuelta!',
      subtitle: '¿No tiene una cuenta?',
      linkText: 'Regístrese ahora',
      linkRoute: '/register',
      formTitle: 'Iniciar sesión',
      formSubtitle: 'Introduzca sus datos de acceso',
      buttonText: 'Acceder',
      bottomText: '¿Todavía no tienes una cuenta?',
      bottomLinkText: 'Regístrate',
      bottomLinkRoute: '/register',
    },
  },
  {
    path: 'register',
    component: AuthFormComponent,
    data: {
      type: 'register',
      title: 'Bienvenido a Llamalo',
      subtitle: '¿Tiene una cuenta? ',
      linkText: 'Inicie sesión',
      linkRoute: '/login',
      formTitle: 'Regístrate',
      formSubtitle: '!Crea tu cuenta en segundos!',
      buttonText: 'Regístrate con email',
      bottomText: '¿Ya tiene una cuenta?',
      bottomLinkText: 'Iniciar sesión',
      bottomLinkRoute: '/login',
    },
  },
  {
    path: 'recover',
    component: AuthFormComponent,
    data: {
      type: 'recover',
      title: 'Recuperar contraseña',
      subtitle: '¿No tiene una cuenta?',
      linkText: 'Regístrese ahora',
      linkRoute: '/register',
      formTitle: 'Recuperar contraseña',
      formSubtitle: 'Introduzca el email',
      buttonText: 'Acceder',
      bottomText: '¿Todavía no tienes una cuenta?',
      bottomLinkText: 'Regístrate',
      bottomLinkRoute: '/register',
    },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'myAgents', component: HomeComponent },
      { path: 'agents', component: NewAgentsComponent },
      { path: 'agents/create', component: NewCreateAgentsComponent }, // 👈 nueva ruta
      { path: 'numbers', component: NumbersComponent },
      { path: 'history', component: HistorialComponent },
      { path: 'metrics', component: MetricsComponent },

      // 🔽 Nuevas rutas del dropdown
      { path: 'account', component: AccountComponent },
    ],
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
      { path: 'gasto', component: AdminGastoComponent },
      // Aquí puedes agregar más rutas de admin en el futuro
      // { path: 'users', component: AdminUsersComponent },
      // { path: 'analytics', component: AdminAnalyticsComponent },
      // { path: 'settings', component: AdminSettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
