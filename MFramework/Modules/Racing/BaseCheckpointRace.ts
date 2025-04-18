/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { Bar } from "../Bar";
import { Counter } from "../Counter";
import { Timer } from "../Timer";
import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RouteNode } from "./Core/RouteNode";
import { StreetRacer } from "./Core/StreetRacer";

/** Base class implementing circuit racing */
export abstract class BaseCheckpointRace extends BaseRaceMission {

    private baseCheckpointRaceIsFirstCalculation: boolean;
    private baseCheckpointRacePlayerStreetRacer: StreetRacer;
    private baseCheckpointRaceNumLaps: int;
    private baseCheckpointTimer: Timer;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseCheckpointRaceNumLaps = 1;
        this.baseCheckpointRaceIsFirstCalculation = true;
        this.baseCheckpointRacePlayerStreetRacer = undefined;
        this.baseCheckpointTimer = new Timer();
        this.makeCheckpointTuneAsCameraShot();
    }

    /** The minimum number of race laps is not less than 1 */
    protected setNumberOfRaceLaps(numLaps: int): void {
        this.baseCheckpointRaceNumLaps = 1 > numLaps ? 1 : numLaps;
    }

    protected onStreetRacerCheckpointPassedEvent(streetRacer: StreetRacer, lastNode: RouteNode): void {
        if (streetRacer.isPlayer && lastNode.isCheckpoint) {
            let nextCheckpointId = this.findNextCheckpointId(lastNode.checkpointId);
            let nextRouteNode = this.getRouteNode(nextCheckpointId);
            this.baseCheckpointTimer.add(nextRouteNode.timeLimitInMilliseconds);
            Text.PrintWithNumberNow("A_TIME", Math.floor((nextRouteNode.timeLimitInMilliseconds / 1000) % 60), 5000, 1);
        }
        if (!streetRacer.isPlayer || this.baseCheckpointRaceNumLaps > (streetRacer.currentLap + 1))
            return;
        if (this.getLastCheckpointId() === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    protected onStreetRacerLapPassedEvent(streetRacer: StreetRacer, lastLap: int): void {
        if (this.baseCheckpointRaceNumLaps > lastLap)
            return;
        if (streetRacer.isPlayer)
            this.complete();
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        if (this.baseCheckpointRaceIsFirstCalculation) {
            this.baseCheckpointRaceIsFirstCalculation = false;
            let streetRacers = this.getStreetRacers();
            let numStreetRacers = streetRacers.length;
            for (let i = 0; i < numStreetRacers; ++i) {
                if (streetRacers[i].isPlayer) {
                    this.baseCheckpointRacePlayerStreetRacer = streetRacers[i];
                    let nextCheckpointId = this.findNextCheckpointId(-1);
                    let nextRouteNode = this.getRouteNode(nextCheckpointId);
                    this.baseCheckpointTimer.set(nextRouteNode.timeLimitInMilliseconds);
                    break;
                }
            }
        }
        if (this.baseCheckpointRaceNumLaps > 1)
            Counter.DisplayWith2Numbers(this.baseCheckpointRacePlayerStreetRacer.currentLap + 1, this.baseCheckpointRaceNumLaps, "RACES32");
        let minutes = this.baseCheckpointTimer.getMinutesLeft();
        let seconds = this.baseCheckpointTimer.getSecondsLeft();
        if (0 >= this.baseCheckpointTimer.getMillisecondsLeft()) {
            this.fail("BB_17", 5000, true);
            return;
        }
        Timer.Display(minutes, seconds);
    }

}