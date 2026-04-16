export interface AuthTokenResponse {
  SuccessToken: string;
  TokenMinutes: string;
  TokenRoles: string;
}

//API Response its Pascal Case
export interface RequestOTPResponse {
  PhoneNumber: string;
  DeviceId?: string;
  AccountStatus?: string;

  // 新后端字段（大小写都兼容一下）
  Message?: string;
  Destination?: string;
  destination?: string;
  TtlSeconds?: number;
  ttlSeconds?: number;

  // 开发环境可能会带，生产不依赖它
  OTP?: string;
  otp?: string;
}

export interface ResetPasswordOtpSessionData {
  otpData: RequestOTPResponse;
  phoneNumber: string;
  newPassword: string;
}

// Register flow: store OTP response + the pending register request
export interface RegisterOtpSessionData {
  otpData: RequestOTPResponse;
  registerRequest: any;
}
