/// Created by wmysterio, 11.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.././.config/sa.d.ts" />

import { RouteNode } from "./RouteNode";

export class RadarNode {

    public isPassed: boolean;
    public x: float;
    public y: float;
    public z: float;

    private baseRadarNodeBlip: Blip;
    private baseRadarNodeCheckpoint: Checkpoint;

    constructor(routeNode: RouteNode) {
        this.baseRadarNodeBlip = new Blip(-1);
        this.baseRadarNodeCheckpoint = new Checkpoint(-1);
        this.isPassed = false;
        this.x = routeNode.x;
        this.y = routeNode.y;
        this.z = routeNode.z;
    }

    public create(): void {
        this.baseRadarNodeBlip = Blip.AddForCoord(this.x, this.y, this.z);
        this.baseRadarNodeCheckpoint = Checkpoint.Create(2, this.x, this.y, this.z, this.x, this.y, this.z, 6.0);
    }

    public remove(): void {
        this.baseRadarNodeBlip.remove();
        this.baseRadarNodeCheckpoint.delete();
    }

}