import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();

const prisma = new PrismaClient();

const generateJWT = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    algorithm: "HS256",
  });
};

router.post("/", async (req, res) => {
  // const emailToken = req.body.emailToken;
  // const email = req.body.email;

  const emailToken = req.body.token.emailToken;
  const email = req.body.userEmail;

  const apiTokenExpiration = new Date(
    new Date().getTime() + 1000 * 60 * 60 * 24 * 30 * 6
  );

  try {
    const tokenFromDB = await prisma.token.findUnique({
      where: {
        emailToken,
      },
      include: {
        user: true,
      },
    });

    if (!tokenFromDB || !tokenFromDB.isValid) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    if (tokenFromDB?.user.email !== email) {
      return res.status(401).json({
        message: "Please double check your email address and OTP and try again",
      });
    }

    if (tokenFromDB.expiration < new Date()) {
      return res.status(401).json({
        message: "This OTP has expired",
      });
    }

    const apiToken = await prisma.token.create({
      data: {
        expiration: apiTokenExpiration,
        type: "API",
        userId: tokenFromDB.user.id,
      },
      include: {
        user: true,
      },
    });

    const jwtoken = generateJWT(apiToken.id);

    res.status(200).json({ jwtoken, apiToken });
  } catch (error) {
    console.log({ error });
    res.status(400).json(error);
  }
});

export default router;
