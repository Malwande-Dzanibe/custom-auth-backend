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
      from: `"Malwande Dzanibe" <malwandedza@outlook.com>`,
      to: user.email,
      subject: `Oppotunies are waiting for you`,
      text: `Your OTP is ${token.emailToken}, kindly note that this OTP expires in 10 minutes`,
      html: `<h1>Your OTP is ${token.emailToken}</h1> <p>kindly note that this OTP expires in 10 minutes</p>`,
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
