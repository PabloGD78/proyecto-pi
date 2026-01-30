import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { AddAlumnoComponent } from '../../components/add-alumno/add-alumno.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AddAlumnoComponent],
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

  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showNotification: boolean = false;

  constructor(private studentService: StudentService, private notificationService: NotificationService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadStudents(); }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        // Aceptamos varias formas de respuesta: array directo o { data: [] } o { students: [] }
        if (Array.isArray(data)) {
          this.students = data;
        } else if (data && Array.isArray((data as any).data)) {
          this.students = (data as any).data;
        } else if (data && Array.isArray((data as any).students)) {
          this.students = (data as any).students;
        } else {
          this.students = [];
        }
        // Aplicar filtros y asegurar que `loading` se desactive siempre al terminar
        this.applyFilters();
        this.loading = false; // Se apaga al recibir datos
      },
      error: (err) => {
        console.error('Error en el servicio:', err);
        this.loading = false; // Se apaga aunque falle
      }
    });
  }

  applyFilters(): void {
    // Normalizar y limpiar valores de búsqueda
    const search = (this.searchQuery || '').trim().toLowerCase();
    const filter = (this.filterQuery || '').trim().toLowerCase();

    const result = this.students.filter(s => {
      const nombreCompleto = `${s.nombre || ''} ${s.apellidos || ''}`.toLowerCase();
      const idStr = (s.id || '').toString();
      const course = ((s.curso_nombre || s.grupo) || '').toLowerCase();

      const coincideBusqueda = !search || nombreCompleto.includes(search) || idStr.includes(search);
      const coincideFiltro = !filter || course.includes(filter);

      return coincideBusqueda && coincideFiltro;
    });

    this.filteredStudents = result.slice(); // nueva referencia para asegurar detección de cambios

    // Debug: log para entender por qué no se muestra la lista al cargar
    console.log('applyFilters', { search, filter, students: this.students.length, filtered: this.filteredStudents.length });

    // Asegurar que Angular actualice la vista inmediatamente
    try { this.cdr.detectChanges(); } catch (e) { /* noop en caso de errores */ }
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
    if (confirm(`¿Estás seguro de que deseas eliminar a ${fullName}? Esta acción no se puede deshacer.`)) {
      this.deleteStudent(id);
    }
  }

  deleteStudent(id: number): void {
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.showNotificationMessage('✅ Alumno eliminado correctamente', 'success');
        this.loadStudents();
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
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }
}