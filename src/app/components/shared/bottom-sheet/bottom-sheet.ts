import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-sheet',
  imports: [CommonModule],
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.scss',
})
export class BottomSheet {

  @Input() title: string = '';
  @Input() confirmLabel: string = 'Guardar';
  @Input() confirmDisabled: boolean = false;
  @Input() show: boolean = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onDismiss = new EventEmitter<void>();

  isClosing = false;

  dismiss(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.onDismiss.emit();
    }, 300);
  }

  confirm(): void {
    this.onConfirm.emit();
  }
}