/// Created by wmysterio, 11.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { RouteNode } from "./RouteNode";

export class StreetRacer {

    public id: int;
    public car: Car;
    public char: Char;
    public isPlayer: boolean;
    public lastNode: RouteNode;
    public currentLap: int;
    public nextNodeId: int;
    public summOfSpeed: float;
    public availableTime: int;
    public isKnockedOut: boolean;

    constructor(id: int, char: Char, car: Car, isPlayer: boolean, startNode: RouteNode) {
        this.id = id;
        this.car = car;
        this.char = char;
        this.isPlayer = isPlayer;
        this.lastNode = startNode;
        this.currentLap = 0;
        this.nextNodeId = 0;
        this.summOfSpeed = 0.0;
        this.availableTime = 0;
        this.isKnockedOut = false;
    }

}