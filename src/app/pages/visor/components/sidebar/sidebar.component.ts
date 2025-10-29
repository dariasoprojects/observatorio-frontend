import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

type IconKey =
  | 'empadronamiento' | 'avance' | 'actividad' | 'educa' | 'region'
  | 'moneda' | 'sexo' | 'organiza' | 'supagri' | 'supsemb'
  | 'tamparce' | 'regimen' | 'cultivosprin' | 'cultivostrans'
  | 'cultivosperma' | 'fertiabo' | 'bienesreci' | 'servreci';

interface Item {
  title: string;
  section: string;
  icon: IconKey;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  imports: [CommonModule]
})
export class SidebarComponent {

  @Input() activeSection: string | null = null;
  @Output() sectionSelected = new EventEmitter<string>();
  selectSection(id: string) { this.sectionSelected.emit(id); }

  readonly items: Item[] = [
    { title:'Padrón de Productores Agrarios', section:'sec_padron_pa', icon:'empadronamiento' },
    { title:'Centros de empadronamiento', section:'sec_indi_01', icon:'empadronamiento' },
    // { title:'Avance PPA', section:'sec_indi_01', icon:'avance' },
    { title:'Según tipo de actividad', section:'sec_indi_03a', icon:'actividad' },
    { title:'Según Nivel de Educación alcanzado', section:'sec_indi_04', icon:'educa' },
    { title:'Según Región Natural', section:'sec_indi_03', icon:'region' },
    { title:'Según Fuentes de Ingreso', section:'sec_indi_02', icon:'moneda' },
    { title:'Según Género', section:'sec_indi_05', icon:'sexo' },
    { title:'Según Tipo de Organización', section:'sec_indi_06', icon:'organiza' },
    { title:'Superficie Agrícola', section:'sec_indi_supagri', icon:'supagri' },
    { title:'Superficie Sembrada', section:'sec_indi_supsemb', icon:'supsemb' },
    { title:'Tamaño de la Parcela', section:'sec_indi_tamparce', icon:'tamparce' },
    { title:'Régimen Tenencia Tierras', section:'sec_indi_regtene', icon:'regimen' },
    { title:'Principales Cultivos', section:'sec_pricip_cultiv', icon:'cultivosprin' },
    { title:'Cultivos Transitorios', section:'sec_cultiv_transit', icon:'cultivostrans' },
    { title:'Cultivos Permanentes', section:'sec_cultiv_perma', icon:'cultivosperma' },
    { title:'Uso de Fertilizante/Abono', section:'sec_indi_19', icon:'fertiabo' },
    // { title:'Bienes recibidos', section:'sec_indi_01', icon:'bienesreci' },
    // { title:'Servicios recibidos', section:'sec_indi_01', icon:'servreci' },
  ];

  /** Dónde poner los <br> tal como estaban (después de índices 1, 7, 15) */
  readonly breaksAfter = new Set<number>([1, 7, 15]);
}
