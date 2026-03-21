import { HashRing } from "./hash-ring";
import { Node } from "./node";

export class Cluster {
  ring: HashRing;
  nodes: Map<string, Node>;
  replicationFactor: number;

  constructor(replicationFactor = 2) {
    this.ring = new HashRing(5);
    this.nodes = new Map();
    this.replicationFactor = replicationFactor;
  }

  addNode(name: string) {
    const node = new Node(name);
    this.nodes.set(name, node);
    this.ring.addNode(name);

    console.log(`[Join] Node ${name} added`);
  }

  removeNode(name: string) {
    this.nodes.delete(name);
    this.ring.removeNode(name);

    console.log(`[Leave] Node ${name} removed`);
  }

  put(key: string, value: any) {
    const replicas = this.ring.getReplicas(key, this.replicationFactor);

    console.log(`[Write RAW] ${replicas.join(", ")}`);

    const physicalNodes = replicas.map((vnode) => vnode.split("#")[0]);

    console.log(`[Write] ${key} → ${physicalNodes.join(", ")}`);

    physicalNodes.forEach((nodeName) => {
      const node = this.nodes.get(nodeName);
      node?.put(key, value);
    });
  }

  get(key: string) {
    const replicas = this.ring.getReplicas(key, this.replicationFactor);

    const physicalNodes = replicas.map((vnode) => vnode.split("#")[0]);

    console.log(`[Read] ${key} → ${physicalNodes.join(", ")}`);

    for (const nodeName of physicalNodes) {
      const node = this.nodes.get(nodeName);

      if (node && node.isAlive) {
        const value = node.get(key);

        if (value !== undefined && value !== null) {
          console.log(`[Read SUCCESS] ${key} from ${nodeName}`);
          return value;
        }
      }
    }

    return null;
  }

  failNode(name: string) {
    const node = this.nodes.get(name);
    if (node) {
      node.isAlive = false;
      console.log(`[Fail] Node ${name} is DOWN`);
    }
  }

  recoverNode(name: string) {
    const node = this.nodes.get(name);
    if (node) {
      node.isAlive = true;
      console.log(`[Recover] Node ${name} is UP`);
    }
  }

  rebalance() {
    console.log("[Rebalance] Checking data distribution...");

    const allData: Map<string, any> = new Map();

    this.nodes.forEach((node) => {
      node.store.forEach((value, key) => {
        allData.set(key, value);
      });
      node.store.clear();
    });

    allData.forEach((value, key) => {
      this.put(key, value);
    });

    console.log("[Rebalance] Completed");
  }
}
