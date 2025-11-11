import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-600 to-red-500 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Animated Background Shapes -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-blob"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div class="max-w-md w-full space-y-8 relative z-10">
        <!-- Logo Card -->
        <div class="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div class="bg-white p-4 rounded-2xl shadow-xl">
                <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
            </div>
            <h2 class="text-4xl font-extrabold text-white mb-2">
              Rejoignez PMT
            </h2>
            <p class="text-lg text-white/80">
              Créez votre compte et commencez à collaborer
            </p>
          </div>
        </div>

        <!-- Register Form Card -->
        <div class="bg-white rounded-3xl shadow-2xl p-8 space-y-6 transform transition-all hover:scale-[1.02]">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom
                </label>
                <div class="relative">
                  <input
                    id="firstName"
                    type="text"
                    formControlName="firstName"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    [class.border-red-500]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                    [class.border-green-500]="registerForm.get('firstName')?.valid && registerForm.get('firstName')?.touched"
                    placeholder="John">
                  <div *ngIf="registerForm.get('firstName')?.valid && registerForm.get('firstName')?.touched" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <p *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched" 
                   class="mt-1 text-xs text-red-600">Requis</p>
              </div>

              <div>
                <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                <div class="relative">
                  <input
                    id="lastName"
                    type="text"
                    formControlName="lastName"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    [class.border-red-500]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                    [class.border-green-500]="registerForm.get('lastName')?.valid && registerForm.get('lastName')?.touched"
                    placeholder="Doe">
                  <div *ngIf="registerForm.get('lastName')?.valid && registerForm.get('lastName')?.touched" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <p *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched" 
                   class="mt-1 text-xs text-red-600">Requis</p>
              </div>
            </div>

            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  [class.border-green-500]="registerForm.get('email')?.valid && registerForm.get('email')?.touched"
                  placeholder="you@company.com">
                <div *ngIf="registerForm.get('email')?.valid && registerForm.get('email')?.touched" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <p *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                 class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Une adresse e-mail valide est requise
              </p>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  [class.border-green-500]="registerForm.get('password')?.valid && registerForm.get('password')?.touched"
                  placeholder="••••••••">
                <div *ngIf="registerForm.get('password')?.valid && registerForm.get('password')?.touched" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Password Strength Indicator -->
              <div *ngIf="registerForm.get('password')?.value" class="mt-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-gray-700">Force du mot de passe</span>
                  <span class="text-xs font-semibold" [class.text-red-600]="passwordStrength < 40" [class.text-yellow-600]="passwordStrength >= 40 && passwordStrength < 70" [class.text-green-600]="passwordStrength >= 70">
                    {{ passwordStrengthText }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full transition-all duration-300" [ngClass]="passwordStrengthColor" [style.width.%]="passwordStrength"></div>
                </div>
                <div class="mt-2 space-y-1">
                  <p class="text-xs flex items-center" [class.text-gray-400]="!hasLowercase()" [class.text-green-600]="hasLowercase()">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="hasLowercase() ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'"></path>
                    </svg>
                    Une lettre minuscule
                  </p>
                  <p class="text-xs flex items-center" [class.text-gray-400]="!hasUppercase()" [class.text-green-600]="hasUppercase()">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="hasUppercase() ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'"></path>
                    </svg>
                    Une lettre majuscule
                  </p>
                  <p class="text-xs flex items-center" [class.text-gray-400]="!hasNumber()" [class.text-green-600]="hasNumber()">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="hasNumber() ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'"></path>
                    </svg>
                    Un chiffre
                  </p>
                  <p class="text-xs flex items-center" [class.text-gray-400]="!hasMinLength()" [class.text-green-600]="hasMinLength()">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="hasMinLength() ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'"></path>
                    </svg>
                    Au moins 8 caractères
                  </p>
                </div>
              </div>
              
              <p *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                 class="mt-1 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Le mot de passe doit respecter les exigences ci-dessus
              </p>
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="rounded-xl bg-red-50 p-4 border border-red-200 animate-shake">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-red-800">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || loading"
              class="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]">
              <span *ngIf="!loading" class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Créer un compte
              </span>
              <span *ngIf="loading" class="flex items-center">
                <svg class="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </span>
            </button>

            <!-- Sign In Link -->
            <div class="text-center pt-4 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                Vous avez déjà un compte ?
                <a routerLink="/login" class="font-semibold text-purple-600 hover:text-purple-500 ml-1 transition-colors">
                  Se connecter →
                </a>
              </p>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-white/60">
          © 2025 PMT. Outil professionnel de gestion de projets.
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(20px, -50px) scale(1.1); }
      50% { transform: translate(-20px, 20px) scale(0.9); }
      75% { transform: translate(50px, 50px) scale(1.05); }
    }
    
    .animate-blob {
      animation: blob 7s infinite;
    }
    
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    
    .animation-delay-4000 {
      animation-delay: 4s;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    .animate-shake {
      animation: shake 0.5s;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });

    // Monitor password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.calculatePasswordStrength(password);
    });
  }

  strongPasswordValidator(control: any) {
    const value = control.value || '';
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const valid = hasNumber && hasUpper && hasLower && value.length >= 8;
    
    if (!valid && value.length > 0) {
      return { weakPassword: true };
    }
    return null;
  }

  calculatePasswordStrength(password: string) {
    let strength = 0;
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      return;
    }

    // Length
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;

    // Character variety
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;

    this.passwordStrength = Math.min(strength, 100);

    if (this.passwordStrength < 40) {
      this.passwordStrengthText = 'Faible';
      this.passwordStrengthColor = 'bg-red-500';
    } else if (this.passwordStrength < 70) {
      this.passwordStrengthText = 'Moyen';
      this.passwordStrengthColor = 'bg-yellow-500';
    } else {
      this.passwordStrengthText = 'Fort';
      this.passwordStrengthColor = 'bg-green-500';
    }
  }

  // Helper methods for password validation in template
  hasLowercase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[a-z]/.test(password);
  }

  hasUppercase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return password.length >= 8;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Échec de l\'inscription';
          this.loading = false;
        }
      });
    }
  }
}
