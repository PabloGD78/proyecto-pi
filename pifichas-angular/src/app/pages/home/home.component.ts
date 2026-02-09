import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service'; 
import { AddAlumnoComponent } from '../../components/add-alumno/add-alumno.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AddAlumnoComponent, RouterModule, ConfirmDialogComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  searchQuery = '';
  filterQuery = '';
  loading = true;
  mostrarFormulario = false;
  
  profesorLogueado: any = null;

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
    public authService: AuthService, // CAMBIADO A PUBLIC para que el HTML lo reconozca
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { 
    this.profesorLogueado = this.authService.getCurrentUser();
    this.loadStudents(); 
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.students = data;
        } else if (data && (data as any).data) {
          this.students = (data as any).data;
        } else {
          this.students = [];
        }
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en el servicio:', err);
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  applyFilters(): void {
    const search = (this.searchQuery || '').trim().toLowerCase();
    const filter = (this.filterQuery || '').trim().toLowerCase();

    this.filteredStudents = this.students.filter(s => {
      const nombreCompleto = `${s.nombre || ''} ${s.apellidos || ''}`.toLowerCase();
      const idStr = (s.id || '').toString();
      const course = (s.curso_nombre || '').toLowerCase();

      const coincideBusqueda = !search || nombreCompleto.includes(search) || idStr.includes(search);
      const coincideFiltro = !filter || course.includes(filter);

      return coincideBusqueda && coincideFiltro;
    });

    this.cdr.detectChanges();
  }

  onAlumnoGuardado(): void {
    this.mostrarFormulario = false;
    setTimeout(() => this.loadStudents(), 500);
  }

  onSearchChange(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  goToDetail(id: number): void {
    if (id) this.router.navigate(['/student', id]);
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
        this.showNotificationMessage('✅ Alumno eliminado', 'success');
        this.loadStudents();
      },
      error: () => this.showNotificationMessage('❌ Error al eliminar', 'error')
    });
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 4000);
  }
}