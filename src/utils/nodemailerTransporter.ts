import nodemailer from "nodemailer";

const transporterFunction = () => {
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    tls: {
      ciphers: "SSLv3",
    },
    secure: false,
    port: 587,
    auth: {
      user: "malwandedza@outlook.com",
      pass: process.env.PASS,
    },
  });

  return transporter;
};

export default transporterFunction;
