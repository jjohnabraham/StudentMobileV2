import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[pecImagePreload]',
})
export class ImagePreloadDirective {
  @Input() src: string;
  @Input() pecImagePreload: string;
  @HostBinding('class') className;

  @HostListener('error') updateUrl() {
    this.src = this.pecImagePreload;
  }

  @HostListener('load') load() {
    this.className = 'image-loaded';
  }
}
