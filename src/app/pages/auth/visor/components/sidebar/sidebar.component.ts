import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PanelModule} from 'primeng/panel';
import {CommonModule} from '@angular/common';

export interface Item { title: string; section: string; icon: string; }
interface PanelGroup { title: string; icon: string; collapsed: boolean; items: Item[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {


  @Input()  isCollapsed = false;                       // no nullable
  @Output() isCollapsedChange = new EventEmitter<boolean>();

  // Selección de sección
  @Input()  activeSection: string | null = null;
  @Output() sectionSelected = new EventEmitter<string>();

  // Datos
  readonly panels: PanelGroup[] = [
    {
      title: 'Gestión PPA',
      icon: 'pi-cog',
      collapsed: false,
      items: [
        { title: 'Padrón de Productores Agrarios', section: 'sec_padron_pa', icon: 'empadronamiento' },
        { title: 'Centros de empadronamiento',     section: 'sec_indi_01',   icon: 'empadronamiento' },
        // { title: 'Avance PPA',                     section: 'sec_indi_02',   icon: 'empadronamiento' },
      ],
    },
    {
      title: 'Características Productor Agrario',
      icon: 'pi-id-card',
      collapsed: true,
      items: [
        { title: 'Según Tipo de Actividad',  section: 'sec_indi_03a', icon: 'actividad' },
        { title: 'Según Nivel de Educación', section: 'sec_indi_04',  icon: 'educa' },
        { title: 'Según Región Natural',     section: 'sec_indi_05',  icon: 'region' },
        { title: 'Según Fuentes de Ingreso', section: 'sec_indi_06',  icon: 'ingreso' },
        { title: 'Según Género',             section: 'sec_indi_07',  icon: 'genero' },
        { title: 'Según Tipo de Organización', section: 'sec_indi_08', icon: 'organizacion' },
      ],
    },
    {
      title: 'Características de la Unidad Agraria',
      icon: 'pi-chart-bar',
      collapsed: true,
      items: [
        { title: 'Superficie Agrícola',     section: 'sec_indi_09', icon: 'superficie' },
        { title: 'Superficie Sembrada',     section: 'sec_indi_10', icon: 'superficie' },
        { title: 'Tamaño de la Parcela',    section: 'sec_indi_11', icon: 'parcela' },
        { title: 'Régimen Tenencia Tierras', section: 'sec_indi_12', icon: 'tenencia' },
      ],
    },
    {
      title: 'Cultivos',
      icon: 'pi-chart-pie',
      collapsed: true,
      items: [
        { title: 'Principales Cultivos',   section: 'sec_indi_13', icon: 'cultivos' },
        { title: 'Cultivos Transitorios',  section: 'sec_indi_14', icon: 'cultivos' },
        { title: 'Cultivos Permanentes',   section: 'sec_indi_15', icon: 'cultivos' },
      ],
    },
    {
      title: 'Insumos y Equipos',
      icon: 'pi-box',
      collapsed: true,
      items: [
        { title: 'Uso de Fertilizante/Abono', section: 'sec_indi_16', icon: 'fertilizante' },
      ],
    },
    // {
    //   title: 'Bienes y Servicios',
    //   icon: 'pi-briefcase',
    //   collapsed: true,
    //   items: [
    //     { title: 'Bienes recibidos',    section: 'sec_indi_17', icon: 'bienes' },
    //     { title: 'Servicios recibidos', section: 'sec_indi_18', icon: 'servicios' },
    //   ],
    // },
  ];

  toggleLeft(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);  // <-- clave para two-way
  }

  selectSection(id: string) {
    this.sectionSelected.emit(id);
  }


  trackByItem  = (_: number, it: Item) => it.section;

}
