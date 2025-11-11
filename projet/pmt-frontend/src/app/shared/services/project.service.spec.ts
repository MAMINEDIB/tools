import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { Project, ProjectCreate } from '../models/project.model';

/**
 * Tests unitaires pour ProjectService
 * Teste les appels API pour la gestion des projets
 */
describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/projects';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait récupérer tous les projets', () => {
    const mockProjects: Project[] = [
      {
        id: 1,
        name: 'Projet 1',
        description: 'Description 1',
        createdBy: { id: 1, firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 3,
        taskCount: 10
      },
      {
        id: 2,
        name: 'Projet 2',
        description: 'Description 2',
        createdBy: { id: 1, firstName: 'John', lastName: 'Doe' },
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 2,
        taskCount: 5
      }
    ];

    service.getAllProjects().subscribe(projects => {
      expect(projects.length).toBe(2);
      expect(projects[0].name).toBe('Projet 1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });

  it('devrait créer un nouveau projet', () => {
    const newProject: ProjectCreate = {
      name: 'Nouveau Projet',
      description: 'Description du projet'
    };

    const mockResponse: Project = {
      id: 3,
      name: 'Nouveau Projet',
      description: 'Description du projet',
      createdBy: { id: 1, firstName: 'John', lastName: 'Doe' },
      createdAt: new Date(),
      updatedAt: new Date(),
      memberCount: 1,
      taskCount: 0
    };

    service.createProject(newProject).subscribe(project => {
      expect(project.id).toBe(3);
      expect(project.name).toBe('Nouveau Projet');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProject);
    req.flush(mockResponse);
  });

  it('devrait récupérer un projet par ID', () => {
    const mockProject: Project = {
      id: 1,
      name: 'Mon Projet',
      description: 'Ma description',
      createdBy: { id: 1, firstName: 'John', lastName: 'Doe' },
      createdAt: new Date(),
      updatedAt: new Date(),
      memberCount: 3,
      taskCount: 10
    };

    service.getProjectById(1).subscribe(project => {
      expect(project.name).toBe('Mon Projet');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProject);
  });

  it('devrait supprimer un projet', () => {
    service.deleteProject(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
