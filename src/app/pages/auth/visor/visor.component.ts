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
import {ConsultaMultipleComponent} from '../../../consulta_multiple/consulta-multiple.component';

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
    ConsultaMultipleComponent
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

  ngOnInit(): void {
   // this.activeSection = 'sec_padron_pa';
  }
  onSelectSection(section: string) {
     this.activeSection = section;
    const el = this.elRef.nativeElement as HTMLElement;
    el.style.setProperty('--right-w', '450px');
  }

  onLogout(): void {
    this.router.navigate(['/visor-2']);
  }
}
