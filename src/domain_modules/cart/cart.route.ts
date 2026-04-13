import { Router } from "express";

const router = Router();

router.post("/items", (req, res) => {
  res.json({ message: "Add to cart" });
});

router.get("/", (req, res) => {
  res.json({ message: "Get cart" });
});

export default router;