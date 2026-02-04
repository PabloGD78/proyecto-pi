import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  student: any = null;
  studentId: number | null = null;
  activeTab = 'datos';
  
  // Campos de la ficha
  dni: string = '';
  fechaNacimiento: string = '';
  contactoTutor: string = '';
  datosMedicos: string = '';
  adaptacionesCurriculares: string = '';
  id_ficha: number | null = null;
  
  // Observaciones
  nuevaObservacion: string = '';
  tipoObservacion: string = 'General';
  visibleAlTutor: boolean = false;
  observaciones: any[] = [];

  // Módulos (Aquí se cargarán los que insertamos por SQL)
  modulos: any[] = [];
  nuevoModulo = {
    nombre: '',
    codigo: '',
    horas: 0,
    calificacion: null,
    estado: 'Pendiente'
  };

  // Notificaciones
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';
  showNotification: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.studentId = +idParam;
      this.loadStudentData(this.studentId);
      this.loadObservations(this.studentId);
    }
  }

  loadStudentData(id: number): void {
    this.studentService.getStudentById(id).subscribe({
      next: (data: any) => {
        this.student = data;
        
        // --- LÓGICA DE MÓDULOS AUTOMÁTICOS ---
        // Si el alumno tiene curso (ej: ID 9), cargamos los módulos que insertamos por SQL
        if (this.student.id_curso) {
          this.loadModulosDelCurso(this.student.id_curso);
        } else {
          this.loadModulos(id); // Fallback a módulos individuales
        }

        try {
          this.dni = data.dni || '';
          this.contactoTutor = data.contacto_tutor || '';
          this.datosMedicos = data.datos_medicos || '';
          this.adaptacionesCurriculares = data.adaptacion_curriculares || '';
          this.id_ficha = data.id_ficha;

          if (data.fecha_nacimiento) {
            const dateObj = new Date(data.fecha_nacimiento);
            if (!isNaN(dateObj.getTime())) {
              this.fechaNacimiento = dateObj.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          console.error("Error procesando campos secundarios:", e);
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos del alumno:', err)
    });
  }

  // Carga los módulos base del ciclo (DAM, DAW, Infantil...)
  loadModulosDelCurso(idCurso: number): void {
    this.studentService.getModulosPorCurso(idCurso).subscribe({
      next: (data) => {
        this.modulos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('No se pudieron cargar los módulos del curso')
    });
  }

  loadModulos(id: number): void {
    this.studentService.getModulos(id).subscribe({
      next: (data) => {
        this.modulos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Sin módulos registrados')
    });
  }

  loadObservations(id: number): void {
    this.studentService.getObservations(id).subscribe({
      next: (data) => {
        this.observaciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('Sin observaciones')
    });
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  saveChanges(): void {
    if (!this.studentId) return;

    const updateData = {
      dni: this.dni,
      fecha_nacimiento: this.fechaNacimiento,
      contacto_tutor: this.contactoTutor,
      datos_medicos: this.datosMedicos,
      adaptacion_curriculares: this.adaptacionesCurriculares,
      id_ficha: this.id_ficha
    };

    this.studentService.saveStudentDetail(this.studentId, updateData).subscribe({
      next: (response: any) => {
        this.showNotificationMessage('¡Información actualizada!', 'success');
        if (response.id_ficha) this.id_ficha = response.id_ficha;
        this.loadStudentData(this.studentId!);
      },
      error: () => this.showNotificationMessage('Error al guardar.', 'error')
    });
  }

  addObservation(): void {
    if (!this.nuevaObservacion.trim() || !this.studentId) return;

    const obsData = { 
      contenido: this.nuevaObservacion, 
      tipo: this.tipoObservacion, 
      visible_tutor: this.visibleAlTutor 
    };

    this.studentService.addObservation(this.studentId, obsData).subscribe({
      next: () => {
        this.loadObservations(this.studentId!);
        this.nuevaObservacion = '';
        this.showNotificationMessage('Observación añadida.', 'success');
      }
    });
  }

  confirmDeleteObservation(obsId: number): void {
    if (!confirm('¿Estás seguro de que deseas borrar esta observación?')) return;
    this.studentService.deleteObservation(obsId).subscribe({
      next: () => {
        if (this.studentId) this.loadObservations(this.studentId);
        this.showNotificationMessage('Observación eliminada.', 'success');
      }
    });
  }

  getStudentInitials(): string {
    if (this.student?.nombre) {
      return (this.student.nombre.charAt(0) + (this.student.apellidos ? this.student.apellidos.charAt(0) : '')).toUpperCase();
    }
    return 'AL';
  }

  async generarPDF(): Promise<void> {
    if (!this.student) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    pdf.setFontSize(18);
    pdf.text('Informe del Alumno', pageWidth / 2, y, { align: 'center' });
    y += 10;

    pdf.setFontSize(12);
    pdf.text(`Alumno: ${this.student.nombre} ${this.student.apellidos}`, margin, y);
    y += 7;
    pdf.text(`Curso: ${this.student.curso_nombre || 'No asignado'}`, margin, y);
    y += 15;

    // Tabla de Módulos
    pdf.text('Módulos Académicos', margin, y);
    autoTable(pdf as any, {
      startY: y + 5,
      head: [['Módulo', 'Horas']],
      body: this.modulos.map(m => [m.nombre_modulo, m.horas + 'h']),
      headStyles: { fillColor: [26, 115, 232] }
    });

    pdf.save(`informe_${this.student.nombre}.pdf`);
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 4000);
  }

  // Mantengo tus funciones de gestión manual por si quieres añadir extras
  addModulo(): void {
    if (!this.nuevoModulo.nombre.trim() || !this.studentId) return;
    this.studentService.addModulo(this.studentId, this.nuevoModulo).subscribe({
      next: () => {
        this.loadStudentData(this.studentId!);
        this.nuevoModulo = { nombre: '', codigo: '', horas: 0, calificacion: null, estado: 'Pendiente' };
        this.showNotificationMessage('Módulo añadido', 'success');
      }
    });
  }

  deleteModulo(moduloId: number): void {
    if (!confirm('¿Eliminar módulo?')) return;
    this.studentService.deleteModulo(moduloId).subscribe({
      next: () => {
        this.loadStudentData(this.studentId!);
        this.showNotificationMessage('Módulo eliminado', 'success');
      }
    });
  }
}