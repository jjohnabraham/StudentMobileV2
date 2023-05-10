import { ThemeId } from 'src/app/shared/enums/theme-id.enum';
import { CampusId } from '../../shared/enums/campus-id.enum';

export interface MobileSettings {
  IosSettings: IosSettings;
  AndroidSettings: AndroidSettings;
  CampusSettings: CampusSetting[];
}

export interface CampusSetting {
  Campus: Campus;
  Settings: Settings;
}

export interface Campus {
  SourceSystemId: number;
  CampusId: CampusId;
  Code: string;
  Name: string;
  Description: string;
  ThemeId: ThemeId;
  TimeZone: string;
  GaTrackingId: string;
  PointziSettings: PointziSettings;
}

export interface PointziSettings {
  AppKey: string;
  EventKey: string;
}

export interface Settings {
  AiuMemberMessage: string;
  'Refer a friend': string;
  FAQ: string;
  'How-To': string;
  'Feedback e-mail address': string;
  Help: string;
  'Request Info': string;
  'Returning Students': string;
  Alumni: string;
  'Forgot Username': string;
  'Forgot Password': string;
  MinDegreePercent: number;
  'Email Setup Instructions': string;
  HideStartingSchoolCard?: boolean;
  UsePuffinDiscussionBoard: boolean;
  UsePuffinIntellipath: boolean;
  'App-User-Guide': string;
  Library: string;
  MoreAssistance: MoreAssistance[];
  LmsUrl: string;
  FacultyGreetingsMessage: null;
  FacultyAppLink: string;
  MessengerUrl: string;
  MP4DelayMessage: string;
  ArchivedChatDelayMessage: string;
  AlternateClassViewIcon: string;
  ShowPointzi: string;
  EbookMessage: string;
  ShowOnboarding: string;
  GetSetLink: string;
  ShowFastTrackScheduling: string;
  CtuStoreUrl: string;
  CtuStoreConfig: string;
  OfficialSchoolName: string;
  ShowNickName: string;
  ShowGradFile: string;
  Campus: string;
  Profile: string;
  DiscussionBoardNotAvailable: string;
  IsChameleonEnabled: string;
}

export interface MoreAssistance {
  title: string;
  openin: string;
  url: string;
}

export interface IosSettings {
  PlatformName: string;
  MinVersion: string;
  AppTimeout: number;
  EmailOffice365Url: string;
  WithoutTouchId: string[];
  WithoutFaceId: string[];
  FacultyAppUrl: string;
  StudentAppUrl: string;
}

export interface AndroidSettings {
  PlatformName: string;
  MinVersion: string;
  AppTimeout: number;
  EmailOffice365Url: string;
  FacultyAppUrl: string;
  StudentAppUrl: string;
}

export interface SltToken {
  SLT: string;
  SSID: number;
  SyCampusId: CampusId;
}
