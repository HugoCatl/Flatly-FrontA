import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../expense-form/expense-form';

@Component({
  selector: 'app-expense-detail',
  imports: [CommonModule],
  templateUrl: './expense-detail.html',
  styleUrl: './expense-detail.scss',
})
export class ExpenseDetail {

  @Input() expense!: Expense;
  @Output() onClose = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<Expense>();

  showDeleteConfirm = false;

  months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

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