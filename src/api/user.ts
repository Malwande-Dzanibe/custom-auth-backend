import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const router = Router();

const prisma = new PrismaClient();

const generateEmailToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/register", async (req, res) => {
  const email = req.body.email;
  let password = req.body.password;
  let confirmpassword = req.body.confirmpassword;
  const name = req.body.name;
  const surname = req.body.surname;

  const emailToken = generateEmailToken();

  const expiration = new Date(new Date().getTime() + 1000 * 60 * 10);

  try {
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(401).json({
        message: `${email} already exists`,
      });
    }

    if (confirmpassword !== password) {
      return res.status(401).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(401).json({
        message: "Your password should be atleast more than 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);

    password = await bcrypt.hash(req.body.password, salt);
    confirmpassword = await bcrypt.hash(req.body.confirmpassword, salt);

    user = await prisma.user.create({
      data: {
        name,
        confirmpassword,
        email,
        password,
        surname,
      },
    });

    const tokenToEmail = await prisma.token.create({
      data: {
        emailToken,
        expiration,
        type: "EMAIL",
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

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
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve("Server is ready to take our messages");
        }
      });
    });

    const mailData = {
      from: `"Malwande" <${process.env.USER}>`,
      to: `${user.email}`,
      subject: `Verification code from custom auth demo project`,
      text: `Your verification code is ${emailToken}, this verification code expires in 10 minutes`,
      html: `<h4>Your verification code is ${emailToken}</h4> <p>This verification code exprires in 10 minutes</p>`,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });

    res.status(200).json(tokenToEmail);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `${error}`,
    });
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const expiration = new Date(new Date().getTime() + 1000 * 60 * 10);
  const emailToken = generateEmailToken();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: `could not find ${email} `,
      });
    }

    const isPasswordMatching = await bcrypt.compare(password, user?.password);

    if (!isPasswordMatching) {
      return res.status(401).json({
        message: "Incorrect Password",
      });
    }

    const tokenToEmail = await prisma.token.create({
      data: {
        emailToken,
        expiration,
        type: "EMAIL",
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

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

          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve("Server is ready to take our messages");
        }
      });
    });

    const mailData = {
      from: `"Malwande" <${process.env.USER}>`,
      to: `${user.email}`,
      subject: `Verification code from custom auth demo project`,
      text: `Your verification code is ${emailToken}, this verification code expires in 10 minutes`,
      html: `<h4>Your verification code is ${emailToken}</h4> <p>This verification code exprires in 10 minutes</p>`,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });

    res.status(200).json(tokenToEmail);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `${error}`,
    });
  }
});

router.post("/send-email", async (req, res) => {
  const email = req.body.email;

  const expiration = new Date(new Date().getTime() + 1000 * 60 * 10);
  const emailToken = generateEmailToken();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: `Could not find ${email} `,
      });
    }

    const tokenToEmail = await prisma.token.create({
      data: {
        expiration,
        type: "email",
        emailToken,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    const oAuth2Client = new google.auth.OAuth2(
      `${process.env.CLIENT_ID}`,
      `${process.env.CLIENT_SECRET}`,
      `${process.env.REDIRECT}`
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

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

          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve("Server is ready to take our messages");
        }
      });
    });

    const mailData = {
      from: `"Malwande" <${process.env.USER}>`,
      to: `${user.email}`,
      subject: `Verification code from custom auth demo project`,
      text: `Your verification code is ${emailToken}, this verification code expires in 10 minutes`,
      html: `<h4>Your verification code is ${emailToken}</h4> <p>This verification code exprires in 10 minutes</p>`,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log(info);
          resolve(info);
        }
      });
    });

    console.log(`this is what in the console log ${user.email}`);

    res.status(200).json(user.email);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `${error}`,
    });
  }
});

router.put("/confirm", async (req, res) => {
  let password = req.body.password;
  let confirmpassword = req.body.confirmpassword;
  const email = req.body.email;

  try {
    if (password !== confirmpassword) {
      return res.status(401).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 8) {
      return res.status(401).json({
        message: "password too short",
      });
    }

    const salt = await bcrypt.genSalt(10);

    password = await bcrypt.hash(password, salt);
    confirmpassword = await bcrypt.hash(confirmpassword, salt);

    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        password,
        confirmpassword,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `${error}`,
    });
  }
});

router.get("/tweets", async (req, res) => {
  try {
    const tweets = await prisma.post.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (tweets.length < 1) {
      return res.status(404).json({
        message: "No Posts To Display",
      });
    }

    res.status(200).json(tweets);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `${error}`,
    });
  }
});

export default router;
