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
  /** Channel that delivered the code being verified: 1 = SMS, 2 = Email (backend OtpChannel). */
  Channel?: OtpDeliveryChannel;
}

/** Backend OtpChannel values. */
export const OTP_CHANNEL = { SMS: 1, EMAIL: 2 } as const;
export type OtpDeliveryChannel = (typeof OTP_CHANNEL)[keyof typeof OTP_CHANNEL];

export interface RegisterMemberRequest {
  image?: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  referralBy: string;
  imageByte: string; //Actually is base64
  EmailSubcribe: string; //default 'true'
  /** Proof from VerifyRegisterOtp, required by MemberRegister; reused unchanged when retrying. */
  registrationProof?: string;
}
