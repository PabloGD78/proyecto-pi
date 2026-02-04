import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  correo = '';
  contrasenia = '';
  isLoading = false;
  errorMessage = '';

  private loginSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  login(): void {
    if (!this.correo || !this.contrasenia) {
      this.errorMessage = 'Por favor, rellena todos los campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.loginSubscription = this.authService.login(this.correo, this.contrasenia).subscribe({
      next: (profesor) => {
        this.isLoading = false;
        if (profesor) {
          // MODIFICADO: Cambiado 'alumnos' por 'home' para que coincida con tu app.routes.ts
          this.router.navigate(['/home']);
        }
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        // El servidor devuelve 401 si la contraseña de bcrypt no coincide o el correo no existe
        this.errorMessage = err.status === 401 ? 
          'Correo o contraseña incorrectos.' : 
          'Error crítico de conexión con el servidor.';
        this.cd.detectChanges();
      }
    });
  }
}