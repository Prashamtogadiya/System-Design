import { Cluster } from "@system-design/consistent-hashing/src/cluster";

export const cluster = new Cluster(2);

["A", "B", "C"].forEach((n) => cluster.addNode(n));
