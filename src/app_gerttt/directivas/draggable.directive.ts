import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true 
})
export class DraggableDirective {
  private pos1 = 0;
  private pos2 = 0;
  private pos3 = 0;
  private pos4 = 0;

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.position = 'absolute';
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Solo activar drag si el click fue en un elemento con la clase "drag-handle"
    if (!(event.target as HTMLElement).classList.contains('drag-handle')) {
      return; // si no es cabecera, no arrastra
    }

    event.preventDefault();
    this.pos3 = event.clientX;
    this.pos4 = event.clientY;

    document.onmouseup = this.closeDragElement;
    document.onmousemove = this.elementDrag;
  }

  elementDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.pos1 = this.pos3 - event.clientX;
    this.pos2 = this.pos4 - event.clientY;
    this.pos3 = event.clientX;
    this.pos4 = event.clientY;

    this.el.nativeElement.style.top =
      this.el.nativeElement.offsetTop - this.pos2 + 'px';
    this.el.nativeElement.style.left =
      this.el.nativeElement.offsetLeft - this.pos1 + 'px';
  };

  closeDragElement = () => {
    document.onmouseup = null;
    document.onmousemove = null;
  };
}
