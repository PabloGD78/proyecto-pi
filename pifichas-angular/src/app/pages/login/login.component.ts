import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs'; // Importamos Subscription para manejar la desuscripción

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  // 🛑 CORRECCIÓN: Usamos styleUrls (plural) con array.
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  username = 'wilmanacosta@gmail.com'; // Valores iniciales de demo
  password = '12345678';               // Valores iniciales de demo
  isLoading = false;
  errorMessage = '';

  private loginSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Se añade ngOnDestroy para limpiar la suscripción (Buena práctica en Angular)
  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  login(): void {
    // Validación básica de campos
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor, introduce usuario y contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Llama al servicio de autenticación
    this.loginSubscription = this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        // Asumiendo que el login es exitoso si response existe
        if (response && response.token) { 
          // Navega a la página principal después del login exitoso
          this.router.navigate(['/home']);
        } else {
          // Manejo si la respuesta es 200 OK pero el token o datos no son válidos
          this.errorMessage = 'Credenciales no válidas.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        // Puedes personalizar el mensaje de error basado en el status
        if (error.status === 401) {
             this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else {
             this.errorMessage = 'Error al conectar con el servidor. Inténtalo de nuevo.';
        }
        console.error('Error de login:', error);
      }
    });
  }
}