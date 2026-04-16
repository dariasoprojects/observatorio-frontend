import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  mostrarContrasena = false;
  formularioLogin: FormGroup;
  cargando = false;
  mensajeError = '';

  constructor(
    private constructorFormulario: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.formularioLogin = this.constructorFormulario.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  get usuarioInvalido(): boolean {
    const campo = this.formularioLogin.get('usuario');
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  get contrasenaInvalida(): boolean {
    const campo = this.formularioLogin.get('contrasena');
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  iniciarSesion(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.mensajeError = '';
    this.cargando = true;

    const usuario = this.formularioLogin.value.usuario?.trim();
    const contrasena = this.formularioLogin.value.contrasena;

    const payload = {
      username: usuario,
      password: contrasena
    };

    this.authService.login(payload).subscribe({
      next: (respuesta: LoginResponse) => {
        this.cargando = false;

        if (respuesta.error) {
          this.mensajeError = respuesta.error;
          return;
        }

        if (!respuesta.token) {
          this.mensajeError = 'No se recibió token de autenticación.';
          return;
        }

        this.authService.guardarSesion(respuesta);
        this.router.navigate(['/auth/visor']);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error en login:', error);

        if (error?.error?.error) {
          this.mensajeError = error.error.error;
        } else {
          this.mensajeError = 'No se pudo iniciar sesión.';
        }
      }
    });
  }
}

// import { Component } from '@angular/core';
// import {Router} from '@angular/router';
// import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
// import {CommonModule} from '@angular/common';

// @Component({
//   selector: 'app-login',
//   imports: [
//     FormsModule,
//     ReactiveFormsModule,
//     CommonModule
//   ],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
// })
// export class LoginComponent {

//   mostrarContrasena = false; // Controla el icono del ojo
//   formularioLogin: FormGroup; // Formulario reactivo

//   constructor(private constructorFormulario: FormBuilder, private router: Router) {
//     // Se define el formulario con validaciones
//     this.formularioLogin = this.constructorFormulario.group({
//       usuario: ['', Validators.required],
//       contrasena: ['', Validators.required]
//     });
//   }

//   // Getters para facilitar el acceso desde el HTML
//   get usuarioInvalido(): boolean {
//     const campo = this.formularioLogin.get('usuario');
//     return !!campo && campo.invalid && (campo.touched || campo.dirty);
//   }

//   get contrasenaInvalida(): boolean {
//     const campo = this.formularioLogin.get('contrasena');
//     return !!campo && campo.invalid && (campo.touched || campo.dirty);
//   }

//   // Acción del botón "Iniciar sesión"
//   iniciarSesion(): void {
//     // Si el formulario no es válido, se muestran los errores
//     if (this.formularioLogin.invalid) {
//       this.formularioLogin.markAllAsTouched();
//       return;
//     }

//     // Se obtienen los valores del formulario
//     const usuario = this.formularioLogin.value.usuario;
//     const contrasena = this.formularioLogin.value.contrasena;

//     // Aquí iría la lógica real de autenticación
//     console.log('Usuario:', usuario);
//     console.log('Contraseña:', contrasena);

//     // Si la autenticación es correcta, se redirige
//     this.router.navigate(['/auth/visor']);
//   }

// }
