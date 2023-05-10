import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Platform } from '@ionic/angular';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { BaseComponent } from '../base-component/base.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'pec-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.scss'],
})
export class FrameComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('iframe') iframe;
  @Output() loaded: EventEmitter<void> = new EventEmitter<void>();
  @Output() messageReceived: EventEmitter<any> = new EventEmitter<any>();
  @Input() url: string;
  @Input() ready: boolean;
  @Input() blankIframeURL = 'data:text/html;charset=utf-8,%3Chtml%3E%3Cbody%3Efoo%3C/body%3E%3C/html%3E';

  public sanitizedUrl: SafeResourceUrl;

  constructor(
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private globalConfigs: GlobalConfigsService
  ) {
    super();
    if (this.globalConfigs.isAndroid) {
      this.subscriptions.androidBack = this.globalConfigs.onAndroidBackPress.subscribe(() => {
        this.onAndroidBackPress();
      });
    }
  }

  @HostListener('window:message', ['$event'])
  private onMessage(event): void {
    this.messageReceived.emit(event.data);
  }

  public ngOnInit(): void {
    this.sanitizeUrl();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.url && changes.url.previousValue !== changes.url.currentValue) {
      this.sanitizeUrl();
    }
  }

  public ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  public onLoaded(): void {
    this.loaded.emit();
  }

  public postMessage(payload: { type: string }): void {
    if (this.iframe) {
      const fElm = this.iframe.nativeElement;

      if (fElm && fElm.contentWindow) {
        let frameDomain = '';
        try {
          frameDomain = fElm.contentWindow.location.hostname;
          if (fElm.contentWindow.location.href.substring(0, 5) === 'https') {
            frameDomain = 'https://' + frameDomain;
          } else frameDomain = 'http://' + frameDomain;
        } catch (err) {
          frameDomain = '*';
        }
        try {
          fElm.contentWindow.postMessage(payload, frameDomain);
        } catch (err) {}
      }
    }
  }
  private sanitizeUrl() {
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  private onAndroidBackPress(): void {
    this.postMessage({ type: 'back' });
  }
}
