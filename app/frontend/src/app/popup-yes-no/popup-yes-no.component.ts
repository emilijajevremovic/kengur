import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-yes-no',
  standalone: true,
  imports: [],
  templateUrl: './popup-yes-no.component.html',
  styleUrl: './popup-yes-no.component.scss',
})
export class PopupYesNoComponent {
  @Input() message: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    //console.log('Korisnik je kliknuo NE');
    this.close.emit();
  }

  onConfirm() {
    //console.log('Korisnik je kliknuo DA');
    this.confirm.emit();
  }
}
