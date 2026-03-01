import { Component, Input, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../../../../models/flatly';
import { DataService } from '../../../../services/data';

@Component({
  selector: 'app-expense-detail',
  imports: [CommonModule],
  templateUrl: './expense-detail.html',
  styleUrl: './expense-detail.scss',
})
export class ExpenseDetail {
  private dataService = inject(DataService);

  @Input() expense!: Expense;
  @Output() onClose = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<Expense>();

  showDeleteConfirm = false;

  months = this.dataService.months;

  @HostListener('document:keydown.escape')
  onEscKey(): void {
    this.close();
  }

  close(): void {
    this.showDeleteConfirm = false;
    this.onClose.emit();
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  deleteExpense(): void {
    this.onDelete.emit(this.expense);
  }
}