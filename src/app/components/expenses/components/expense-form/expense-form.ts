import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BottomSheet } from '../../../shared-forms/bottom-sheet/bottom-sheet';

interface NewBill {
  type: string;
  amount: number | null;
  period_month: number;
  period_year: number;
}

interface Expense {
  name: string;
  paidBy: string;
  amount: number;
  icon: string;
  iconClass: string;
}

const BILL_TYPES = [
  { value: 'RENT',        label: 'Alquiler',     icon: '🏢', iconClass: 'icon-alquiler' },
  { value: 'ELECTRICITY', label: 'Electricidad', icon: '💡', iconClass: 'icon-electric' },
  { value: 'WATER',       label: 'Agua',         icon: '💧', iconClass: 'icon-agua'     },
  { value: 'INTERNET',    label: 'Internet',     icon: '📶', iconClass: 'icon-internet' },
  { value: 'OTHER',       label: 'Otros',        icon: '🛒', iconClass: 'icon-varios'   },
];

@Component({
  selector: 'app-expense-form',
  imports: [FormsModule, BottomSheet],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss',
})
export class ExpenseForm {

  @Output() onExpenseCreated = new EventEmitter<Expense>();
  @Output() onDismiss = new EventEmitter<void>();

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
      paidBy: 'Alex (Yo)',
      amount: this.newBill.amount!,
      icon: type.icon,
      iconClass: type.iconClass,
    });
    this.show = false;
  }

  private emptyBill(): NewBill {
    return {
      type: '',
      amount: null,
      period_month: new Date().getMonth() + 1,
      period_year: new Date().getFullYear(),
    };
  }
}