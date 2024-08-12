import nodemailer from "nodemailer";

const transporterFunction = () => {
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secure: false,
    port: 587,
    // tls: {
    //   ciphers: "SSLv3",
    // },
    auth: {
      user: "malwandedza@outlook.com",
      pass: "M0839818321m*",
    },
    from: "malwandedza@outlook.com",
  });

  return transporter;
};

export default transporterFunction;
