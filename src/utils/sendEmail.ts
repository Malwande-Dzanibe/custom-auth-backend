import nodemailer from "nodemailer";

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
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secure: false,
    port: 587,
    auth: {
      user: "malwandedza@outlook.com",
      pass: process.env.PASS,
    },
  });

  await new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  const mailData = {
    from: `"Malwande" <malwandedza@outlook.com>`,
    to: user.email,
    subject: `Verification code from custom auth demo project`,
    text: `Your verification code is ${token.emailToken}, this verification code expires in 10 minutes`,
    html: `<h4 style={{ color: "red", fontSize: "12px", textAlign: "center" }}>Your verification code is ${token.emailToken}</h4> <p style={{ textAlign: "center" }}>This code exprires in 10 minutes</p>`,
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
};

export default sendEmails;
