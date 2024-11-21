import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const content: string = req.body.content;

  const auth = req.headers["authorization"];

  const jwtoken = auth?.split(" ")[1];

  try {
    if (!jwtoken) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const payLoad = jwt.verify(jwtoken, `${process.env.JWT_SECRET}`) as {
      id: string;
    };

    const apiToken = await prisma.token.findUnique({
      where: {
        id: payLoad.id,
      },
      include: {
        user: true,
      },
    });

    if (!apiToken?.isValid || apiToken.expiration < new Date()) {
      return res.status(401).json({ message: "API token expired" });
    }

    const tweet = await prisma.post.create({
      data: {
        content,
        userId: apiToken?.user.id,
      },
      include: {
        user: true,
      },
    });

    res.status(200).json(tweet);
  } catch (error) {
    res.status(401).json({
      message: `the error is ${error}`,
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const comment = await prisma.post.delete({
      where: {
        id,
      },
    });

    res.status(200).json(comment);
  } catch (error) {
    res.status(401).json({
      message: `the error is ${error}`,
    });
  }
});

router.put("/editt/:id", async (req, res) => {
  const content = req.body.content;
  const id = req.params.id;

  console.log(id);
  console.log(content);

  try {
    const comment = await prisma.post.update({
      where: {
        id,
      },
      data: {
        content,
      },
    });

    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `the error is ${error}`,
    });
  }
});

export default router;
