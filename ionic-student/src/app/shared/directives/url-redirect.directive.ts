import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RedirectDirective } from './redirect.directive';

@Directive({
  selector: '[pecUrlRedirect]',
})
export class UrlRedirectDirective extends RedirectDirective implements OnChanges, OnInit {
  @Input() pecUrl: string;

  public ngOnChanges(changes: SimpleChanges) {
    this.updateProps();
  }

  public ngOnInit() {
    this.updateProps();
  }

  private updateProps() {
    this.url = (this.pecUrl || '').replace('access_token={ssotoken}', 'slt={{token}}');
  }
}
