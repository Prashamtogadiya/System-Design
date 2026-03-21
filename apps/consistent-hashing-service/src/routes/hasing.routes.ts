import { Router } from "express";
import { ring } from "../ring";

const router = Router();

router.get("/route/:key", (req, res) => {
  const key = req.params.key;

  const primary = ring.getNode(key);
  const replicas = ring.getReplicas(key, 2);

  res.json({
    key,
    primary,
    replicas,
  });
});

router.post("/node", (req, res) => {
  const { node } = req.body;

  ring.addNode(node);

  res.json({ message: `Node ${node} added` });
});

router.delete("/node", (req, res) => {
  const { node } = req.body;

  ring.removeNode(node);

  res.json({ message: `Node ${node} removed` });
});

router.get("/ring", (req, res) => {
  res.json(ring.getRing());
});

export default router;