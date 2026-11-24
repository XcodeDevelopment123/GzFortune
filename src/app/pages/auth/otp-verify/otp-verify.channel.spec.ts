import { of, throwError } from 'rxjs';
import { OtpVerifyPage } from './otp-verify.page';
import { OTP_CHANNEL } from 'src/app/core/repo/request/auth-request.model';

/**
 * The login code must be verified with the channel that delivered it: SMS first, Email after a successful
 * e-mail resend, SMS again after a successful SMS resend; a failed resend keeps the current channel.
 * The page's resend/verify handlers are exercised directly with stubbed collaborators.
 */
describe('OtpVerifyPage OTP channel tracking', () => {
  let page: any;
  let verifyCalls: any[];
  let emailResend: () => any;
  let smsResend: () => any;

  beforeEach(() => {
    verifyCalls = [];
    emailResend = () => of({ PhoneNumber: '+60123456789' });
    smsResend = () => of({ PhoneNumber: '+60123456789' });

    page = Object.create(OtpVerifyPage.prototype);
    Object.assign(page, {
      otpChannel: OTP_CHANNEL.SMS,
      verifyType: 'login-phone',
      otpCode: '123456',
      verifyOtpRes: { PhoneNumber: '+60123456789', DeviceId: 'test-device' },
      loadingHelper: { show: () => {}, hide: () => {} },
      toastHelper: { presentSuccessToast: () => {}, presentFailedToast: () => {} },
      updateOtpDigits: () => {},
      startSmsResendCooldown: () => {},
      startEmailResendCooldown: () => {},
      authApiService: {
        requestLoginOTP: () => smsResend(),
        requestRegisterOtpSms: () => smsResend(),
        ResendOtpWithEmail: () => emailResend(),
        // A pending (never-completing) result is enough to capture the request.
        verifyLoginOtp: (req: any) => {
          verifyCalls.push(req);
          return throwError(() => ({ status: 400, error: 'Invalid OTP.' }));
        },
      },
    });
  });

  const verify = () => page.handleLoginByPhone();
  const lastChannel = () => verifyCalls[verifyCalls.length - 1].Channel;

  it('starts with SMS for the initial phone login', () => {
    verify();
    expect(lastChannel()).toBe(OTP_CHANNEL.SMS);
  });

  it('follows SMS -> Email -> SMS across successful resends', () => {
    page.handleResendOtpByEmail();
    verify();
    expect(lastChannel()).toBe(OTP_CHANNEL.EMAIL);

    page.handleResendOtpByPhone();
    verify();
    expect(lastChannel()).toBe(OTP_CHANNEL.SMS);

    page.handleResendOtpByEmail();
    page.handleVerifyThenShowPassword(); // forgot-password verification uses the same channel
    expect(lastChannel()).toBe(OTP_CHANNEL.EMAIL);
  });

  it('a failed resend leaves the current channel unchanged', () => {
    emailResend = () => throwError(() => ({ status: 429, error: 'Too many requests' }));
    page.handleResendOtpByEmail();
    verify();
    expect(lastChannel()).toBe(OTP_CHANNEL.SMS);

    emailResend = () => of({ PhoneNumber: '+60123456789' });
    page.handleResendOtpByEmail();
    smsResend = () => throwError(() => ({ status: 503, error: 'SMS unavailable' }));
    page.handleResendOtpByPhone();
    verify();
    expect(lastChannel()).toBe(OTP_CHANNEL.EMAIL);
  });

  it('sends the phone, code and channel to VerifyLoginOtp', () => {
    verify();
    expect(verifyCalls[0]).toEqual(
      jasmine.objectContaining({ PhoneNumber: '+60123456789', otp: '123456', Channel: OTP_CHANNEL.SMS }),
    );
  });
});
