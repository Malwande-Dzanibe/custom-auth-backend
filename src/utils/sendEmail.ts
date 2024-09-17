import nodemailerTransporter from "./nodemailerTransporter";

let message: string;

const sendEmails = (
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmpassword: string;
  },
  token: {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    emailToken: string | null;
    isValid: boolean;
    type: string;
    expiration: Date;
  }
) => {
  nodemailerTransporter().sendMail(
    {
      from: `"Malwande" <malwandedza@outlook.com>`,
      to: user.email,
      subject: `Verification code from custom auth demo project`,
      text: `Your verification code is ${token.emailToken}, this verification code expires in 10 minutes`,
      html: `<h4 style={{ color: "red", fontSize: "12px", textAlign: "center" }}>Your verification code is ${token.emailToken}</h4> <p style={{ textAlign: "center" }}>This code exprires in 10 minutes</p>`,
    },
    (error: any, infor: any) => {
      if (error) {
        console.log(error);
        message = `${error}`;
      } else {
        console.log("email was successfully sent");
        message = "email was successfully sent";
      }
    }
  );
};

export { sendEmails, message };
