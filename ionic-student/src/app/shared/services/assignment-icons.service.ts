import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AssignmentIconsService {
  public getIcon(assignmentTypeId: number, hasInClassAssessmentFeature: boolean): AssignmentIcon {
    let iconName: string;
    let eventLabel: string;
    if (hasInClassAssessmentFeature) {
      iconName = 'assessment';
      eventLabel = 'Assessment';
    } else {
      switch (assignmentTypeId) {
        case 2:
          iconName = 'individual_project';
          eventLabel = 'Individual Project';
          break;
        case 3:
          iconName = 'group_project';
          eventLabel = 'Group Project';
          break;
        case 4:
          iconName = 'discussion_board';
          eventLabel = 'Discussion Board';
          break;
        case 6:
          iconName = 'live_chat_assignment';
          eventLabel = 'Live Chat';
          break;
        case 5:
        case 7:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 18:
        case 20:
          iconName = 'assessment';
          eventLabel = 'Assessment';
          break;
        case 14:
          iconName = 'intellipath';
          eventLabel = 'IntelliPath';
          break;
        case 15:
          iconName = 'reading_assignment';
          eventLabel = 'Reading';
          break;
        case 16:
          iconName = 'participation';
          eventLabel = 'Participation';
          break;
        case 19:
          iconName = 'simulation';
          eventLabel = 'Simulation';
          break;
        case 21:
          iconName = 'lab';
          eventLabel = 'Lab';
          break;
        default:
          iconName = 'other';
          eventLabel = 'Other';
      }
    }
    return { eventLabel, iconName };
  }
}

export interface AssignmentIcon {
  eventLabel: string;
  iconName: string;
}
