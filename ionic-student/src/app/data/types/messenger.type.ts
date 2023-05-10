import { CampusId } from '../../shared/enums/campus-id.enum';

export interface MessengerUser {
  SourceSystemId: number;
  SyStaffId: number;
  SyStudentId: number;
  SyCampusId: CampusId;
  StaffPortalUserName: string;
  FirstAccessDate: Date;
  Id: string;
  ApplicationId: string;
  AccessToken: string;
  NickName: string;
  ShowMessengerLink: boolean;
  HasContacts: boolean;
  PollForIndicator: boolean;
  AdvisorAlertEnabled: boolean;
  IsImpersonated: boolean;
  IsAdmin: boolean;
  IsActive: boolean;
  GaKey: string;
  SessionId: string;
  ReadReceiptEnabled: boolean;
}

export interface DeviceRegistrationResponse {
  IsSuccessStatusCode: boolean;
  ReasonPhrase: string;
}

export interface ChatUniqueContacts {
  ContactsBySendBirdChatUserId: { [key: string]: boolean };
}

export interface DeviceRegistrationDetails {
  SourceSystemId: number;
  SyStaffId: number;
  DeviceToken: string;
  DeviceId: string;
  ChannelId: string;
  RegistrationType: number;
  PlatFormType: number;
}

export interface UrbanAirshipRegistrationDetails {
  UrbanAirShipDeviceChannelId: string;
  UniqueDeviceId: string;
  DeviceMake: string;
  OptedInByArea: boolean;
}
