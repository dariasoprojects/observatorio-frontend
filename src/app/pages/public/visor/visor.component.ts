import {Component, ElementRef, HostBinding, ViewChild} from '@angular/core';
import {Avatar} from "primeng/avatar";
import {ConsultaMultipleComponent} from "../../../consulta_multiple/consulta-multiple.component";
import {MapaComponent} from "../../auth/visor/components/mapa/mapa.component";
import {SideRightComponent} from "../../auth/visor/components/side-right/side-right.component";
import {SidebarComponent} from "../../auth/visor/components/sidebar/sidebar.component";
import {Router} from '@angular/router';
import {Dialog} from 'primeng/dialog';
import {LoginComponent} from '../../login/login.component';
import {AnalisisEspacialComponent} from '../../../analisis-espacial/analisis-espacial.component';
import {Menu} from 'primeng/menu';
import {MenuItem} from 'primeng/api';
import {MapCommService} from '../../../services/map-comm.service';

@Component({
  selector: 'app-visor',
  imports: [
    Avatar,
    ConsultaMultipleComponent,
    MapaComponent,
    SideRightComponent,
    SidebarComponent,
    Dialog,
    LoginComponent,
    AnalisisEspacialComponent,
    Menu
  ],
  templateUrl: './visor.component.html',
  styleUrl: './visor.component.css'
})
export class VisorComponent {

  constructor(private router: Router,
              private elRef: ElementRef,
              private comm: MapCommService
  ) {}

  // Aplica la clase al contenedor raíz para estrechar la 1ª columna
  @HostBinding('class.left-collapsed') get leftCollapsed() {
    return this.isCollapsed;
  }


  isCollapsed = false;
  activeSection: string | null = null;
  showLoginDialog = false;
  items: MenuItem[] | undefined;
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  @ViewChild('sideright') sideright!: SideRightComponent;

  ngOnInit(): void {
    this.items = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Limpiar',
            icon: 'pi pi-refresh',
            command: () => this.onClear()
          },
        ]
      }
    ];
  }
  onSelectSection(section: string) {
    this.activeSection = section;
    const el = this.elRef.nativeElement as HTMLElement;
    if(this.activeSection==""){
      el.style.setProperty('--right-w', '250px');
    }else{
      el.style.setProperty('--right-w', '450px');
    }
  }

  onLogin(): void {
    this.showLoginDialog = true;
  }

  onBuscarDni(): void {
    const el = this.elRef.nativeElement as HTMLElement;
    el.style.setProperty('--left-w', '360px');
  }

  onLimpiarDni(): void {
    const el = this.elRef.nativeElement as HTMLElement;
    el.style.setProperty('--left-w', '260px');
  }

  onClear(): void {
    this.activeSection ="";
    const el = this.elRef.nativeElement as HTMLElement;
    el.style.setProperty('--right-w', '250px');
    this.comm.resetView();
    el.style.setProperty('--left-w', '260px');
    this.sidebar.onClearDni();
    this.sidebar.onVerPaneles();
    this.sideright.resetFiltros();
  }

}
