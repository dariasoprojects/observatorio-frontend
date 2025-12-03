import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-layout-vertical',
  imports: [],
  templateUrl: './layout-vertical.component.html',
  styleUrl: './layout-vertical.component.css'
})
export class LayoutVerticalComponent {


  constructor(private router: Router) {}

  onIrInicio(): void {
  this.router.navigate(['/']); // 🔹 Cambia '/inicio' por la ruta que desees
}
}
