import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, CanLoad, Router, RouterStateSnapshot } from '@angular/router';
import { DiscussionBoardPage } from 'src/app/pages/home/components/discussion-board/discussion-board.page';
import { AuthService } from '../../../data/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DiscussionBoardGuard implements CanDeactivate<DiscussionBoardPage> {
  constructor() {}
  //https://stackoverflow.com/questions/64270332/navigation-issue-with-candeactivate-guard-in-ionic-5
  public canDeactivate(
    component: DiscussionBoardPage,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Promise<boolean> {
    return component.canPageLeave();
  }
}
