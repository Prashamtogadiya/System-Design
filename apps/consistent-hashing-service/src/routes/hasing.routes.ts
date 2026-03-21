import { Router } from "express";
import { cluster } from "../ring";

const router = Router();

router.get("/route/:key", (req, res) => {
  const key = req.params.key;

  const primary = cluster.ring.getNode(key);
  const replicas = cluster.ring.getReplicas(key, 2);

  res.json({
    key,
    primary,
    replicas,
  });
});

router.post("/node", (req, res) => {
  const { node } = req.body;

  cluster.addNode(node);

  res.json({ message: `Node ${node} added` });
});

router.delete("/node", (req, res) => {
  const { node } = req.body;

  cluster.removeNode(node);

  res.json({ message: `Node ${node} removed` });
});

router.get("/ring", (req, res) => {
  res.json(cluster.ring.getRing());
});

router.post("/put", (req, res) => {
  const { key, value } = req.body;

  cluster.put(key, value);

  res.json({ message: "Stored" });
});

router.get("/get/:key", (req, res) => {
  const value = cluster.get(req.params.key);

  res.json({ value });
});

router.post("/fail", (req, res) => {
  const { node } = req.body;

  cluster.failNode(node);

  res.json({ message: `Node ${node} failed` });
});

router.post("/recover", (req, res) => {
  const { node } = req.body;

  cluster.recoverNode(node);

  res.json({ message: `Node ${node} recovered` });
});

router.post("/rebalance", (req, res) => {
  cluster.rebalance();

  res.json({ message: "Rebalanced" });
});

export default router;