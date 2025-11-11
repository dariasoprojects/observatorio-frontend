import {Component, ElementRef, HostBinding} from '@angular/core';
import {Avatar} from "primeng/avatar";
import {ConsultaMultipleComponent} from "../../../consulta_multiple/consulta-multiple.component";
import {MapaComponent} from "../../auth/visor/components/mapa/mapa.component";
import {SideRightComponent} from "../../auth/visor/components/side-right/side-right.component";
import {SidebarComponent} from "../../auth/visor/components/sidebar/sidebar.component";
import {Router} from '@angular/router';
import {Dialog} from 'primeng/dialog';
import {LoginComponent} from '../../login/login.component';

@Component({
  selector: 'app-visor',
  imports: [
    Avatar,
    ConsultaMultipleComponent,
    MapaComponent,
    SideRightComponent,
    SidebarComponent,
    Dialog,
    LoginComponent
  ],
  templateUrl: './visor.component.html',
  styleUrl: './visor.component.css'
})
export class VisorComponent {

  constructor(private router: Router,
              private elRef: ElementRef) {}

  // Aplica la clase al contenedor raíz para estrechar la 1ª columna
  @HostBinding('class.left-collapsed') get leftCollapsed() {
    return this.isCollapsed;
  }


  isCollapsed = false;
  activeSection: string | null = null;
  showLoginDialog = false;

  ngOnInit(): void {
    // this.activeSection = 'sec_padron_pa';
  }
  onSelectSection(section: string) {
    this.activeSection = section;
    const el = this.elRef.nativeElement as HTMLElement;
    el.style.setProperty('--right-w', '450px');
  }

  onLogin(): void {
    this.showLoginDialog = true;
  }
}
