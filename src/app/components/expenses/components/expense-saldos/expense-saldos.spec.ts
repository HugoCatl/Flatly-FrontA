import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseSaldos } from './expense-saldos';

describe('ExpenseSaldos', () => {
  let component: ExpenseSaldos;
  let fixture: ComponentFixture<ExpenseSaldos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseSaldos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseSaldos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
