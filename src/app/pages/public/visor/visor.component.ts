import {Component, ElementRef, HostBinding, OnInit, ViewChild} from '@angular/core';
import {Avatar} from "primeng/avatar";
import {MapaComponent} from "../../auth/visor/components/mapa/mapa.component";
import {SideRightComponent} from "../../auth/visor/components/side-right/side-right.component";
import {SidebarComponent} from "../../auth/visor/components/sidebar/sidebar.component";
import {Router} from '@angular/router';
import {Dialog} from 'primeng/dialog';
import {LoginComponent} from '../../login/login.component';
import {Menu} from 'primeng/menu';
import {MenuItem} from 'primeng/api';
import {MapCommService} from '../../../services/map-comm.service';
import {LoaderComponent} from '../../loader/loader.component';
import {AnalisisEspacialComponent} from "../../auth/visor/components/analisis-espacial/analisis-espacial.component";
import {ConsultaMultipleComponent} from '../../auth/visor/components/consulta-multiple/consulta-multiple.component';

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
        Menu,
        LoaderComponent,
        AnalisisEspacialComponent
    ],
  templateUrl: './visor.component.html',
  styleUrl: './visor.component.css'
})
export class VisorComponent implements OnInit {

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
  dialogVisible = false;
  dialogVisibleConsultaMultiple = false;
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
    this.comm.abrirAnalisisDialog$
      .subscribe(() => {
        this.dialogVisible = true;
      });

    this.comm.abrirConsultasMultipleDialog$
      .subscribe(() => {
        this.dialogVisibleConsultaMultiple = true;
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

  onLogin(): void {
    this.showLoginDialog = true;
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
