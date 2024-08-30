import nodemailer from "nodemailer";

const transporterFunction = () => {
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secure: false,
    port: 587,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
    from: process.env.USER,
  });

  return transporter;
};

export default transporterFunction;
