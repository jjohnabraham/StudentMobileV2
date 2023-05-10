import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, Subject } from 'rxjs';
import { concatAll, first, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private cache: { [key: string]: StorageCache } = {};
  private readonly localStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
  }

  public getItem<T>(key: string): Observable<T> {
    let sc: StorageCache;
    const privateKey = this.buildKey(key);

    if (this.cache[privateKey]) {
      sc = this.cache[privateKey];

      if (sc.state > 0 || sc.value) {
        const ob = new Observable((observer) => {
          observer.next(sc.value);
          observer.complete();
        });

        return of(ob, sc.observable).pipe(concatAll());
      } else {
        return sc.observable;
      }
    }

    this.cache[privateKey] = sc = { key, state: 0 };

    sc.subject = new Subject<T>();
    sc.observable = sc.subject.asObservable().pipe(share());

    if (this.localStorage) {
      sc.value = null;

      try {
        sc.value = JSON.parse(this.localStorage.getItem(privateKey));
        sc.state = 1;
      } catch (ex) {}

      setTimeout(() => {
        sc.subject.next(sc.value);
      }, 1);
    } else {
      sc.state = 1;

      setTimeout(() => {
        sc.subject.next(sc.value);
      }, 1);
    }

    return sc.observable;
  }

  public getItemPromise<T>(key: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.getItem(key)
        .pipe(first())
        .subscribe(
          (value: T) => {
            resolve(value);
          },
          () => {
            reject();
          }
        );
    });
  }

  public setItem<T>(key: string, value: T, persist: boolean = true): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const privateKey = this.buildKey(key);

      if (!this.cache[privateKey]) {
        this.getItem(key);
      }

      const sc: StorageCache = this.cache[privateKey];
      sc.value = value;

      if (persist) {
        if (this.localStorage) {
          this.localStorage.setItem(privateKey, JSON.stringify(value));
          sc.subject.next(sc.value);

          setTimeout(() => {
            resolve(true);
          }, 1);
        }
      } else {
        sc.subject.next(sc.value);

        setTimeout(() => {
          resolve(true);
        }, 1);
      }
    });
  }

  public removeItem<T>(key: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const privateKey = this.buildKey(key);

      if (!this.cache[privateKey]) {
        this.getItem(key);
      }

      const sc: StorageCache = this.cache[privateKey];
      sc.value = null;

      if (this.localStorage && privateKey in this.localStorage) {
        this.localStorage.removeItem(privateKey);
      }

      sc.subject.next(sc.value);

      resolve(true);
    });
  }

  public removeAll() {
    for (const key in this.cache) {
      if (this.cache.hasOwnProperty(key)) {
        delete this.cache[key];
      }
    }

    if (this.localStorage) {
      this.localStorage.clear();
    }
  }

  private buildKey(key: string) {
    const baseUrl = environment.assetsUrl;
    const themeId = environment.themeId;

    return `${themeId || 0}-${baseUrl || 0}-${key}`;
  }
}

export interface StorageCache {
  key: string;
  value?: any;
  state: number;
  observable?: Observable<any>;
  subject?: Subject<any>;
}
