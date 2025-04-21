/// Created by wmysterio, 11.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../../.././.config/sa.d.ts" />

export class RouteNode {

    public x: float;
    public y: float;
    public z: float;
    public heading: float;
    public speed: float;
    public isCheckpoint: boolean;
    public checkpointId: int;
    public timeLimitInMilliseconds: int;

    constructor(x: float, y: float, z: float, heading: float, speed: float, isCheckpoint: boolean, timeLimitInMilliseconds: int) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.heading = heading;
        this.speed = speed;
        this.isCheckpoint = isCheckpoint;
        this.timeLimitInMilliseconds = timeLimitInMilliseconds;
        this.checkpointId = 0;
    }

}