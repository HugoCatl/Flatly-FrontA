import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BottomSheet } from '../../../shared/bottom-sheet/bottom-sheet';
import { BillStatus, BillType, Expense, NewBill } from '../../../../models/flatly'; 
import { DataService } from '../../../../services/data';

// ✅ CORRECCIÓN: Iconos corregidos (ejemplo con emojis estándar)
const BILL_TYPES = [
  { value: 'RENT',        label: 'Alquiler',     icon: '🏠', iconClass: 'icon-alquiler' },
  { value: 'ELECTRICITY', label: 'Electricidad', icon: '⚡', iconClass: 'icon-electric' },
  { value: 'WATER',       label: 'Agua',         icon: '💧', iconClass: 'icon-agua'     },
  { value: 'INTERNET',    label: 'Internet',     icon: '🌐', iconClass: 'icon-internet' },
  { value: 'OTHER',       label: 'Otros',        icon: '📝', iconClass: 'icon-varios'   },
];

@Component({
  selector: 'app-expense-form',
  standalone: true, // ✅ Asegurar que está marcado como standalone
  imports: [FormsModule, CommonModule, BottomSheet],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss',
})
export class ExpenseForm {
  private readonly dataService = inject(DataService);
  
  // ✅ CORRECCIÓN: Renombrado según SonarLint y tipado correcto a 'Expense'
  @Output() expenseCreatedEvent = new EventEmitter<Expense>();
  @Output() dismissEvent = new EventEmitter<void>();

  show: boolean = false;
  billTypes = BILL_TYPES;

  newBill: NewBill = this.emptyBill();

  get isFormValid(): boolean {
    return !!this.newBill.type && !!this.newBill.amount && this.newBill.amount > 0;
  }

  private emptyBill(): NewBill {
    const now = new Date();
    return {
      type: '',
      amount: null,
      period_month: now.getMonth() + 1,
      period_year: now.getFullYear(),
    };
  }

  open(): void {
    this.newBill = this.emptyBill();
    this.show = true;
  }

  dismiss(): void {
    this.show = false;
    this.dismissEvent.emit();
  }

  submit(): void {
    if (!this.isFormValid) return;

    // ✅ CORRECCIÓN: Mapear NewBill a Expense antes de emitir
    const type = this.billTypes.find(t => t.value === this.newBill.type)!;
    
    // Mapeamos lo que tenemos en el formulario a la estructura que espera la lista
    const mappedExpense: Expense = {
        name: type.label,
        paidBy: this.dataService.user()?.name || 'Desconocido',
        amount: this.newBill.amount!,
        type: type.value as BillType,
        icon: type.icon,
        iconClass: type.iconClass,
        period_month: this.newBill.period_month,
        period_year: this.newBill.period_year,
        due_date: this.newBill.due_date || '',
        status: BillStatus.PENDING, // Estado por defecto
        created_at: new Date().toISOString()
    };

    this.expenseCreatedEvent.emit(mappedExpense);
    this.dismiss();
  }
}