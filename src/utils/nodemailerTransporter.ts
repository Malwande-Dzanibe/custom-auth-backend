import nodemailer from "nodemailer";

const transporterFunction = () => {
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secure: false,
    port: 587,
    auth: {
      user: "malwandedza@outlook.com",
      pass: process.env.PASS,
    },
    from: "malwandedza@outlook.com",
  });

  return transporter;
};

export default transporterFunction;
