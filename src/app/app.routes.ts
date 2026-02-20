import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Chat } from './components/chat/chat';
import { Expenses } from './components/expenses/expenses';
import { Map } from './components/map/map';
import { HomeComponent } from './components/home/home';
import { MainLayoutComponent } from './components/shared/main-layout/main-layout';
// import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'map', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },

    // Rutas con layout compartido (home, chat, expenses)
    {
        path: '',
        component: MainLayoutComponent,
        // canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'chat', component: Chat },
            { path: 'expenses', component: Expenses },
        ]
    },

    // Mapa fullscreen (sin MainLayout para no tener padding)
    { path: 'map', component: Map },

    { path: '**', redirectTo: 'map' }
];
