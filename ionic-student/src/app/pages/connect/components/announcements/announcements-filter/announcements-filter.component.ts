import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pec-announcements-filter',
  templateUrl: './announcements-filter.component.html',
  styleUrls: ['./announcements-filter.component.scss'],
})
export class AnnouncementsFilterComponent implements OnInit {
  public filterOptions: any;
  public clearSelectedFilters: any;
  constructor(private modalController: ModalController, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params.length) {
        this.filterOptions = params.filterOptions;
        this.clearSelectedFilters = params.clearSelectedFilters;
      }
    });
  }

  public dismissFilter() {
    this.modalController.dismiss();
  }

  private selectFilter(filterName: string) {
    if (filterName === 'read') {
      this.filterOptions.read = !this.filterOptions.read;
      this.modifyFilterCount(this.filterOptions.read);
    } else if (filterName === 'unread') {
      this.filterOptions.unread = !this.filterOptions.unread;
      this.modifyFilterCount(this.filterOptions.unread);
    } else {
      const course = this.filterOptions.courses.find((x) => x.courseCode === filterName);

      if (course) {
        course.selected = !course.selected;
        this.modifyFilterCount(course.selected);
      }
    }
  }

  private modifyFilterCount(increment: boolean) {
    if (increment) {
      this.filterOptions.filterCount++;
    } else {
      this.filterOptions.filterCount--;
    }
  }

  private clearFilters() {
    this.clearSelectedFilters();
    this.modalController.dismiss();
  }
}
