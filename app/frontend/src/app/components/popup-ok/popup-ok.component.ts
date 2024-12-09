import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-ok',
  standalone: true,
  imports: [],
  templateUrl: './popup-ok.component.html',
  styleUrl: './popup-ok.component.scss'
})
export class PopupOkComponent {
  @Input() message: string = ''; 
  @Output() close = new EventEmitter<void>(); 

  onClose() {
    this.close.emit();
  }
}
