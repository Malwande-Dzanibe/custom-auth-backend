import nodemailer from "nodemailer";
import { google } from "googleapis";

let message: string;

const sendEmails = async (
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
  const oAuth2Client = new google.auth.OAuth2(
    `${process.env.CLIENT_ID}`,
    `${process.env.CLIENT_SECRET}`,
    `${process.env.REDIRECT}`
  );

  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const accessToken = await oAuth2Client.getAccessToken();

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: `${process.env.USER}`,
      clientId: `${process.env.CLIENT_ID}`,
      clientSecret: `${process.env.CLIENT_SECRET}`,
      refreshToken: `${process.env.REFRESH_TOKEN}`,
      accessToken: `${accessToken}`,
    },
  });

  await new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        message = `${error}`;
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  const mailData = {
    from: `"Malwande" <${process.env.USER}>`,
    to: user.email,
    subject: `Verification code from custom auth demo project`,
    text: `Your verification code is ${token.emailToken}, this verification code expires in 10 minutes`,
    html: `<h4>Your verification code is ${token.emailToken}</h4> <p>This verification code exprires in 10 minutes</p>`,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        reject(error);
      } else {
        console.log("success");
        console.log(info);
        resolve(info);
      }
    });
  });
};

export { message, sendEmails };
