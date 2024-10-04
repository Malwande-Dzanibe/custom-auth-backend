import nodemailer from "nodemailer";
import { google } from "googleapis";

let eyy = {
  message: "call",
};

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

  eyy.message = "call  again";

  await new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        eyy.message = `the problem is here 1`;
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        eyy.message = `the problem is here 2`;
        resolve("Server is ready to take our messages");
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
        eyy.message = `the problem is here 3`;
        reject(error);
      } else {
        console.log("success");
        console.log(info);
        eyy.message = `the problem is here 4`;
        resolve(info);
      }
    });
  });
};

export { eyy, sendEmails };
