import {Component, HostBinding} from '@angular/core';
import {AvatarModule} from 'primeng/avatar';
import {PanelModule} from 'primeng/panel';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {CardModule} from 'primeng/card';
import {TagModule} from 'primeng/tag';

@Component({
  selector: 'app-visor',
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    PanelModule,
    DropdownModule,
    CardModule,
    TagModule
  ],
  templateUrl: './visor.component.html',
  styleUrl: './visor.component.css'
})
export class VisorComponent {

  departamentos = [{name:'Lima'},{name:'Cusco'},{name:'Piura'}];
  provincias = [{name:'Lima'},{name:'Huaral'}];
  distritos = [{name:'Miraflores'},{name:'Surco'}];

  selectedDep:any; selectedProv:any; selectedDist:any;

  kpi = { productores: 1247, parcelas: 3245, hectareas: 45230 };
  cobertura = { departamentos: '25/25', provincias: '195/196', fecha: '28/06' };

  onPanelToggle() {

  }

  isCollapsed = false;

  // Aplica la clase al contenedor raíz para estrechar la 1ª columna
  @HostBinding('class.left-collapsed') get leftCollapsed() {
    return this.isCollapsed;
  }

  toggleLeft(): void {
    this.isCollapsed = !this.isCollapsed;

    // (opcional) si usas ArcGIS/Leaflet y el mapa pierde tamaño:
    // setTimeout(() => this.resizeMap(), 0);
  }
}
