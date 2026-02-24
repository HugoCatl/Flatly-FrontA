import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseStats } from './expense-stats';

describe('ExpenseStats', () => {
  let component: ExpenseStats;
  let fixture: ComponentFixture<ExpenseStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
