import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-profesor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './profesor-list.component.html',
  styleUrls: ['./profesor-list.component.css']
})
export class ProfesorListComponent implements OnInit {

  profesores: any[] = [];
  mostrarFormulario = false;
  cargando = true;

  nuevoProfe = {
    nombre: '',
    email: '',
    contrasenia: ''
  };

  // MODAL
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  confirmButtonText = 'Aceptar';

  // CONTROL ACCIONES
  accionPendiente: 'crear' | 'eliminar' | null = null;
  profesorIdToDelete: number | null = null;

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProfesores();
  }

  cargarProfesores(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.cargando = false;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    this.cargando = true;

    this.http.get<any[]>('http://localhost:3000/admin/profesores', { headers })
      .subscribe({
        next: (data) => {
          this.profesores = (data || []).filter(p =>
            (p.email || '').toLowerCase().trim() !== 'admin@sistema.com'
          );
          this.cargando = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.cd.detectChanges();
        }
      });
  }

  // ===== CREAR PROFESOR =====
  guardarProfesor(): void {

    if (!this.nuevoProfe.nombre || !this.nuevoProfe.email || !this.nuevoProfe.contrasenia) {
      this.confirmDialogTitle = 'Campos incompletos';
      this.confirmDialogMessage = 'Debes rellenar todos los campos.';
      this.confirmButtonText = 'Entendido';
      this.accionPendiente = null;
      this.showConfirmDialog = true;
      return;
    }

    this.confirmDialogTitle = 'Confirmar creación';
    this.confirmDialogMessage = `¿Deseas crear al profesor ${this.nuevoProfe.nombre}?`;
    this.confirmButtonText = 'Crear';
    this.accionPendiente = 'crear';
    this.showConfirmDialog = true;
  }

  // ===== ELIMINAR PROFESOR =====
  eliminarProfe(id: number, nombre: string): void {
    this.profesorIdToDelete = id;
    this.confirmDialogTitle = 'Eliminar profesor';
    this.confirmDialogMessage = `¿Seguro que quieres eliminar al profesor ${nombre}? Esta acción no se puede deshacer.`;
    this.confirmButtonText = 'Eliminar';
    this.accionPendiente = 'eliminar';
    this.showConfirmDialog = true;
  }

  // ===== CONFIRMAR MODAL =====
  onDialogConfirmed(): void {

    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    // CREAR
    if (this.accionPendiente === 'crear') {
      this.http.post('http://localhost:3000/admin/profesores', this.nuevoProfe, { headers })
        .subscribe({
          next: () => {
            this.nuevoProfe = { nombre: '', email: '', contrasenia: '' };
            this.mostrarFormulario = false;
            this.cargarProfesores();
            this.cerrarModal();
          },
          error: () => {
            this.confirmDialogTitle = 'Error';
            this.confirmDialogMessage = 'No se pudo crear el profesor. El correo puede existir.';
            this.confirmButtonText = 'Cerrar';
            this.accionPendiente = null;
          }
        });
      return;
    }

    // ELIMINAR
    if (this.accionPendiente === 'eliminar' && this.profesorIdToDelete !== null) {
      this.http.delete(`http://localhost:3000/admin/profesores/${this.profesorIdToDelete}`, { headers })
        .subscribe({
          next: () => {
            this.cargarProfesores();
            this.cerrarModal();
          },
          error: () => this.cerrarModal()
        });
    }
  }

  onDialogCancelled(): void {
    this.cerrarModal();
  }

  private cerrarModal(): void {
    this.showConfirmDialog = false;
    this.accionPendiente = null;
    this.profesorIdToDelete = null;
  }
}