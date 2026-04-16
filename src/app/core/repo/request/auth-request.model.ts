export interface LoginByEmailPasswordRequest {
  email: string;
  password: string;
}

export interface LoginByPhoneOtpRequest {
  phone: string;
  otp: string;
  firstLogin: boolean;
  deviceId: string;
  accountStatus: string;
}

export interface PhoneRequestOTP {
  phoneNumber: string;
  deviceId: string;
  Channel : number; // 1: SMS, 2: Email
}

export interface VerifyEmailOtpRequest {
  PhoneNumber: string;
  otp: string;
  deviceId: string;
}

export interface RegisterMemberRequest {
  image?: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  password: string;
  referralBy: string;
  imageByte: string; //Actually is base64
  EmailSubcribe: string; //default 'true'
}
