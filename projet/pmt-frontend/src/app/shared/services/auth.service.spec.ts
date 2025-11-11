import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User, LoginRequest } from '../models/user.model';

/**
 * Tests unitaires pour AuthService
 * Valide l'authentification et la gestion de session
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Nettoyer localStorage avant chaque test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait envoyer une requête POST lors de la connexion', () => {
    const mockLoginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe'
    };

    service.login(mockLoginRequest).subscribe(response => {
      expect(response).toEqual(mockUser);
      const currentUser = service.getCurrentUser();
      expect(currentUser?.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockLoginRequest);
    req.flush(mockUser);
  });

  it('devrait retourner true si l\'utilisateur est connecté', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    service['loadCurrentUser']();
    
    expect(service.isAuthenticated()).toBe(true);
  });

  it('devrait retourner false si l\'utilisateur n\'est pas connecté', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('devrait nettoyer le localStorage lors de la déconnexion', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    
    service.logout();
    
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('devrait retourner les informations de l\'utilisateur actuel', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    service['loadCurrentUser']();
    
    const currentUser = service.getCurrentUser();
    
    expect(currentUser).toEqual(mockUser);
  });
});
