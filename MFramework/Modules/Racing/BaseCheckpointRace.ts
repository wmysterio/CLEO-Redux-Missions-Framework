/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

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
        Hud.DrawRect(550.0, 356.2812, 118.2072, 74.2072, 0, 0, 0, 255);
        Hud.DrawRect(550.0, 356.2812, 116.2072, 72.2072, 134, 155, 184, 255);
        Hud.DrawRect(550.0, 356.2812, 112.2072, 70.2072, 0, 0, 0, 255);
        Text.SetScale(0.7, 2.0);
        Text.SetRightJustify(true);
        Text.SetWrapX(640.0);
        Text.SetColor(134, 155, 184, 255);
        Text.DisplayWith2Numbers(600.0, 326.0, "RACES32", this.baseCheckpointRacePlayerStreetRacer.currentLap + 1, this.baseCheckpointRaceNumLaps);
        let minutes = this.baseCheckpointTimer.getMinutesLeft();
        let seconds = this.baseCheckpointTimer.getSecondsLeft();
        if (0 >= this.baseCheckpointTimer.getMillisecondsLeft()) {
            this.fail("BB_17", 5000, true);
            return;
        }
        Text.SetFont(3);
        Text.SetScale(1.0, 3.6);
        Text.SetRightJustify(true);
        Text.SetWrapX(640.0);
        Text.SetDropshadow(2, 0, 0, 0, 180);
        Text.SetColor(134, 155, 184, 255);
        Timer.JustDisplayTime(600.0, 357.0, minutes, seconds);
    }

}