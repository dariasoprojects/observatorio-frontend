import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  mostrarContrasena = false; // Controla el icono del ojo
  formularioLogin: FormGroup; // Formulario reactivo

  constructor(private constructorFormulario: FormBuilder, private router: Router) {
    // Se define el formulario con validaciones
    this.formularioLogin = this.constructorFormulario.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  // Getters para facilitar el acceso desde el HTML
  get usuarioInvalido(): boolean {
    const campo = this.formularioLogin.get('usuario');
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  get contrasenaInvalida(): boolean {
    const campo = this.formularioLogin.get('contrasena');
    return !!campo && campo.invalid && (campo.touched || campo.dirty);
  }

  // Acción del botón "Iniciar sesión"
  iniciarSesion(): void {
    // Si el formulario no es válido, se muestran los errores
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    // Se obtienen los valores del formulario
    const usuario = this.formularioLogin.value.usuario;
    const contrasena = this.formularioLogin.value.contrasena;

    // Aquí iría la lógica real de autenticación
    console.log('Usuario:', usuario);
    console.log('Contraseña:', contrasena);

    // Si la autenticación es correcta, se redirige
    this.router.navigate(['/visor']);
  }

}
