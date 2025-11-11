import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InvitationService } from '../../shared/services/invitation.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full">
        <!-- Back to Dashboard -->
        <div class="mb-6">
          <button
            (click)="goBack()"
            class="flex items-center text-white hover:text-indigo-100 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Retour au tableau de bord
          </button>
        </div>

        <!-- Main Card -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Accepter une invitation</h1>
            <p class="text-indigo-100">Rejoignez votre équipe et commencez à collaborer</p>
          </div>

          <!-- My Pending Invitations -->
          <div class="p-8">
            <div class="mb-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                Mes invitations en attente
              </h2>

              <!-- Loading -->
              <div *ngIf="loadingInvitations" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>

              <!-- No Invitations -->
              <div *ngIf="!loadingInvitations && pendingInvitations.length === 0" class="text-center py-12">
                <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p class="text-gray-500 text-lg mb-2">Aucune invitation en attente</p>
                <p class="text-gray-400 text-sm">Vous n'avez aucune invitation de projet en attente</p>
              </div>

              <!-- Invitations List -->
              <div *ngIf="!loadingInvitations && pendingInvitations.length > 0" class="space-y-4">
                <div *ngFor="let invitation of pendingInvitations" 
                     class="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-lg transition-all">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="text-lg font-bold text-gray-900 mb-1">{{ invitation.projectName }}</h3>
                      <p class="text-sm text-gray-600 mb-2">{{ invitation.projectDescription || 'Aucune description' }}</p>
                      <div class="flex items-center space-x-3 text-sm">
                        <span class="flex items-center text-gray-500">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          Invité par {{ invitation.invitedByName }}
                        </span>
                        <span class="px-2 py-1 rounded-lg text-xs font-semibold"
                              [ngClass]="{
                                'bg-red-100 text-red-800': invitation.role === 'ADMIN',
                                'bg-blue-100 text-blue-800': invitation.role === 'MEMBER',
                                'bg-green-100 text-green-800': invitation.role === 'OBSERVER'
                              }">
                          {{ invitation.role }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between text-sm mb-4">
                    <span class="text-gray-500">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Expire : {{ invitation.expiresAt | date:'medium' }}
                    </span>
                  </div>

                  <button
                    (click)="acceptInvitationDirect(invitation.token)"
                    [disabled]="accepting === invitation.token"
                    class="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg">
                    <span *ngIf="accepting !== invitation.token">
                      <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Accepter l'invitation
                    </span>
                    <span *ngIf="accepting === invitation.token">
                      <svg class="animate-spin h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Acceptation...
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Manual Token Entry -->
            <div class="border-t-2 border-gray-200 pt-8">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
                Entrer un jeton d'invitation
              </h2>
              
              <form [formGroup]="tokenForm" (ngSubmit)="acceptInvitation()" class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Jeton d'invitation <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="token"
                    placeholder="inv-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  />
                  <p *ngIf="tokenForm.get('token')?.invalid && tokenForm.get('token')?.touched" 
                     class="mt-1 text-sm text-red-600">
                    Un jeton valide est requis (commence par "inv-")
                  </p>
                </div>

                <button
                  type="submit"
                  [disabled]="tokenForm.invalid || accepting"
                  class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                  <span *ngIf="!accepting">
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Accepter l'invitation
                  </span>
                  <span *ngIf="accepting">
                    <svg class="animate-spin h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Acceptation...
                  </span>
                </button>

                <p *ngIf="error" class="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ error }}
                </p>

                <p *ngIf="success" class="text-sm text-green-600 flex items-center bg-green-50 p-3 rounded-lg">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ success }}
                </p>
              </form>
            </div>

            <!-- Help Text -->
            <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 class="font-semibold text-blue-900 mb-2 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Comment trouver votre jeton d'invitation
              </h3>
              <ul class="text-sm text-blue-800 space-y-1 ml-7">
                <li>• Vérifiez votre email pour l'invitation</li>
                <li>• Recherchez le jeton commençant par "inv-"</li>
                <li>• Copiez et collez le jeton complet</li>
                <li>• Les jetons expirent après 7 jours</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6 text-white">
          <p class="text-sm opacity-90">
            Don't have an account? 
            <a routerLink="/auth/register" class="font-semibold underline hover:text-indigo-100">Register here</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class AcceptInvitationComponent implements OnInit {
  tokenForm: FormGroup;
  accepting: string | boolean = false;
  error = '';
  success = '';
  currentUser: any;
  pendingInvitations: any[] = [];
  loadingInvitations = false;

  constructor(
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    
    this.tokenForm = this.fb.group({
      token: ['', [Validators.required, Validators.pattern(/^inv-[a-f0-9-]{36}$/)]]
    });
  }

  ngOnInit(): void {
    if (this.currentUser && this.currentUser.email) {
      this.loadPendingInvitations();
    }
  }

  loadPendingInvitations(): void {
    this.loadingInvitations = true;
    this.invitationService.getPendingInvitations(this.currentUser.email).subscribe({
      next: (invitations: any) => {
        this.pendingInvitations = invitations;
        this.loadingInvitations = false;
      },
      error: (err: any) => {
        console.error('Error loading pending invitations:', err);
        this.loadingInvitations = false;
      }
    });
  }

  acceptInvitation(): void {
    if (this.tokenForm.invalid || this.accepting) return;

    this.accepting = true;
    this.error = '';
    this.success = '';

    const token = this.tokenForm.get('token')?.value;

    this.invitationService.acceptInvitation(token).subscribe({
      next: (response: any) => {
        this.accepting = false;
        this.success = 'Invitation accepted successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/projects']);
        }, 2000);
      },
      error: (err: any) => {
        this.accepting = false;
        this.error = err.error?.message || 'Failed to accept invitation. Please check your token.';
      }
    });
  }

  acceptInvitationDirect(token: string): void {
    this.accepting = token;
    this.error = '';
    this.success = '';

    this.invitationService.acceptInvitation(token).subscribe({
      next: (response: any) => {
        this.accepting = false;
        this.success = 'Invitation accepted successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/projects']);
        }, 2000);
      },
      error: (err: any) => {
        this.accepting = false;
        this.error = err.error?.message || 'Failed to accept invitation.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
