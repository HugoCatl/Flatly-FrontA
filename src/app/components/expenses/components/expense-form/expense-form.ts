import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BottomSheet } from '../../../shared/bottom-sheet/bottom-sheet';
import { BillStatus, BillType, Expense,NewBill } from '../../../../models/flatly';
import { DataService } from '../../../../services/data';





const BILL_TYPES = [
  { value: 'RENT',        label: 'Alquiler',     icon: '🏢', iconClass: 'icon-alquiler' },
  { value: 'ELECTRICITY', label: 'Electricidad', icon: '💡', iconClass: 'icon-electric' },
  { value: 'WATER',       label: 'Agua',         icon: '💧', iconClass: 'icon-agua'     },
  { value: 'INTERNET',    label: 'Internet',     icon: '📶', iconClass: 'icon-internet' },
  { value: 'OTHER',       label: 'Otros',        icon: '🛒', iconClass: 'icon-varios'   },
];

@Component({
  selector: 'app-expense-form',
  imports: [FormsModule, CommonModule, BottomSheet],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss',
})
export class ExpenseForm {
  dataService = inject(DataService);
  @Output() onExpenseCreated = new EventEmitter<Expense>();
  @Output() onDismiss = new EventEmitter<void>();

  user = this.dataService.user();

  show: boolean = false;
  billTypes = BILL_TYPES;

  newBill: NewBill = this.emptyBill();

  get isFormValid(): boolean {
    return !!this.newBill.type && !!this.newBill.amount && this.newBill.amount > 0;
  }

  open(): void {
    this.newBill = this.emptyBill();
    this.show = true;
  }

  dismiss(): void {
    this.show = false;
    this.onDismiss.emit();
  }

  submit(): void {
  if (!this.isFormValid) return;
  const type = this.billTypes.find(t => t.value === this.newBill.type)!;
  this.onExpenseCreated.emit({
    name: type.label,
    paidBy: this.dataService.user()?.name || 'Desconocido',
    amount: this.newBill.amount!,
    type: type.value as BillType,
    icon: type.icon,
    iconClass: type.iconClass,
    period_month: this.newBill.period_month,
    period_year: this.newBill.period_year,
    due_date: this.newBill.due_date || '',
    status: BillStatus.PENDING,
    created_at:null!,
  });
  this.show = false;
}

  private emptyBill(): NewBill {
  return {
    type: '',
    amount: null,
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    due_date: '',
  };
}
}