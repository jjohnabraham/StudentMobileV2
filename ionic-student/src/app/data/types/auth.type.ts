import { AuthType } from 'src/app/shared/enums/auth-type.enum';
import { CampusId } from 'src/app/shared/enums/campus-id.enum';

export interface LoginResponse {
  SuccessfulLogin: boolean;
  IsPasswordResetRequired: boolean;
  AuthCookie: string;
  SupportedApp: boolean;
  AccessStatus: string;
  RegistrationToken: string;
  RedirectUrl: string;
  FirstName: string;
  LastName: string;
}

export class SecondaryAuthStorageObject {
  CampusId: CampusId;
  SourceSystemId: number;
  SyStaffId: number;
  AuthType: AuthType;
  AuthToken: string;
  UserName = '';
  Disabled = false;
}

export class RegisterSecAuthObject {
  DeviceSpecificId: string;
  AppSpecificId: string;
  AuthToken: string;
  AuthType: AuthType;
  UserName = '';
}

export class LoginObject {
  CampusId: CampusId = 0;
  SourceSystemId = 0;
  Password = '';
  RememberMe = false;
  UserName = '';
  ApplicationType: number;
  DeviceSpecificId: string;
}

class ThemeId {}

export class SecondaryAuthLoginObject {
  CampusId: CampusId;
  SourceSystemId: number;
  AppSpecificId: string;
  DeviceSpecificId: string;
  AuthType: AuthType;
  AuthToken: string;
  SessionId: string;
  ApplicationType = 2;
  ThemeId: ThemeId;
  UserName = '';
}

export class UserStorageObject {
  UserName = '';
  UserIdExternal = '';
}
