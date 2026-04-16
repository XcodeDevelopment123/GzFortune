import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightPage } from './highlight.page';

describe('HighlightPage', () => {
  let component: HighlightPage;
  let fixture: ComponentFixture<HighlightPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
