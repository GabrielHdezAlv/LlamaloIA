import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], children: [
            { path: '', component: HomeComponent },
            { path: 'home', component: HomeComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'myAgents', component: HomeComponent },
            { path: 'agents', component: HomeComponent },
        ]
    },
    { path: '**', redirectTo: 'login' } // Redirige cualquier ruta no existente a login
];