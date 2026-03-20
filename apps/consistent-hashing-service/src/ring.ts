import { HashRing } from "@system-design/consistent-hashing";

export const ring = new HashRing(5);

["A", "B", "C"].forEach((node) => ring.addNode(node));