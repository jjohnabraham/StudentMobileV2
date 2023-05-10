import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'pec-degree-course-expander',
  templateUrl: './degree-course-expander.component.html',
  styleUrls: ['./degree-course-expander.component.scss'],
})
export class DegreeCourseExpanderComponent implements OnInit {
  @Input() header: string;
  @Input() content: string;
  @Input() icon: string;
  @Input() iconLabel: string;
  @Input() expandState = false;
  @Output() expandChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor() {}
  ngOnInit() {}

  toggleSection() {
    this.expandState = !this.expandState;
    this.expandChange.emit(this.expandState);
  }
}
