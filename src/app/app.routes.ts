import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Chat } from './components/chat/chat';
import { Expenses } from './components/expenses/expenses';
import { Map } from './components/map/map';
import { HomeComponent } from './components/home/home';
import { MainLayoutComponent } from './components/shared/main-layout/main-layout';
import { Profile } from './components/profile/profile';
import { Onboarding } from './components/onboarding/onboarding';
import { HomeOwners } from './components/home-owners/home-owners';
import { CreateProperty } from './components/create-property/create-property';
import { HomeAdmin } from './components/home-admin/home-admin';
import { MapDetails } from './components/map/map-details/map-details';
// import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'onboarding', component: Onboarding },

    // Rutas con layout compartido (home, chat, expenses)
    {
        path: '',
        component: MainLayoutComponent,
        // canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'chat', component: Chat },
            { path: 'expenses', component: Expenses },
            { path: 'profile', component: Profile }
        ]
    },

    // Mapa fullscreen (sin MainLayout para no tener padding)
    { path: 'map', component: Map },
    { path: 'piso/:id', component: MapDetails },

    // Home propietarios (sin MainLayout de estudiante)
    { path: 'home-owners', component: HomeOwners },
    { path: 'create-property', component: CreateProperty },

    // Home admin
    { path: 'home-admin', component: HomeAdmin },

    { path: '**', redirectTo: 'login' }
];
