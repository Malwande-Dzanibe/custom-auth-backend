// import express from 'express';

// const router = express.Router();

// type EmojiResponse = string[];

// router.get<{}, EmojiResponse>('/', (req, res) => {
//   res.json(['😀', '😳', '🙄']);
// });

// export default router;

import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import sendEmails from "../utils/sendEmail";

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

  console.log(req.body);

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

    sendEmails(user, tokenToEmail);

    res.status(200).json(tokenToEmail);
  } catch (error) {
    // console.log("this is the error below");
    // console.log({ error });

    // res.status(500).json({
    //   //@ts-ignore
    //   message: error.name,
    // });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2000") {
        res.status(500).json({
          message:
            "The provided value for the column is too long for the column's type. Column: {column_name}",
        });
      }
      if (error.code === "P2001") {
        res.status(500).json({
          message:
            "The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist",
        });
      }
      if (error.code === "P2002") {
        res.status(500).json({
          message: "Unique constraint failed on the {constraint}",
        });
      }
      if (error.code === "P2003") {
        res.status(500).json({
          message: "Foreign key constraint failed on the field: {field_name}",
        });
      }
      if (error.code === "P2004") {
        res.status(500).json({
          message: "A constraint failed on the database: {database_error}",
        });
      }
      if (error.code === "P2005") {
        res.status(500).json({
          message:
            "The value {field_value} stored in the database for the field {field_name} is invalid for the field's type",
        });
      }
      if (error.code === "P2006") {
        res.status(500).json({
          message:
            "The provided value {field_value} for {model_name} field {field_name} is not valid",
        });
      }
      if (error.code === "P2007") {
        res.status(500).json({
          message: "Data validation error {database_error}",
        });
      }
      if (error.code === "P2008") {
        res.status(500).json({
          message:
            "Failed to parse the query {query_parsing_error} at {query_position}",
        });
      }
      if (error.code === "P2009") {
        res.status(500).json({
          message:
            "Failed to validate the query: {query_validation_error} at {query_position}",
        });
      }
      if (error.code === "P2010") {
        res.status(500).json({
          message: "Raw query failed. Code: {code}. Message: {message}",
        });
      }
    }
    res.status(500).json({
      message: "It is a different error",
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
        message: `We do not have a user by the email of ${email}`,
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

    sendEmails(user, tokenToEmail);

    res.status(200).json(tokenToEmail);
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      //@ts-ignore
      message: error.name,
    });
  }
});

router.get("/tweets", async (req, res) => {
  try {
    const tweets = await prisma.post.findMany({
      include: {
        user: true,
      },
    });

    if (!tweets) {
      return res.status(404).json({
        message: "No Posts To Display",
      });
    }

    res.status(200).json(tweets);
  } catch (error) {
    // console.log("this is the error below");

    // console.log(error);
    // res.status(500).json({
    //   //@ts-ignore
    //   message: error.name,
    // });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2000") {
        res.status(500).json({
          message:
            "The provided value for the column is too long for the column's type. Column: {column_name}",
        });
      }
      if (error.code === "P2001") {
        res.status(500).json({
          message:
            "The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist",
        });
      }
      if (error.code === "P2002") {
        res.status(500).json({
          message: "Unique constraint failed on the {constraint}",
        });
      }
      if (error.code === "P2003") {
        res.status(500).json({
          message: "Foreign key constraint failed on the field: {field_name}",
        });
      }
      if (error.code === "P2004") {
        res.status(500).json({
          message: "A constraint failed on the database: {database_error}",
        });
      }
      if (error.code === "P2005") {
        res.status(500).json({
          message:
            "The value {field_value} stored in the database for the field {field_name} is invalid for the field's type",
        });
      }
      if (error.code === "P2006") {
        res.status(500).json({
          message:
            "The provided value {field_value} for {model_name} field {field_name} is not valid",
        });
      }
      if (error.code === "P2007") {
        res.status(500).json({
          message: "Data validation error {database_error}",
        });
      }
      if (error.code === "P2008") {
        res.status(500).json({
          message:
            "Failed to parse the query {query_parsing_error} at {query_position}",
        });
      }
      if (error.code === "P2009") {
        res.status(500).json({
          message:
            "Failed to validate the query: {query_validation_error} at {query_position}",
        });
      }
      if (error.code === "P2010") {
        res.status(500).json({
          message: "Raw query failed. Code: {code}. Message: {message}",
        });
      }
    }
    res.status(500).json({
      message: "It is a different error",
    });
  }
});

export default router;
