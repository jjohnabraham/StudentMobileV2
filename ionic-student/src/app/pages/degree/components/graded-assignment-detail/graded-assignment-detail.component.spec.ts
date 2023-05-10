import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GradedAssignmentDetailPage } from './graded-assignment-detail.page';

describe('GradedAssignmentDetailPage', () => {
  let component: GradedAssignmentDetailPage;
  let fixture: ComponentFixture<GradedAssignmentDetailPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GradedAssignmentDetailPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(GradedAssignmentDetailPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
