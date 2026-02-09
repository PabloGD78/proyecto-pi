import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Student } from '../../models/student'; 
import { AddAlumnoComponent } from '../add-alumno/add-alumno.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-alumnos-list',
  standalone: true,
  imports: [CommonModule, AddAlumnoComponent, RouterModule, ConfirmDialogComponent],
  templateUrl: './alumnos-list.component.html',
  styleUrls: ['./alumnos-list.component.css']
})
export class AlumnosListComponent implements OnInit {
  alumnos: Student[] = [];
  mostrarFormulario: boolean = false;

  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showNotification: boolean = false;

  // Variables para el diálogo de confirmación
  showConfirmDialog: boolean = false;
  confirmDialogTitle: string = '';
  confirmDialogMessage: string = '';
  studentIdToDelete: number | null = null;

  constructor(
    private studentService: StudentService,
    private notificationService: NotificationService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.alumnos = data;
        console.log('Alumnos cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        if (err.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  verDetalle(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/student', id]);
    }
  }

  onAlumnoGuardado(): void {
    this.mostrarFormulario = false;
    this.cargarAlumnos();
  }

  confirmDeleteStudent(id: number | undefined, nombre: string, apellidos: string): void {
    if (!id) return;
    const fullName = `${nombre} ${apellidos}`;
    this.studentIdToDelete = id;
    this.confirmDialogTitle = 'Eliminar alumno';
    this.confirmDialogMessage = `¿Estás seguro de que deseas eliminar a ${fullName}? Esta acción no se puede deshacer.`;
    this.showConfirmDialog = true;
  }

  onDialogConfirmed(): void {
    if (this.studentIdToDelete !== null) {
      this.deleteStudent(this.studentIdToDelete);
    }
  }

  onDialogCancelled(): void {
    this.studentIdToDelete = null;
  }

  deleteStudent(id: number): void {
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.showNotificationMessage('✅ Alumno eliminado correctamente', 'success');
        this.cargarAlumnos();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.showNotificationMessage('❌ Error al eliminar el alumno', 'error');
      }
    });
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }
}