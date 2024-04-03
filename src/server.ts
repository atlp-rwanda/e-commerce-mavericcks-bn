import type { Application, Request, Response } from "express";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.send("Welcome at Mavericks E-commerce Website Apis");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});