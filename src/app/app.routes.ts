import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { AuthFormComponent } from './auth/auth-form/auth-form.component';
import { NewAgentsComponent } from './pages/new-agents/new-agents.component';
import { NewCreateAgentsComponent } from './pages/new-create-agents/new-create-agents.component';
import { NumbersComponent } from './pages/numbers/numbers.component';


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
      { path: 'history', component: HomeComponent },
      { path: 'metrics', component: HomeComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
