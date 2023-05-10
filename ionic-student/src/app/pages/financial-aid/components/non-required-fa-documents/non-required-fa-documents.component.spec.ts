import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NonRequiredFaDocumentsComponent } from './non-required-fa-documents.component';

describe('NonRequiredFaDocumentsComponent', () => {
  let component: NonRequiredFaDocumentsComponent;
  let fixture: ComponentFixture<NonRequiredFaDocumentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NonRequiredFaDocumentsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NonRequiredFaDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
