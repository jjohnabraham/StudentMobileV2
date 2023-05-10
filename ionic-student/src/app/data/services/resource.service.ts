import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { concatAll, first, share } from 'rxjs/operators';
import { PecHttpService } from '../../shared/services/pec-http.service';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  public labels: { [key: string]: string };
  public configs: { [key: string]: string };

  private labelsTimeout = 0;
  private labelsLoading: { [key: string]: number } = {};
  private _labels: { [key: string]: string } = {};
  private labelsObserve: { [key: string]: ObservableEntry } = {};
  private configsTimeout = 0;
  private configsLoading: { [key: string]: number } = {};
  private _configs: { [key: string]: string } = {};
  private configsObserve: { [key: string]: ObservableEntry } = {};

  constructor(private http: PecHttpService) {
    this.labels = new window.Proxy(this._labels, {
      get: function (target, name) {
        if (!(name in this._labels) && !(name in this.labelsLoading)) {
          this.queueLabel(name);
        }

        return this._labels[name];
      }.bind(this),
      set: ((target, name, value) => {}).bind(this),
    });

    this.configs = new window.Proxy(this._configs, {
      get: function (target, name) {
        if (!(name in this._configs) && !(name in this.configsLoading)) {
          this.queueConfig(name);
        }

        return this._configs[name];
      }.bind(this),
      set: ((target, name, value) => {}).bind(this),
    });
  }

  public getLabel(name: string) {
    this.queueLabel(name);

    if (!this.labelsObserve[name]) {
      this.labelsObserve[name] = {
        sub: new Subject<string>(),
        obs: new Observable<string>(),
      };

      this.labelsObserve[name].obs = this.labelsObserve[name].sub.pipe(share());
    }

    if (name in this._labels && !(name in this.labelsLoading)) {
      const ob = new Observable<string>((observer) => {
        observer.next(this._labels[name]);
        observer.complete();
      });

      return of(ob, this.labelsObserve[name].obs).pipe(concatAll());
    }

    return this.labelsObserve[name].obs;
  }

  public getConfig(name: string) {
    this.queueConfig(name);

    if (!this.configsObserve[name]) {
      this.configsObserve[name] = {
        sub: new Subject<string>(),
        obs: new Observable<string>(),
      };

      this.configsObserve[name].obs = this.configsObserve[name].sub.pipe(share());
    }

    if (name in this._configs && !(name in this.configsLoading)) {
      const ob = new Observable<string>((observer) => {
        observer.next(this._configs[name]);
        observer.complete();
      });

      return of(ob, this.configsObserve[name].obs).pipe(concatAll());
    }

    return this.configsObserve[name].obs;
  }

  private queueConfig(name) {
    if (!this.configsLoading[name]) {
      if (this.configsTimeout) {
        clearTimeout(this.configsTimeout);
      }

      this.configsTimeout = window.setTimeout(this.getConfigsFromApi.bind(this), 30);
      this.configsLoading[name] = 1;
      this._configs[name] = '';
    }
  }

  private getConfigsFromApi() {
    const configLoading = {};
    let contentKey = '';

    for (const name in this.configsLoading) {
      if (configLoading.hasOwnProperty(name) && this.configsLoading[name] === 1) {
        this.configsLoading[name] = 2;
        configLoading[name] = 1;

        if (contentKey) {
          contentKey += ',' + name;
        } else {
          contentKey += name;
        }
      }
    }

    this.http
      .request({
        url: `api/resource/config?configKey=${encodeURIComponent(contentKey)}`,
        signature: 'api/resource/config?configKey=${encodeURIComponent(contentKey)}',
        method: 'Get',
        config: {
          cache: true,
        },
      })
      .pipe(first())
      .subscribe(
        (configs: { [key: string]: string }) => {
          for (const name in configLoading) {
            if (configLoading.hasOwnProperty(name)) {
              this._configs[name] = configs[name];
              delete this.configsLoading[name];
              if (this.configsObserve[name]) {
                this.configsObserve[name].sub.next(this._configs[name]);
              }
            }
          }
        },
        () => {
          setTimeout(() => {
            for (const name in configLoading) {
              if (configLoading.hasOwnProperty(name)) {
                delete this.configsLoading[name];
              }
            }
          }, 10000);
        }
      );
  }

  private queueLabel(name) {
    if (!this.labelsLoading[name]) {
      if (this.labelsTimeout) {
        clearTimeout(this.labelsTimeout);
      }

      this.labelsTimeout = window.setTimeout(this.getLabelsFromApi.bind(this), 30);
      this.labelsLoading[name] = 1;
      this._labels[name] = '';
    }
  }

  private getLabelsFromApi() {
    const labelLoading = {};
    let contentKey = '';

    for (const name in this.labelsLoading) {
      if (this.labelsLoading[name] === 1) {
        this.labelsLoading[name] = 2;
        labelLoading[name] = 1;

        if (contentKey) {
          contentKey += ',' + name;
        } else {
          contentKey += name;
        }
      }
    }

    this.http
      .request({
        url: `api/resource/label?contentKey=${encodeURIComponent(contentKey)}`,
        signature: 'api/resource/label?contentKey=${encodeURIComponent(contentKey)}',
        method: 'Get',
        config: {
          cache: true,
        },
      })
      .pipe(first())
      .subscribe(
        (labels: { [key: string]: string }) => {
          for (const name in labelLoading) {
            if (labelLoading.hasOwnProperty(name)) {
              this._labels[name] = labels && labels[name] ? labels[name] : '';
              delete this.labelsLoading[name];

              if (this.labelsObserve[name]) {
                this.labelsObserve[name].sub.next(this._labels[name]);
              }
            }
          }
        },
        () => {
          setTimeout(() => {
            for (const name in labelLoading) {
              if (labelLoading.hasOwnProperty(name)) {
                delete this.labelsLoading[name];
              }
            }
          }, 10000);
        }
      );
  }
}

interface ObservableEntry {
  sub: Subject<string>;
  obs: Observable<string>;
}
