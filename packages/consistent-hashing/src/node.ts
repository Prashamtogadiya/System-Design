export class Node {
    name:string;
    store:Map<string,any>;
    isAlive:boolean;
    lastHeartbeat:number;

    constructor(name:string){
        this.name=name;
        this.store=new Map();
        this.isAlive=true;
        this.lastHeartbeat=Date.now();
    }

    put(key:string,value:any){
        this.store.set(key,value);
    }

    get(key:string){
        return this.store.get(key);
    }

    delete(key:string){
        this.store.delete(key);
    }

    heartbeat(){
        this.lastHeartbeat = Date.now();
    }
}