/// Created by wmysterio, 14.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../../.././.config/sa.d.ts" />

import { RouteNode } from "./RouteNode";

export class AddedRacerInfo {

    public carModel: int;
    public x: float;
    public y: float;
    public z: float;
    public heading: float;
    public charModelId: int;
    public carSetup: (car: Car) => void;
    public startNode: RouteNode;

    constructor(carModel: int, x: float, y: float, z: float, heading: float, charModelId: int, carSetup: (car: Car) => void) {
        this.carModel = carModel;
        this.x = x;
        this.y = y;
        this.z = z;
        this.heading = heading;
        this.charModelId = charModelId;
        this.carSetup = carSetup;
        this.startNode = new RouteNode(x, y, z, heading, 0.0, false, 0);
    }

}