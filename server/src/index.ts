import 'dotenv/config';
import express from 'express';
import type {Request, Response} from 'express';
import cors from 'cors';
import {auth} from './lib/auth.ts';
import {fromNodeHeaders, toNodeHandler} from 'better-auth/node';


const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);


app.all("/api/auth/*splat",toNodeHandler(auth));

app.use(express.json());


app.get("/api/me",async (req: Request, res: Response) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),

    });
    return res.json(session);
});

app.get("/device", async (req, res) => {
  const { user_code } = req.query;

  // If for some reason the user_code is missing, fail loudly instead of
  // continuing with an "undefined" code in the URL.
  if (!user_code) {
    return res.status(400).send("Missing user_code in request");
  }

  // Redirect to the frontend device page (using HTTP to match the dev frontend).
  res.redirect(`http://localhost:3000/device?user_code=${user_code}`);
});

app.get("/health", (req: Request, res: Response) => {
    res.send("OK")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});