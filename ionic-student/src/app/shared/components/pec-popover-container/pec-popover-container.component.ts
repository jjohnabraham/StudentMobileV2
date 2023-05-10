import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pec-popover-container',
  templateUrl: './pec-popover-container.component.html',
  styleUrls: ['./pec-popover-container.component.scss'],
})
export class PecPopoverContainerComponent {
  @Input() title: string;
  @Input() message: string;
  @Input() buttons: Array<{ label: string; href?: string; redirectUrl?: string; action?: () => void; class?: string }>;
  @Output() buttonClick = new EventEmitter<string>();
  @Output() closeClick = new EventEmitter<void>();

  constructor() {}
}
