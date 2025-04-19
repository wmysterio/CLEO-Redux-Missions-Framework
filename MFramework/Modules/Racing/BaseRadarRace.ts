/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { Counter } from "../Counter";
import { Timer } from "../Timer";
import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RadarNode } from "./Core/RadarNode";

/** Base class implementing radar racing */
export abstract class BaseRadarRace extends BaseRaceMission {

    private baseRadarRaceIsFirstCalculation: boolean;
    private baseRadarRacePlayerCar: Car;
    private baseRadarRaceTimer: Timer;
    private baseRadarRaceUseTimer: boolean;
    private baseRadarRacePlayerSpeed: int;
    private baseRadarRaceNeedSpeed: int;
    private baseRadarRaceRadarNodes: RadarNode[];
    private baseRadarRaceNumRadars: int;
    private baseRadarRaceNumPassedRadars: int;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseRadarRaceIsFirstCalculation = true;
        this.baseRadarRacePlayerCar = new Car(-1);
        this.baseRadarRaceTimer = new Timer();
        this.baseRadarRaceUseTimer = false;
        this.baseRadarRaceNeedSpeed = 0.0;
        this.baseRadarRacePlayerSpeed = 0.0;
        this.baseRadarRaceRadarNodes = new Array<RadarNode>();
        this.baseRadarRaceNumRadars = 0;
        this.baseRadarRaceNumPassedRadars = 0;
        this.disablePlayerCheckpointsChek();
    }

    protected setTimeLimit(timeInMilliseconds: int): void {
        this.baseRadarRaceTimer.set(timeInMilliseconds);
        this.baseRadarRaceUseTimer = true;
    }

    protected canMarkCheckpointsAsFinish(): boolean {
        return false;
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        if (this.baseRadarRaceIsFirstCalculation) {
            this.baseRadarRaceIsFirstCalculation = false;
            let streetRacers = this.getStreetRacers();
            let numStreetRacers = streetRacers.length;
            for (let i = 0; i < numStreetRacers; ++i) {
                if (streetRacers[i].isPlayer) {
                    this.baseRadarRacePlayerCar = streetRacers[i].car;
                    break;
                }
            }
            let checkpointId = this.getLastCheckpointId();
            do {
                let routeNode = this.getRouteNode(checkpointId);
                this.baseRadarRaceNeedSpeed += routeNode.speed;
                this.baseRadarRaceRadarNodes.push(new RadarNode(routeNode));
                checkpointId = this.findNextCheckpointId(checkpointId);
            } while (checkpointId !== this.getLastCheckpointId());
            this.baseRadarRaceNumRadars = this.baseRadarRaceRadarNodes.length;
            for (let i = 0; i < this.baseRadarRaceNumRadars; ++i)
                this.baseRadarRaceRadarNodes[i].create();
        }
        if (this.baseRadarRaceUseTimer) {
            if (0 >= this.baseRadarRaceTimer.getMillisecondsLeft()) {
                this.baseRadarRaceRemoveAll(true, "BB_17");
                return;
            }
            let minutes = this.baseRadarRaceTimer.getMinutesLeft();
            let seconds = this.baseRadarRaceTimer.getSecondsLeft();
            Timer.Display(minutes, seconds);
        }
        for (let i = 0; i < this.baseRadarRaceNumRadars; ++i) {
            let radar = this.baseRadarRaceRadarNodes[i];
            if (radar.isPassed)
                continue;
            if (this.baseRadarRacePlayerCar.locate3D(radar.x, radar.y, radar.z, 12.0, 12.0, 12.0, false)
                /*&& this.baseRadarRacePlayerCar.isOnAllWheels()*/) {
                Audio.ReportMissionAudioEventAtPosition(0.0, 0.0, 0.0, 1132);
                radar.isPassed = true;
                radar.remove();
                this.baseRadarRaceNumPassedRadars += 1;
                this.baseRadarRacePlayerSpeed += this.baseRadarRacePlayerCar.getSpeed();
                Text.PrintWith2NumbersNow("SN_ONE", this.baseRadarRaceNumPassedRadars, this.baseRadarRaceNumRadars, 5000, 1);
            }
        }
        Counter.Display(this.baseRadarRacePlayerSpeed, 1, "KICK1_9");
        Counter.Display(this.baseRadarRaceNeedSpeed, 2, "ST1_7");
        Counter.Display(this.baseRadarRacePlayerCar.getSpeed(), 4);
        if (this.baseRadarRaceNumPassedRadars === this.baseRadarRaceNumRadars)
            this.baseRadarRaceRemoveAll(this.baseRadarRaceNeedSpeed > this.baseRadarRacePlayerSpeed, "DNC_003");
    }



    private baseRadarRaceRemoveAll(isFailed: boolean, failedGxt: string): void {
        for (let i = 0; i < this.baseRadarRaceNumRadars; ++i)
            this.baseRadarRaceRadarNodes[i].remove();
        if (isFailed) {
            this.fail(failedGxt, 5000, true);
            return;
        }
        this.complete();
    }

}