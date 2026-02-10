import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-add-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './add-alumno.component.html',
  styles: [`
    /* ⬅️ TUS ESTILOS TAL CUAL */
    .form-container { background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
    .title { color: #2c3e50; margin-bottom: 20px; font-weight: 600; text-align: center; }
    .input-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; color: #666; font-size: 0.9rem; }
    input, select { width: 100%; padding: 12px; border: 1px solid #dcdde1; border-radius: 6px; box-sizing: border-box; }
    .btn-save { width: 100%; padding: 14px; background: #27ae60; color: white; border: none; border-radius: 6px; font-weight: bold; }
    .notification { padding: 15px; margin-bottom: 20px; border-radius: 6px; }
    .notification.success { background-color: #d4edda; }
    .notification.error { background-color: #f8d7da; }
  `]
})
export class AddAlumnoComponent implements OnInit {

  @Output() guardado = new EventEmitter<void>();

  nuevoAlumno = {
    nombre: '',
    apellidos: '',
    dni: '',
    fecha_nacimiento: '',
    contacto_tutor: '',
    id_curso: null
  };

  cursos: any[] = [];

  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showNotification = false;

  // 🔹 NUEVO (MODAL)
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';

  constructor(
    private studentService: StudentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos() {
    this.studentService.getCourses().subscribe({
      next: (data) => this.cursos = data,
      error: (err) => console.error('Error al obtener cursos:', err)
    });
  }

  // 🔹 NUEVO: ABRIR CONFIRMACIÓN
  abrirConfirmacion(): void {
    this.confirmDialogTitle = 'Confirmar registro';
    this.confirmDialogMessage =
      `¿Deseas registrar al alumno ${this.nuevoAlumno.nombre} ${this.nuevoAlumno.apellidos}?`;
    this.showConfirmDialog = true;
  }

  // 🔹 SOLO AQUÍ SE CREA
  onDialogConfirmed(): void {
    this.showConfirmDialog = false;
    this.registrar();
  }

  onDialogCancelled(): void {
    this.showConfirmDialog = false;
  }

  // 🔹 TU MÉTODO ORIGINAL (SIN CAMBIOS)
  registrar() {
    this.studentService.crearAlumno(this.nuevoAlumno).subscribe({
      next: () => {
        this.showNotificationMessage('✅ Alumno registrado con éxito', 'success');
        this.resetForm();
        this.guardado.emit();
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.showNotificationMessage('❌ Error al guardar.', 'error');
      }
    });
  }

  resetForm() {
    this.nuevoAlumno = {
      nombre: '', apellidos: '', dni: '',
      fecha_nacimiento: '', contacto_tutor: '', id_curso: null
    };
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 4000);
  }
}