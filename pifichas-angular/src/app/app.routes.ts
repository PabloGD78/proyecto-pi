import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { StudentDetailComponent } from './pages/student-detail/student-detail.component';
import { ProfesorListComponent } from './components/profesor-list/profesor-list.component'; // <--- IMPORTAR
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { 
    path: 'home', 
    component: HomeComponent, 
    canActivate: [AuthGuard] 
  },

  { 
    path: 'student/:id', 
    component: StudentDetailComponent, 
    canActivate: [AuthGuard] 
  },

  // 👉 AÑADE ESTA RUTA AQUÍ (Protegida también)
  { 
    path: 'profesores', 
    component: ProfesorListComponent, 
    canActivate: [AuthGuard] 
  },

  // 👉 Comodín (SIEMPRE AL FINAL)
  { path: '**', redirectTo: 'login' }
];