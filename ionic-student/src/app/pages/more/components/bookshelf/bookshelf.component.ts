import { Component } from '@angular/core';
import { PecNavigationService } from '../../../../shared/services/pec-navigation.service';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { AssignmentService } from '../../../../data/services/assignment.service';
import { first } from 'rxjs/operators';
import { MenuController, ModalController } from '@ionic/angular';
import { CourseBook } from '../../../../data/types/assignment.type';
import { BookshelfModalComponent } from '../bookshelf-modal/bookshelf-modal.component';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';

@Component({
  selector: 'pec-bookshelf',
  templateUrl: './bookshelf.component.html',
  styleUrls: ['./bookshelf.component.scss'],
})
export class BookshelfComponent extends BaseComponent {
  public showError = false;
  public showLoading = true;
  public bookshelf: CourseBook[];
  public sortOrder = 'title';
  public uniquePMIArray: string[];
  public previousView: string;
  private bookshelfModal: HTMLIonModalElement;

  constructor(
    public menuCtrl: MenuController,
    public globalConfigs: GlobalConfigsService,
    private modalCtrl: ModalController,
    private assignmentService: AssignmentService,
    private pecNavService: PecNavigationService
  ) {
    super();
  }

  public doRefresh(event) {
    this.reload();
    setTimeout(() => {
      if (event) event.target.complete();
    }, 2000);
  }

  public ionViewWillEnter() {
    this.loadData(true);
  }

  public ionViewDidEnter(): void {
    this.previousView = this.pecNavService.getPreviousUrl();
  }

  public ionViewDidLeave() {
    this.clearSubscriptions();

    if (this.bookshelfModal) {
      this.bookshelfModal.dismiss();
      delete this.bookshelfModal;
    }
  }

  public presentSortModal() {
    this.modalCtrl
      .create({
        component: BookshelfModalComponent,
        componentProps: {
          sortOrder: this.sortOrder,
          backDropDismissed: (order) => (this.sortOrder = order),
        },
        cssClass: 'bookshelf-modal',
        backdropDismiss: true,
        mode: 'md',
      })
      .then((modal) => {
        this.bookshelfModal = modal;

        this.bookshelfModal.onWillDismiss().then((data) => {
          if (data && data.data) {
            this.sortOrder = data.data.sortOrder;
          }

          switch (this.sortOrder) {
            case 'title': {
              this.bookshelf.sort(this.alphaTitleCompare);
              break;
            }
            case 'term': {
              this.bookshelf.sort(this.alphaTermCompare);
              break;
            }
            case 'course name': {
              this.bookshelf.sort(this.alphaCourseCompare);
              break;
            }
            default: {
              this.bookshelf.sort(this.alphaTitleCompare);
              break;
            }
          }
        });

        this.bookshelfModal.present();
      });
  }

  public reload() {
    this.showError = false;
    this.clearSubscriptions();
    this.loadData(true);
  }

  private loadData(refresh?: boolean) {
    this.assignmentService
      .overallBookshelf(refresh)
      .pipe(first())
      .subscribe(
        (bookshelf) => {
          this.bookshelf = bookshelf.filter((f) => f.Title !== undefined && f.Title !== null && f.Title !== '');
          this.addBookUrls();
          this.bookshelf.sort(this.alphaTitleCompare);
          this.getUniquePMIContent();
          this.clearLoading();
        },
        (error) => {
          this.showError = true;
          this.showLoading = false;

          setTimeout(() => {
            this.subscriptions.bookshelf.unsubscribe();
            delete this.subscriptions.bookshelf;
          }, 0);
        }
      );
  }

  private addBookUrls() {
    if (this.bookshelf) {
      this.bookshelf.forEach((element) => {
        element.Url = '{{lmsUrl}}/material/ebook/' + element.ISBN + '?slt={{token}}';
      });
    }
  }

  private getUniquePMIContent() {
    const a: string[] = [];
    let i = 0;
    this.bookshelf.forEach((elem) => {
      if (elem.BooksAndGuideText != null && elem.BooksAndGuideText.trim() !== '') {
        a[i] = elem.BooksAndGuideText;
        i++;
      }
    });
    this.uniquePMIArray = a.filter((value, index) => a.indexOf(value) === index);
  }

  private alphaTitleCompare(a, b) {
    if (a.Title < b.Title) return -1;
    if (a.Title > b.Title) return 1;

    return 0;
  }

  private alphaTermCompare(a, b) {
    if (a.TermCode > b.TermCode) return -1;
    if (a.TermCode < b.TermCode) return 1;

    return 0;
  }

  private alphaCourseCompare(a, b) {
    if (a.CourseName < b.CourseName) return -1;
    if (a.CourseName > b.CourseName) return 1;

    return 0;
  }

  private clearLoading() {
    if (this.showLoading && this.bookshelf) {
      this.showLoading = false;
    }
  }
}
