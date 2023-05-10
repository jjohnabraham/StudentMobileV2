import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { GlobalConfigsService } from './global-configs.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, concatAll, map, share } from 'rxjs/operators';
import { TrackingService } from './tracking.service';

@Injectable({
  providedIn: 'root',
})
export class PecHttpService {
  public useHeaders = true;
  public onAnySuccess: Observable<Date>;
  public onUnauthorized: Observable<boolean>;

  private readonly authHeadersKey = 'authHeaders';
  private unauthorizedEvent: Subject<boolean> = new Subject<boolean>();
  private successEvent: Subject<Date> = new Subject<Date>();
  private authHeaders: { [key: string]: string };
  private cache: { [key: string]: HttpCache } = {};
  private cacheGlobal: { [key: string]: HttpCache } = {};
  private lastSuccess: Date;

  constructor(
    private http: HttpClient,
    private globalConfigs: GlobalConfigsService,
    private trackingService: TrackingService
  ) {
    this.onUnauthorized = this.unauthorizedEvent.asObservable();
    this.onAnySuccess = this.successEvent.asObservable();
  }

  request(request: PecRequest): Observable<any> {
    let resultObs: Observable<any>;
    let resultSub: Subject<any>;
    let requestObs: Observable<any>;
    let requestScr: Subscription;

    let cache = this.cache;

    if (request.config && request.config.global) {
      cache = this.cacheGlobal;
    }

    if (request.config) {
      if (request.config.cache && !request.config.cacheDuration) {
        request.config.cacheDuration = 300000;
      }

      if (
        request.config.cacheKeys &&
        (request.method === 'Post' || request.method === 'Put' || request.method === 'Delete')
      ) {
        const cacheKeys = request.config.cacheKeys;

        if (cache) {
          for (const prop in cache) {
            if (cache.hasOwnProperty(prop)) {
              const o = cache[prop];

              if (o.cacheKeys) {
                const ck = o.cacheKeys.filter((n) => cacheKeys.indexOf(n) !== -1);

                if (ck && ck.length) {
                  delete cache[prop];
                }
              }
            }
          }
        }
      }
    }

    const key =
      request.method === 'Get' && (!request.config || request.config.cache)
        ? JSON.stringify({
            url: request.url,
            method: request.method,
            body: request.body,
            cacheKeys: request.config && request.config.cacheKeys ? request.config.cacheKeys : null,
            global: !!(request.config && request.config.global),
          })
        : null;

    if (key) {
      cache[key] = cache[key] || { key, state: 0, data: false };

      if (cache[key].observable) {
        resultSub = cache[key].subject;
        requestObs = cache[key].request;
        requestScr = cache[key].subscription;

        if (cache[key].data || cache[key].state > 0) {
          const ob = new Observable((observer) => {
            observer.next(cache[key].data);
            observer.complete();
          });

          resultObs = of(ob, cache[key].observable).pipe(concatAll());
        } else {
          resultObs = cache[key].observable;
        }

        if (
          !request.config.refresh &&
          (cache[key].state === 0 ||
            (request.config.cache &&
              cache[key].state > 0 &&
              cache[key].lastRun &&
              cache[key].lastRun + request.config.cacheDuration > new Date().getTime()))
        ) {
          if (cache[key].state !== 0) {
            this.lastSuccess = new Date();
            if (!request.config.ignoreTimeoutReset) {
              this.successEvent.next(this.lastSuccess);
            }
          }

          return resultObs;
        }
      }

      cache[key].state = 0;
    }

    if (!resultSub) {
      resultSub = new Subject<any>();
      resultObs = resultSub.asObservable().pipe(share());
    }

    if (!requestObs) {
      // NOTE: in newer Angular version HttpHeaders is an immutable object, you can't modify it
      // https://angular.io/api/common/http/HttpHeaders
      let oh: HttpHeaders;

      if (request.bearer) {
        oh = new HttpHeaders({ Authorization: request.bearer });
      }

      if (!this.authHeaders && this.useHeaders) {
        if (window.sessionStorage) {
          const ohs = window.sessionStorage.getItem(this.authHeadersKey);

          if (ohs) {
            this.authHeaders = JSON.parse(ohs);
          }
        }

        if (!this.authHeaders) {
          this.authHeaders = { useheadersforauth: 'true' };
        }
      }

      if (!oh) {
        oh = new HttpHeaders(this.authHeaders);
      }

      if (request.contentType) {
        oh = oh.set('Content-Type', request.contentType);
      } else if (request.requestType === RequestType.Blob || request.requestType === RequestType.Image) {
      } else {
        oh = oh.set('Content-Type', 'application/json');
      }

      let urlPrefix = this.globalConfigs.apiUrl;

      if (request.apiSource === 1) {
        urlPrefix = this.globalConfigs.messengerApiUrl;
      } else if (request.apiSource === 3) {
        urlPrefix = '';
      }

      let responseType;
      if (request.requestType === RequestType.Blob || request.requestType === RequestType.Image) {
        responseType = 'blob';
      } else {
        responseType = 'json';
      }

      const start: number = new Date().getTime();

      requestObs = this.http
        .request(request.method, urlPrefix + request.url, {
          body: request.body,
          withCredentials: !this.useHeaders,
          headers: oh,
          responseType,
          observe: 'response',
        })
        .pipe(
          map((res: HttpResponse<any>) => {
            if (res.headers) {
              res.headers.keys().forEach((headerKey: string) => {
                const values = res.headers.getAll(headerKey);

                if (headerKey) {
                  if (
                    (headerKey.toLowerCase().indexOf('lmsauth-') === 0 ||
                      headerKey.toLowerCase().indexOf('authorization') === 0) &&
                    values &&
                    values.length
                  ) {
                    const value = values[values.length - 1];

                    if (headerKey.toLowerCase().indexOf('authorization') === 0) {
                      headerKey = 'Authorization';
                    }

                    this.authHeaders[headerKey] = value;

                    if (window.sessionStorage) {
                      window.sessionStorage.setItem(this.authHeadersKey, JSON.stringify(this.authHeaders));
                    }
                  }
                }
              });
            }

            const end: number = new Date().getTime();

            const o = this.extractData(
              res,
              cache,
              key,
              request.requestType,
              request.config ? request.config.ignoreTimeoutReset : null
            );

            resultSub.next(o);

            if (requestScr) requestScr.unsubscribe();

            if (key) {
              delete cache[key].subscription;
              delete cache[key].request;
            }

            if (request.signature) {
              this.trackingService.trackTiming({
                category: `CEC API - ${res.status}`,
                var: `(${res.status}) - (${request.method}) - ${request.signature}`,
                value: end - start,
              });
            }

            return o;
          }),
          catchError((res: Response) => {
            const end: number = new Date().getTime();

            const o = this.handleError(res, cache, key, request);

            if (o.data) {
              resultSub.next(o.data);
            } else {
              resultSub.error(o);

              if (key) {
                delete cache[key].subject;
                delete cache[key].observable;
              }
            }

            if (requestScr) requestScr.unsubscribe();

            if (key) {
              delete cache[key].subscription;
              delete cache[key].request;
            }

            if (request.signature) {
              this.trackingService.trackTiming({
                category: `CEC API - ${res.status}`,
                var: `(${res.status}) - (${request.method}) - ${request.signature}`,
                value: end - start,
              });
            }

            return resultObs;
          })
        );

      requestScr = requestObs.subscribe();
    }

    if (key) {
      cache[key].cacheKeys = request.config && request.config.cacheKeys ? request.config.cacheKeys : undefined;
      cache[key].subject = resultSub;
      cache[key].request = requestObs;
      cache[key].observable = resultObs;
      cache[key].subscription = requestScr;
    }

    return resultObs;
  }

  get(url: string) {
    return this.request({ url, method: 'Get', config: { cache: true, cacheDuration: 300000 } });
  }

  put(url: string, body?: any) {
    return this.request({ url, method: 'Put', body });
  }

  post(url: string, body?: any) {
    return this.request({ url, method: 'Post', body });
  }

  delete(url: string, body?: any) {
    return this.request({ url, method: 'Delete', body });
  }

  clearCache() {
    for (const key in this.cache) {
      if (this.cache.hasOwnProperty(key)) {
        delete this.cache[key];
      }
    }
  }

  clearHeaders() {
    if (this.authHeaders) {
      delete this.authHeaders;
    }

    if (window.sessionStorage) {
      window.sessionStorage.removeItem(this.authHeadersKey);
    }
  }

  private extractData(
    res: HttpResponse<any>,
    cache: { [p: string]: HttpCache },
    key: string,
    requestType: RequestType,
    ignoreTimeoutReset?: boolean
  ) {
    if (res && res.ok) {
      let body;

      if (requestType === RequestType.Blob || requestType === RequestType.Image) {
        const blob = res.body;

        if (requestType === RequestType.Image) {
          const urlCreator = window.URL || window.webkitURL;

          if (urlCreator && urlCreator.createObjectURL) {
          }

          body = { Success: true, Data: urlCreator.createObjectURL(blob) };
        } else {
          body = { Success: true, Data: blob };
        }
      } else {
        body = res.body;
      }

      if (body && body.Success) {
        if (key && cache[key]) {
          cache[key].lastRun = new Date().getTime();
          cache[key].state = 1;
          cache[key].data = body.Data;
        }

        this.lastSuccess = new Date();
        if (!ignoreTimeoutReset) {
          this.successEvent.next(this.lastSuccess);
        }

        return body.Data;
      }
    }

    throw res;
  }

  private handleError(res: Response, cache: { [key: string]: HttpCache }, key: string, request: PecRequest) {
    let body;
    let err: string;
    const ret = {
      request: request.url,
      response: res,
      status: 0,
      statusText: '',
      message: 'Error processing API',
      data: false,
    };

    if (res) {
      if (request.apiSource !== 1 && (res.status === 401 || res.status === 403)) {
        if (!request.bearer) {
          this.unauthorizedEvent.next(true);
        }
        err = 'unauthorized';
      } else {
        try {
          body = res.json();
          if (body) {
            if (!this.globalConfigs.isCordova) {
              if (
                request.apiSource !== 1 &&
                res.status <= 0 &&
                body.hasOwnProperty('isTrusted') &&
                body.isTrusted &&
                window.navigator &&
                window.navigator.onLine
              ) {
                if (!request.bearer) {
                  this.unauthorizedEvent.next(true);
                }

                err = 'unauthorized';
              }
            }

            if (body.error) {
              err = body.error;
            } else if (body.Data) {
              if (body.Data.message) {
                err = body.Data.message;
              } else {
                err = body.Data;
              }
            }
          }
        } catch (ex) {}
      }

      ret.status = res.status;
      ret.statusText = res.statusText;
      ret.message = err || 'Error processing API';
    }

    if (key && cache[key]) {
      cache[key].state = -1;

      if (cache[key].data) {
        ret.data = cache[key].data;
      }
    }

    return ret;
  }
}

export enum RequestType {
  Default = 0,
  Blob = 1,
  Image = 2,
}

export interface CecRequestConfig {
  cache: boolean;
  cacheDuration?: number;
  cacheKeys?: Array<string>;
  global?: boolean;
  refresh?: boolean;
  ignoreTimeoutReset?: boolean; //if this is true, the request will not reset the timeout timer which is used to log users out for inactivity
}

export interface PecRequest {
  url: string;
  method: string;
  apiSource?: number;
  body?: any;
  signature?: string;
  config?: CecRequestConfig;
  cacheKeys?: string[];
  requestType?: RequestType;
  contentType?: string;
  bearer?: string;
}

export interface HttpCache {
  data: any;
  key: string;
  state: number;
  cacheKeys?: string[];
  lastRun?: number;
  observable?: Observable<any>;
  request?: Observable<any>;
  subject?: Subject<any>;
  subscription?: Subscription;
}
