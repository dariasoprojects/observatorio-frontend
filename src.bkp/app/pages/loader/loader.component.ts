import {Component, inject} from '@angular/core';
import {LoaderService} from '../../services/state/loader.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  private loader = inject(LoaderService);
  loading$ = this.loader.loading$;
}
