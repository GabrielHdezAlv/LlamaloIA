import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { RecoverComponent } from './auth/recover/recover.component';
import { NewLoginComponent } from './auth/new-login/new-login.component';
import { NewRecoverComponent } from './auth/new-recover/new-recover.component';
import { NewRegisterComponent } from './auth/new-register/new-register.component';

export const routes: Routes = [
  { path: 'login', component: NewLoginComponent },
  { path: 'register', component: NewRegisterComponent },
  { path: 'recover', component: NewRecoverComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'myAgents', component: HomeComponent },
      { path: 'agents', component: AgentsComponent },
    ],
  },
  { path: '**', redirectTo: 'login' }, // Redirige cualquier ruta no existente a login
];
