import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
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

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void { this.loadStudents(); }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.students = Array.isArray(data) ? data : [];
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
    const search = this.searchQuery.toLowerCase();
    const filter = this.filterQuery.toLowerCase();

    this.filteredStudents = this.students.filter(s => {
      const nombreCompleto = `${s.nombre || ''} ${s.apellidos || ''}`.toLowerCase();
      const idStr = (s.id || '').toString();
      const grupo = (s.grupo || '').toLowerCase();

      const coincideBusqueda = !search || nombreCompleto.includes(search) || idStr.includes(search);
      const coincideFiltro = !filter || grupo.includes(filter);

      return coincideBusqueda && coincideFiltro;
    });
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
}