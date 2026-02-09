import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
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

  // Confirm dialog state for observations
  showConfirmDialog: boolean = false;
  confirmDialogTitle: string = '';
  confirmDialogMessage: string = '';
  observacionIdToDelete: number | null = null;

  // Confirm dialog state for modules
  showConfirmModuloDialog: boolean = false;
  moduloIdToDelete: number | null = null;

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
        
        // Cargar módulos (combinando curso + individuales)
        this.loadAllModulos(id);

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

  loadAllModulos(id: number): void {
    // Si tiene curso, cargar módulos del curso + individuales
    if (this.student?.id_curso) {
      this.studentService.getModulosPorCurso(this.student.id_curso).subscribe({
        next: (cursoModulos) => {
          this.studentService.getModulos(id).subscribe({
            next: (alumnModulos) => {
              // Combinar: primero módulos del curso, luego individuales
              this.modulos = [...cursoModulos, ...alumnModulos];
              this.cdr.detectChanges();
            },
            error: () => {
              this.modulos = cursoModulos;
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          this.studentService.getModulos(id).subscribe({
            next: (alumnModulos) => {
              this.modulos = alumnModulos;
              this.cdr.detectChanges();
            },
            error: () => console.warn('Sin módulos registrados')
          });
        }
      });
    } else {
      this.loadModulos(id);
    }
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
    if (!obsId) return;
    this.observacionIdToDelete = obsId;
    this.confirmDialogTitle = 'Eliminar observación';
    this.confirmDialogMessage = '¿Estás seguro de que deseas borrar esta observación? Esta acción no se puede deshacer.';
    this.showConfirmDialog = true;
  }

  onDialogConfirmed(): void {
    if (this.observacionIdToDelete === null) return;
    const id = this.observacionIdToDelete;
    this.studentService.deleteObservation(id).subscribe({
      next: () => {
        if (this.studentId) this.loadObservations(this.studentId);
        this.showNotificationMessage('Observación eliminada.', 'success');
        this.showConfirmDialog = false;
        this.observacionIdToDelete = null;
      },
      error: (err) => {
        console.error('Error eliminando observación', err);
        this.showConfirmDialog = false;
        this.observacionIdToDelete = null;
      }
    });
  }

  onDialogCancelled(): void {
    this.showConfirmDialog = false;
    this.observacionIdToDelete = null;
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

    // ========== ENCABEZADO ==========
    pdf.setFontSize(18);
    pdf.setTextColor(26, 115, 232);
    pdf.text('INFORME DEL ALUMNO', pageWidth / 2, y, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    y += 12;

    // ========== DATOS BÁSICOS ==========
    pdf.setFontSize(12);
    pdf.setFont('', 'bold');
    pdf.text('DATOS BÁSICOS', margin, y);
    pdf.setFont('', 'normal');
    y += 7;

    const basicData = [
      ['Nombre:', `${this.student.nombre} ${this.student.apellidos}`],
      ['ID Alumno:', this.student.id.toString()],
      ['DNI:', this.dni || 'No especificado'],
      ['Fecha de Nacimiento:', this.fechaNacimiento ? new Date(this.fechaNacimiento).toLocaleDateString('es-ES') : 'No especificado'],
      ['Curso:', this.student.curso_nombre || 'No asignado'],
      ['Contacto Tutor:', this.contactoTutor || 'No especificado']
    ];

    basicData.forEach(([label, value]) => {
      pdf.setFont('', 'bold');
      pdf.text(label, margin, y);
      pdf.setFont('', 'normal');
      pdf.text(value, margin + 50, y);
      y += 6;
    });

    y += 8;

    // ========== FICHA MÉDICA ==========
    pdf.setFont('', 'bold');
    pdf.setFontSize(12);
    pdf.text('FICHA MÉDICA Y CURRICULAR', margin, y);
    pdf.setFont('', 'normal');
    y += 7;

    // Datos Médicos
    pdf.setFont('', 'bold');
    pdf.text('Datos Médicos:', margin, y);
    pdf.setFont('', 'normal');
    y += 5;
    const datosMedicosText = this.datosMedicos || 'No especificado';
    const datosMedicosLines = pdf.splitTextToSize(datosMedicosText, pageWidth - 2 * margin);
    pdf.text(datosMedicosLines, margin, y);
    y += datosMedicosLines.length * 5 + 3;

    // Adaptaciones Curriculares
    pdf.setFont('', 'bold');
    pdf.text('Adaptaciones Curriculares:', margin, y);
    pdf.setFont('', 'normal');
    y += 5;
    const adaptacionesText = this.adaptacionesCurriculares || 'No especificado';
    const adaptacionesLines = pdf.splitTextToSize(adaptacionesText, pageWidth - 2 * margin);
    pdf.text(adaptacionesLines, margin, y);
    y += adaptacionesLines.length * 5 + 8;

    // Verificar si necesitamos nueva página
    if (y > 240) {
      pdf.addPage();
      y = 20;
    }

    // ========== OBSERVACIONES ==========
    pdf.setFont('', 'bold');
    pdf.setFontSize(12);
    pdf.text('OBSERVACIONES', margin, y);
    pdf.setFont('', 'normal');
    y += 7;

    if (this.observaciones && this.observaciones.length > 0) {
      this.observaciones.forEach((obs, index) => {
        if (y > 250) {
          pdf.addPage();
          y = 20;
        }
        
        pdf.setFont('', 'bold');
        pdf.setFontSize(10);
        pdf.text(`Observación ${index + 1} (${new Date(obs.fecha).toLocaleDateString('es-ES')})`, margin, y);
        pdf.setFont('', 'normal');
        pdf.setFontSize(9);
        y += 5;
        
        const obsLines = pdf.splitTextToSize(obs.contenido, pageWidth - 2 * margin);
        pdf.text(obsLines, margin, y);
        y += obsLines.length * 4 + 3;
        
        if (obs.tipo) {
          pdf.setFont('', 'italic');
          pdf.setFontSize(8);
          pdf.text(`Tipo: ${obs.tipo}`, margin, y);
          y += 4;
        }
        pdf.setFontSize(9);
        y += 2;
      });
    } else {
      pdf.text('No hay observaciones registradas', margin, y);
      y += 8;
    }

    // Verificar si necesitamos nueva página
    if (y > 240) {
      pdf.addPage();
      y = 20;
    }

    // ========== MÓDULOS ==========
    pdf.setFont('', 'bold');
    pdf.setFontSize(12);
    pdf.text('MÓDULOS ACADÉMICOS', margin, y);
    y += 10;

    if (this.modulos && this.modulos.length > 0) {
      autoTable(pdf as any, {
        startY: y,
        head: [['Módulo']],
        body: this.modulos.map(m => [
          m.nombre_modulo || 'N/A'
        ]),
        headStyles: { fillColor: [26, 115, 232], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0] },
        margin: margin
      });
    } else {
      pdf.setFont('', 'normal');
      pdf.text('No hay módulos asignados', margin, y);
    }

    // ========== PIE DE PÁGINA ==========
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Página ${i} de ${pageCount} - Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    pdf.save(`informe_${this.student.nombre}_${this.student.apellidos}.pdf`);
    this.showNotificationMessage('✅ PDF generado correctamente', 'success');
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
    console.log('Enviando módulo:', this.nuevoModulo);
    this.studentService.addModulo(this.studentId, this.nuevoModulo).subscribe({
      next: () => {
        this.loadAllModulos(this.studentId!);
        this.nuevoModulo = { nombre: '', codigo: '', horas: 0, calificacion: null, estado: 'Pendiente' };
        this.showNotificationMessage('Módulo añadido', 'success');
      },
      error: (err) => {
        console.error('Error al añadir módulo:', err);
        this.showNotificationMessage('Error al añadir módulo', 'error');
      }
    });
  }

  deleteModulo(moduloId: number): void {
    if (!moduloId) return;
    this.moduloIdToDelete = moduloId;
    this.showConfirmModuloDialog = true;
  }

  onDeleteModuloConfirmed(): void {
    if (this.moduloIdToDelete === null) return;
    const id = this.moduloIdToDelete;
    this.studentService.deleteModulo(id, this.studentId || 0).subscribe({
      next: () => {
        this.loadAllModulos(this.studentId!);
        this.showNotificationMessage('Módulo eliminado', 'success');
        this.showConfirmModuloDialog = false;
        this.moduloIdToDelete = null;
      },
      error: (err) => {
        console.error('Error eliminando módulo', err);
        this.showConfirmModuloDialog = false;
        this.moduloIdToDelete = null;
      }
    });
  }

  onDeleteModuloCancelled(): void {
    this.showConfirmModuloDialog = false;
    this.moduloIdToDelete = null;
  }
}