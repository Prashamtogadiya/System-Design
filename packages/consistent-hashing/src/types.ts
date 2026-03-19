export type NodeName = string;

export interface ReplicaResult{
    primary : NodeName | null;
    replicas : NodeName[];
}