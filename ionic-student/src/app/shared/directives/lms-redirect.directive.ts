import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RedirectDirective } from './redirect.directive';

@Directive({
  selector: '[pecLmsRedirect]',
})
export class LmsRedirectDirective extends RedirectDirective implements OnChanges, OnInit {
  @Input() pecHash: string;
  @Input() pecUrl: string;

  public ngOnChanges(changes: SimpleChanges) {
    this.updateProps();
  }

  public ngOnInit() {
    this.updateProps();
  }

  private updateProps() {
    if (this.pecHash) {
      this.url = `{{lmsUrl}}redirectto?hash=${encodeURIComponent(this.pecHash)}&slt={{token}}&refApp=mobile`;
    } else if (this.pecUrl) {
      if (this.pecOpenIn === 'inapp' && this.pecUrl.indexOf('refApp=mobile') < 0) {
        this.url = `{{lmsUrl}}${this.pecUrl}${
          this.pecUrl && this.pecUrl.indexOf('?') < 0 ? '?' : '&'
        }refApp=mobile&slt={{token}}`;
      } else {
        this.url = `{{lmsUrl}}${this.pecUrl}${this.pecUrl && this.pecUrl.indexOf('?') < 0 ? '?' : '&'}slt={{token}}`;
      }
    }
  }
}
