import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../expense-form/expense-form';

interface Transferencia {
  de: string;
  a: string;
  cantidad: number;
  saldada: boolean;
}

interface BalancePersona {
  nombre: string;
  pagado: number;
  balance: number;
}

@Component({
  selector: 'app-expense-saldos',
  imports: [CommonModule],
  templateUrl: './expense-saldos.html',
  styleUrl: './expense-saldos.scss',
})
export class ExpenseSaldos {

  @Input() set expenses(value: Expense[]) {
    this._expenses = value;
    this.calcular();
  }

  _expenses: Expense[] = [];
  transferencias: Transferencia[] = [];
  balances: BalancePersona[] = [];

  readonly yo = 'Alex (Yo)';

  get mePagan(): Transferencia[] {
    return this.transferencias.filter(t => t.a === this.yo && !t.saldada);
  }

  get yoDebo(): Transferencia[] {
    return this.transferencias.filter(t => t.de === this.yo && !t.saldada);
  }

  get historial(): Transferencia[] {
    return this.transferencias.filter(t => t.saldada);
  }

  get totalMePagan(): number {
    return this.mePagan.reduce((sum, t) => sum + t.cantidad, 0);
  }

  get totalYoDebo(): number {
    return this.yoDebo.reduce((sum, t) => sum + t.cantidad, 0);
  }

  marcarSaldada(t: Transferencia): void {
    t.saldada = true;
  }

  private calcular(): void {
    if (this._expenses.length === 0) return;

    const personas = [...new Set(this._expenses.map(e => e.paidBy))];
    const n = personas.length;

    const pagado: Record<string, number> = {};
    personas.forEach(p => pagado[p] = 0);
    this._expenses.forEach(e => pagado[e.paidBy] += e.amount);

    const total = this._expenses.reduce((sum, e) => sum + e.amount, 0);
    const parteIgual = total / n;

    const balancesMap: Record<string, number> = {};
    personas.forEach(p => balancesMap[p] = pagado[p] - parteIgual);

    // Lista de balances de todos
    this.balances = personas.map(p => ({
      nombre: p,
      pagado: Math.round(pagado[p] * 100) / 100,
      balance: Math.round(balancesMap[p] * 100) / 100,
    }));

    this.transferencias = [];

    const acreedores = personas
      .filter(p => balancesMap[p] > 0.01)
      .map(p => ({ nombre: p, cantidad: balancesMap[p] }));
    const deudores = personas
      .filter(p => balancesMap[p] < -0.01)
      .map(p => ({ nombre: p, cantidad: -balancesMap[p] }));

    let i = 0, j = 0;
    while (i < deudores.length && j < acreedores.length) {
      const cantidad = Math.min(deudores[i].cantidad, acreedores[j].cantidad);
      this.transferencias.push({
        de: deudores[i].nombre,
        a: acreedores[j].nombre,
        cantidad: Math.round(cantidad * 100) / 100,
        saldada: false,
      });
      deudores[i].cantidad -= cantidad;
      acreedores[j].cantidad -= cantidad;
      if (deudores[i].cantidad < 0.01) i++;
      if (acreedores[j].cantidad < 0.01) j++;
    }
  }
}