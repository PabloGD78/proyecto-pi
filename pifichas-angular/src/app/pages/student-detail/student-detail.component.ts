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

  // Módulos
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
    if (this.student?.id_curso) {
      this.studentService.getModulosPorCurso(this.student.id_curso).subscribe({
        next: (cursoModulos) => {
          this.studentService.getModulos(id).subscribe({
            next: (alumnModulos) => {
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

  // ==========================================
  // GENERACIÓN DE PDF PROFESIONAL (CORREGIDA)
  // ==========================================
  async generarPDF(): Promise<void> {
    if (!this.student) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const primaryColor = [26, 115, 232] as [number, number, number]; // Azul corporativo
    
    // Variable para controlar la posición vertical dinámica entre tablas
    let finalY = 0; 

    // 1. ENCABEZADO TIPO BANNER
    // Rectángulo azul de fondo
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    // Título en blanco
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORME DEL ALUMNO', margin, 22);

    // Subtítulo con fecha
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const fechaGen = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    pdf.text(`Generado el: ${fechaGen}`, margin, 29);

    // Reiniciar color texto a negro
    pdf.setTextColor(0, 0, 0);

    // 2. DATOS BÁSICOS (Usando autoTable para alineación perfecta)
    // Usamos any[] para evitar errores de tipo estricto en el contenido de la tabla
    const basicInfoBody: any[] = [
      ['Nombre Completo', `${this.student.nombre} ${this.student.apellidos}`],
      ['ID Alumno', this.student.id.toString()],
      ['DNI', this.dni || 'No especificado'],
      ['Fecha de Nacimiento', this.fechaNacimiento ? new Date(this.fechaNacimiento).toLocaleDateString('es-ES') : 'No especificado'],
      ['Curso Actual', this.student.curso_nombre || 'No asignado'],
      ['Contacto Tutor', this.contactoTutor || 'No especificado']
    ];

    autoTable(pdf as any, {
      startY: 45,
      head: [[{ content: 'DATOS BÁSICOS', colSpan: 2, styles: { halign: 'left', fillColor: primaryColor, textColor: 255, fontSize: 12, fontStyle: 'bold' } }]],
      body: basicInfoBody,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, fillColor: [245, 247, 250] }, // Columna etiquetas gris claro
        1: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        // Comprobación de nulidad para data.cursor
        if (data.cursor) {
          finalY = data.cursor.y;
        }
      }
    });

    // 3. FICHA MÉDICA (Adaptada para textos largos)
    finalY += 10; // Espacio entre tablas

    // Usamos any[] para que TS no se queje del estilo 'bold' (string vs FontStyle)
    const medicalBody: any[] = [
      [{ content: 'DATOS MÉDICOS', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      [this.datosMedicos || 'Sin información registrada.'],
      [{ content: 'ADAPTACIONES CURRICULARES', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      [this.adaptacionesCurriculares || 'Sin adaptaciones registradas.']
    ];

    autoTable(pdf as any, {
      startY: finalY,
      head: [[{ content: 'FICHA MÉDICA Y CURRICULAR', styles: { halign: 'left', fillColor: primaryColor, textColor: 255, fontSize: 12, fontStyle: 'bold' } }]],
      body: medicalBody,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      didDrawPage: (data) => {
        if (data.cursor) {
          finalY = data.cursor.y;
        }
      }
    });

    // 4. OBSERVACIONES (Tabla historial)
    finalY += 10;

    let obsBody: any[] = [];
    if (this.observaciones && this.observaciones.length > 0) {
      obsBody = this.observaciones.map(obs => [
        new Date(obs.fecha).toLocaleDateString('es-ES'),
        obs.tipo || 'General',
        obs.contenido
      ]);
    } else {
      obsBody = [['-', '-', 'No hay observaciones registradas.']];
    }

    // Verificar si cabe en la página actual antes de dibujar
    if (finalY > pageHeight - 50) {
      pdf.addPage();
      finalY = 20;
    }

    autoTable(pdf as any, {
      startY: finalY,
      head: [['Fecha', 'Tipo', 'Contenido de la Observación']],
      body: obsBody,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 25 }, 
        1: { cellWidth: 25, fontStyle: 'bold' },
        2: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        if (data.cursor) {
          finalY = data.cursor.y;
        }
      }
    });

    // 5. MÓDULOS ACADÉMICOS
    // Obtenemos la Y final de la última tabla generada
    if ((pdf as any).lastAutoTable && (pdf as any).lastAutoTable.finalY) {
         finalY = (pdf as any).lastAutoTable.finalY + 10;
    } else {
         finalY += 10;
    }

    if (finalY > pageHeight - 40) {
      pdf.addPage();
      finalY = 20;
    }

    const modulosBody = (this.modulos && this.modulos.length > 0) 
      ? this.modulos.map(m => [m.nombre_modulo]) 
      : [['Sin módulos asignados']];

    autoTable(pdf as any, {
      startY: finalY,
      head: [['MÓDULOS ACADÉMICOS ASIGNADOS']],
      body: modulosBody,
      theme: 'striped',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', halign: 'left' },
      styles: { fontSize: 10, cellPadding: 4 },
      didDrawPage: (data) => {
        if (data.cursor) {
          finalY = data.cursor.y;
        }
      }
    });

    // 6. PIE DE PÁGINA (Numeración)
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      const footerText = `Página ${i} de ${totalPages} - Informe Confidencial - ${this.student.nombre} ${this.student.apellidos}`;
      pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Guardar
    pdf.save(`Informe_${this.student.nombre}_${this.student.apellidos}.pdf`);
    this.showNotificationMessage('✅ PDF generado con éxito', 'success');
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 4000);
  }

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