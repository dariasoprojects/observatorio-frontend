import {Component, ElementRef, HostBinding, ViewChild} from '@angular/core';
import {AvatarModule} from 'primeng/avatar';
import {PanelModule} from 'primeng/panel';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {CardModule} from 'primeng/card';
import {TagModule} from 'primeng/tag';
import {Router} from '@angular/router';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {SideRightComponent} from './components/side-right/side-right.component';
import {MapaComponent} from './components/mapa/mapa.component';
import {DialogModule} from 'primeng/dialog';
import {MapCommService} from '../../../services/map-comm.service';
import {LoaderComponent} from '../../loader/loader.component';
import {AnalisisEspacialComponent} from './components/analisis-espacial/analisis-espacial.component';
import {ConsultaMultipleComponent} from './components/consulta-multiple/consulta-multiple.component';
import {BusquedaDniComponent} from './components/busqueda-dni/busqueda-dni.component';
import {DescargasComponent} from './components/descargas/descargas.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-visor',
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    PanelModule,
    DropdownModule,
    CardModule,
    TagModule,
    SidebarComponent,
    SideRightComponent,
    MapaComponent,
    ConsultaMultipleComponent,
    AnalisisEspacialComponent,
    DialogModule,
    LoaderComponent,
    AnalisisEspacialComponent,
    ConsultaMultipleComponent,
    BusquedaDniComponent,
    DescargasComponent,

  ],
  templateUrl: './visor.component.html',
  styleUrl: './visor.component.css'
})
export class VisorComponent {

  usuarioLogueado = 'Usuario';
  tipoUsuario = 'Acceso';
  entidadUsuario = '';
  inicialUsuario = 'U';
  esVisitante = true;

  constructor(
              private elRef: ElementRef,
              private comm: MapCommService,
              private authService: AuthService,
              private router: Router
              ) {}

  // Aplica la clase al contenedor raíz para estrechar la 1ª columna
  @HostBinding('class.left-collapsed') get leftCollapsed() {
    return this.isCollapsed;
  }

  // usuarioLogueado = '';
  // tipoUsuario = '';
  // inicialUsuario = '';
  // entidadUsuario = '';


  isCollapsed = false;
  activeSection: string | null = null;
  dialogVisible = false;
  dialogVisibleDescarga = false;
  dialogVisibleConsultaMultiple = false;
  dialogVisibleBusquedaDni = false;
  //items: MenuItem[] | undefined;
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  @ViewChild('sideright') sideright!: SideRightComponent;


  

  ngOnInit(): void {
    this.esVisitante = !this.authService.estaAutenticado();

    if (this.esVisitante) {
      this.usuarioLogueado = 'Visitante';
      this.tipoUsuario = 'Acceso público';
      this.entidadUsuario = '';
      this.inicialUsuario = 'V';
    } else {
    const nombres = this.authService.obtenerNombres().trim();
    const apellidos = this.authService.obtenerApellidos().trim();
    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    this.usuarioLogueado = nombreCompleto || this.authService.obtenerUsuario() || 'Usuario';
    this.tipoUsuario = this.authService.obtenerTipoUser() || 'Acceso';
    this.entidadUsuario = this.authService.obtenerEntidad();
    this.inicialUsuario = this.usuarioLogueado.charAt(0).toUpperCase();
    }

    this.comm.abrirAnalisisDialog$
      .subscribe(() => {
        this.dialogVisible = true;
      });
    this.comm.abrirConsultasMultipleDialog$
      .subscribe(() => {
        this.dialogVisibleConsultaMultiple = true;
        this.dialogVisible = false;
        this.dialogVisibleDescarga = false;
      });

    this.comm.abrirDescargasDialog$
    .subscribe(() => {
        this.dialogVisibleDescarga = true;
      });

    this.comm.abrirBusquedaDniDialog$
      .subscribe(() => {
        this.dialogVisibleBusquedaDni = true;
      });

  }
  onSelectSection(section: string) {
     this.activeSection = section;
    const el = this.elRef.nativeElement as HTMLElement;
    if(this.activeSection==""){
      el.style.setProperty('--right-w', '330px');
    }else{
      el.style.setProperty('--right-w', '450px');
    }
  }

  onLogout(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }

  onClear(): void {
    this.activeSection ="";
    const el = this.elRef.nativeElement as HTMLElement;
    el.style.setProperty('--right-w', '330px');
    this.comm.resetView();
    el.style.setProperty('--left-w', '260px');
    this.sidebar.onVerPaneles();
    this.sideright.resetFiltros();
  }
}
