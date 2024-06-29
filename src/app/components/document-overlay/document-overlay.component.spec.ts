import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentOverlayComponent } from './document-overlay.component';

describe('DocumentOverlayComponent', () => {
  let component: DocumentOverlayComponent;
  let fixture: ComponentFixture<DocumentOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
