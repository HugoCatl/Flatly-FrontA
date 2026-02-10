import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Chat } from './components/chat/chat';
import { Expenses } from './components/expenses/expenses';
import { Map } from './components/map/map';
import { Home } from './components/home/home';
import { MainLayout } from './components/shared/main-layout/main-layout';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'register', component: Register },

    {
        path: '',
        component: MainLayout,
        children: [

            { path: 'home', component: Home },
            { path: 'chat', component: Chat },
            { path: 'expenses', component: Expenses },
            { path: 'map', component: Map },
        ]
    },

    { path: '**', redirectTo: 'login' }
];