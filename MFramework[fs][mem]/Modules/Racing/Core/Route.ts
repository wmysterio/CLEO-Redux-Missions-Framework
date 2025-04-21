/// Created by wmysterio, 11.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../../.././.config/sa.d.ts" />

import { RouteNode } from "./RouteNode";

export class Route {

    private routeRouteNode: RouteNode[];

    constructor() {
        this.routeRouteNode = new Array<RouteNode>();
    }

    public getNumNodes(): int {
        return this.routeRouteNode.length;
    }

    public getNode(index: int): RouteNode {
        return this.routeRouteNode[index];
    }

    public isCheckpoint(index: int): boolean {
        return this.routeRouteNode[index].isCheckpoint;
    }

    public addNode(x: float, y: float, z: float, heading: float, speed: float, isCheckpoint: boolean, timeLimitInMilliseconds: int): void {
        let node = new RouteNode(x, y, z, heading, speed, isCheckpoint, timeLimitInMilliseconds);
        if (isCheckpoint)
            node.checkpointId = this.routeRouteNode.length;
        this.routeRouteNode.push(node);
    }

}