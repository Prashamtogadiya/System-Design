import { Cluster } from "./cluster";

export class Gossip {
  cluster: Cluster;
  interval: number;

  constructor(cluster: Cluster, interval = 3000) {
    this.cluster = cluster;
    this.interval = interval;
  }

  start() {
    setInterval(() => {
      const now = Date.now();

      this.cluster.nodes.forEach((node, name) => {
        if (!node.isAlive) return;

        const diff = now - node.lastHeartbeat;

        if (diff > this.interval * 2) {
          node.isAlive = false;
          console.log(`[Gossip] Node ${name} marked DEAD`);
        } else {
          console.log(`[Gossip] Node ${name} is ALIVE`);
        }
      });
    }, this.interval);
  }
}