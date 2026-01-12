import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Añadido ChangeDetectorRef
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { FormsModule } from '@angular/forms';

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
  
  dni: string = '';
  fechaNacimiento: string = '';
  contactoTutor: string = '';
  datosMedicos: string = '';
  adaptacionesCurriculares: string = '';
  id_ficha: number | null = null;
  
  nuevaObservacion: string = '';
  tipoObservacion: string = 'General';
  visibleAlTutor: boolean = false;
  observaciones: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef // Inyectamos esto para forzar el refresco visual
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
    console.log('Solicitando datos para ID:', id);
    this.studentService.getStudentById(id).subscribe({
      next: (data: any) => {
        // --- PASO CRÍTICO ---
        // Asignamos el objeto student inmediatamente para que desaparezca el "Cargando"
        this.student = data;
        
        // Usamos un try-catch para que si la fecha falla, no se bloquee el componente
        try {
          this.dni = data.dni || '';
          this.contactoTutor = data.contacto_tutor || '';
          this.datosMedicos = data.datos_medicos || '';
          this.adaptacionesCurriculares = data.adaptacion_curriculares || '';
          this.id_ficha = data.id_ficha;

          if (data.fecha_nacimiento) {
            const dateObj = new Date(data.fecha_nacimiento);
            // Verificamos que la fecha sea válida antes de convertirla
            if (!isNaN(dateObj.getTime())) {
              this.fechaNacimiento = dateObj.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          console.error("Error procesando campos secundarios:", e);
        }

        // Forzamos a Angular a que detecte los cambios (solución al error NG0505)
        this.cdr.detectChanges();
        console.log('Frontend actualizado con éxito:', this.student);
      },
      error: (err) => {
        console.error('Error en la recepción de datos:', err);
      }
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
    // Navegar a la lista de alumnos (ruta interna 'home')
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
        alert('¡Información actualizada!');
        if (response.id_ficha) this.id_ficha = response.id_ficha;
        this.loadStudentData(this.studentId!);
      },
      error: (err) => alert('Error al guardar.')
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
        alert('Observación añadida.');
      }
    });
  }

  confirmDeleteObservation(obsId: number): void {
    if (!confirm('¿Estás seguro de que deseas borrar esta observación?')) return;
    this.deleteObservation(obsId);
  }

  deleteObservation(obsId: number): void {
    this.studentService.deleteObservation(obsId).subscribe({
      next: () => {
        if (this.studentId) this.loadObservations(this.studentId);
        alert('Observación eliminada.');
      },
      error: () => alert('Error al eliminar la observación.')
    });
  }

  getStudentInitials(): string {
    if (this.student?.nombre) {
      return (this.student.nombre.charAt(0) + (this.student.apellidos ? this.student.apellidos.charAt(0) : '')).toUpperCase();
    }
    return 'AL';
  }

  // Función para el botón de PDF — genera y descarga un PDF en vez de abrir la impresión
  async generarPDF(): Promise<void> {
    if (!this.student) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Encabezado
    pdf.setFontSize(18);
    pdf.text('Informe del Alumno', pageWidth / 2, y, { align: 'center' });
    y += 8;

    pdf.setFontSize(12);
    pdf.text(`${this.student.nombre || ''} ${this.student.apellidos || ''}`, margin, y);
    pdf.text(`ID: ${this.student.id || ''}`, pageWidth - margin, y, { align: 'right' });
    y += 8;

    // Añadir nombre del curso en el encabezado
    pdf.setFontSize(11);
    const courseText = (this.student.curso_nombre || this.student.grupo || 'Sin curso');
    pdf.text(`Curso: ${courseText}`, margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.text(`DNI: ${this.dni || this.student.dni || ''}`, margin, y);
    pdf.text(`Fecha de Nacimiento: ${this.fechaNacimiento || ''}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
    pdf.text(`Contacto Tutor: ${this.contactoTutor || ''}`, margin, y);
    y += 10;

    // Ficha Médica
    pdf.setFontSize(12);
    pdf.text('Ficha Médica', margin, y);
    y += 6;
    pdf.setFontSize(10);
    const datosMedicosLines = pdf.splitTextToSize(this.datosMedicos || '', pageWidth - margin * 2);
    pdf.text(datosMedicosLines, margin, y);
    y += datosMedicosLines.length * 6 + 6;

    // Adaptaciones Curriculares
    pdf.setFontSize(12);
    pdf.text('Adaptaciones Curriculares', margin, y);
    y += 6;
    pdf.setFontSize(10);
    const adaptLines = pdf.splitTextToSize(this.adaptacionesCurriculares || '', pageWidth - margin * 2);
    pdf.text(adaptLines, margin, y);
    y += adaptLines.length * 6 + 8;

    // Observaciones (tabla)
    const obsHead = [['Fecha', 'Tipo', 'Contenido']];
    const obsBody = (this.observaciones || []).map(o => [
      o.fecha ? new Date(o.fecha).toLocaleDateString('es-ES') : '',
      o.tipo || '',
      (o.contenido || '').replace(/\s+/g, ' ').trim()
    ]);

    // Título para la sección de observaciones en el PDF
    pdf.setFontSize(12);
    pdf.text('Observaciones', margin, y);
    y += 6; // espacio después del título

    autoTable(pdf as any, {
      startY: y,
      head: obsHead,
      body: obsBody,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [26, 115, 232] },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 30 }, 2: { cellWidth: pageWidth - margin * 2 - 60 } }
    });

    const safeName = `informe-${(this.student.nombre || 'alumno').replace(/\s+/g, '_')}-${this.student.id || 'id'}.pdf`;
    pdf.save(safeName);
  }
}