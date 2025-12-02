import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { StudentDetailComponent } from './pages/student-detail/student-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'student/:id', component: StudentDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'home' }
];

