import crypto from "crypto";
import { NodeName } from "./types";

export class HashRing {
  private ring: Map<number, NodeName> = new Map();
  private sortedKeys: number[] = [];
  private replicas: number;

  constructor(replicas = 5) {
    this.replicas = replicas;
  }

  private hash(value: string): number {
    return parseInt(
      crypto.createHash("md5").update(value).digest("hex").slice(0, 8),
      16,
    );
  }

  addNode(node: NodeName) {
    for (let i = 0; i < this.replicas; i++) {
      const vnode = `${node}#${i}`;
      const hash = this.hash(vnode);

      this.ring.set(hash, vnode);
      this.sortedKeys.push(hash);
    }

    this.sortedKeys.sort((a, b) => a - b);
  }

  removeNode(node: NodeName) {
    for (let i = 0; i < this.replicas; i++) {
      const vnode = `${node}#${i}`;
      const hash = this.hash(vnode);

      this.ring.delete(hash);
      this.sortedKeys = this.sortedKeys.filter((h) => h !== hash);
    }
  }

  getNode(key: string): NodeName | null {
    if (this.sortedKeys.length === 0) return null;

    const hash = this.hash(key);

    let left = 0;
    let right = this.sortedKeys.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (this.sortedKeys[mid] === hash) {
        return this.ring.get(this.sortedKeys[mid])!;
      }

      if (this.sortedKeys[mid] < hash) left = mid + 1;
      else right = mid - 1;
    }

    const index = left % this.sortedKeys.length;
    return this.ring.get(this.sortedKeys[index])!;
  }

  getReplicas(key: string, count: number): NodeName[] {
    const result: NodeName[] = [];
    const visited = new Set<NodeName>();

    if (this.sortedKeys.length === 0) return result;

    const hash = this.hash(key);

    let idx = this.sortedKeys.findIndex((h) => h >= hash);
    if (idx === -1) idx = 0;

    let i = 0;
    while (result.length < count && i < this.sortedKeys.length) {
      const node = this.ring.get(
        this.sortedKeys[(idx + i) % this.sortedKeys.length],
      )!;

      if (!visited.has(node)) {
        visited.add(node);
        result.push(node);
      }

      i++;
    }

    return result;
  }

  getRing() {
    return this.sortedKeys.map((hash) => ({
      hash,
      node: this.ring.get(hash),
    }));
  }
}
