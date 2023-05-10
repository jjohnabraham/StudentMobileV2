import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: 'ion-textarea[pecAutoresize]',
})
export class AutoresizeTextareaDirective implements OnInit {
  constructor(public element: ElementRef) {}

  @HostListener('input', ['$event.target'])
  onInput(): void {
    this.resize();
  }

  public ngOnInit(): void {
    setTimeout(() => this.resize(), 250);
  }

  public ngModelChange() {
    this.resize();
  }

  private resize(): void {
    const element = this.element.nativeElement.getElementsByTagName('textarea')[0];
    const scrollHeight = element.scrollHeight;

    element.style.height = scrollHeight + 'px';
    this.element.nativeElement.style.height = scrollHeight + 16 + 'px';
  }
}
