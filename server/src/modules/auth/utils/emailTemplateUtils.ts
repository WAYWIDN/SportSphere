export const getRegisterMailTemplate = (otp: string): string => {
  return `
    <div style="
      margin: 0;
      padding: 40px 20px;
      background-color: #f7f6f3;
      font-family: Arial, Helvetica, sans-serif;
      color: #111111;
    ">
      <div style="
        max-width: 560px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #e2e1de;
        border-radius: 20px;
        overflow: hidden;
      ">

        <!-- Header -->
        <div style="
          padding: 28px 32px;
          border-bottom: 1px solid #e8e7e4;
        ">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="
                font-size: 18px;
                font-weight: 700;
                color: #111111;
              ">
                <span style="
                  display: inline-block;
                  margin-right: 9px;
                  font-size: 15px;
                ">↯</span>
                sportsphere
              </td>
            </tr>
          </table>
        </div>

        <!-- Content -->
        <div style="padding: 42px 36px 38px;">

          <p style="
            margin: 0 0 12px;
            color: #888888;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
          ">
            Welcome to SportSphere
          </p>

          <h1 style="
            margin: 0 0 18px;
            color: #111111;
            font-size: 32px;
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -1px;
          ">
            Verify your email.
          </h1>

          <p style="
            margin: 0;
            color: #666666;
            font-size: 15px;
            line-height: 1.7;
          ">
            You're one step away from joining the SportSphere community.
            Use the verification code below to activate your account.
          </p>

          <!-- OTP Card -->
          <div style="
            margin: 32px 0;
            padding: 30px 20px;
            background-color: #151718;
            border-radius: 14px;
            text-align: center;
          ">

            <p style="
              margin: 0 0 16px;
              color: #8d8f90;
              font-size: 11px;
              letter-spacing: 2px;
              text-transform: uppercase;
            ">
              Verification code
            </p>

            <div style="
              color: #ffffff;
              font-size: 24px;
              line-height: 1;
              font-weight: 700;
              letter-spacing: 8px;
            ">
              ${otp}
            </div>

          </div>

          <p style="
            margin: 0;
            color: #888888;
            font-size: 13px;
            line-height: 1.6;
          ">
            This code expires in
            <strong style="color: #111111;">10 minutes</strong>.
          </p>

          <div style="
            margin-top: 30px;
            padding-top: 24px;
            border-top: 1px solid #e8e7e4;
          ">
            <p style="
              margin: 0;
              color: #999999;
              font-size: 12px;
              line-height: 1.6;
            ">
              If you didn't request this verification, you can safely
              ignore this email.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="
          padding: 22px 32px;
          background-color: #f3f2ef;
          border-top: 1px solid #e8e7e4;
        ">
          <p style="
            margin: 0;
            color: #999999;
            font-size: 11px;
            line-height: 1.6;
            text-align: center;
          ">
            © ${new Date().getFullYear()} SportSphere
          </p>
        </div>

      </div>
    </div>
  `;
};


export const getResetPasswordMailTemplate = (otp: string): string => {
  return `
    <div style="
      margin: 0;
      padding: 40px 20px;
      background-color: #f7f6f3;
      font-family: Arial, Helvetica, sans-serif;
      color: #111111;
    ">
      <div style="
        max-width: 560px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #e2e1de;
        border-radius: 20px;
        overflow: hidden;
      ">

        <!-- Header -->
        <div style="
          padding: 28px 32px;
          border-bottom: 1px solid #e8e7e4;
        ">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="
                font-size: 18px;
                font-weight: 700;
                color: #111111;
              ">
                <span style="
                  display: inline-block;
                  margin-right: 9px;
                  font-size: 15px;
                ">↯</span>
                sportsphere
              </td>
            </tr>
          </table>
        </div>

        <!-- Content -->
        <div style="padding: 42px 36px 38px;">

          <p style="
            margin: 0 0 12px;
            color: #888888;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
          ">
            Account security
          </p>

          <h1 style="
            margin: 0 0 18px;
            color: #111111;
            font-size: 32px;
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -1px;
          ">
            Reset your password.
          </h1>

          <p style="
            margin: 0;
            color: #666666;
            font-size: 15px;
            line-height: 1.7;
          ">
            We received a request to reset your SportSphere password.
            Use the code below to continue.
          </p>

          <!-- OTP Card -->
          <div style="
            margin: 32px 0;
            padding: 30px 20px;
            background-color: #151718;
            border-radius: 14px;
            text-align: center;
          ">

            <p style="
              margin: 0 0 16px;
              color: #8d8f90;
              font-size: 11px;
              letter-spacing: 2px;
              text-transform: uppercase;
            ">
              Password reset code
            </p>

            <div style="
              color: #ffffff;
              font-size: 24px;
              line-height: 1;
              font-weight: 700;
              letter-spacing: 8px;
            ">
              ${otp}
            </div>

          </div>

          <p style="
            margin: 0;
            color: #888888;
            font-size: 13px;
            line-height: 1.6;
          ">
            This code expires in
            <strong style="color: #111111;">10 minutes</strong>.
          </p>

          <div style="
            margin-top: 30px;
            padding-top: 24px;
            border-top: 1px solid #e8e7e4;
          ">
            <p style="
              margin: 0;
              color: #999999;
              font-size: 12px;
              line-height: 1.6;
            ">
              If you didn't request a password reset, you can safely
              ignore this email. Your password will remain unchanged.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="
          padding: 22px 32px;
          background-color: #f3f2ef;
          border-top: 1px solid #e8e7e4;
        ">
          <p style="
            margin: 0;
            color: #999999;
            font-size: 11px;
            line-height: 1.6;
            text-align: center;
          ">
            © ${new Date().getFullYear()} SportSphere
          </p>
        </div>

      </div>
    </div>
  `;
};