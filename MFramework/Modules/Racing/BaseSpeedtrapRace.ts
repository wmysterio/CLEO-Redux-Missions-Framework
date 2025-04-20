/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { Counter } from "../Counter";
import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RouteNode } from "./Core/RouteNode";
import { StreetRacer } from "./Core/StreetRacer";

/** A base class that implements a race in the "Speedtrap" mode */
export abstract class BaseSpeedtrapRace extends BaseRaceMission {

    private baseSpeedtrapRaceIsFirstCalculation: boolean;
    private baseSpeedtrapRaceNumStreetRacers: int;
    private baseSpeedtrapRacePlayerStreetRacer: StreetRacer;
    private baseSpeedtrapRacePlayerStreetRacerIndex: int;
    private baseSpeedtrapRaceNumLaps: int;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseSpeedtrapRaceNumLaps = 1;
        this.baseSpeedtrapRaceIsFirstCalculation = true;
        this.baseSpeedtrapRaceNumStreetRacers = 0;
        this.baseSpeedtrapRacePlayerStreetRacer = undefined;
        this.baseSpeedtrapRacePlayerStreetRacerIndex = -1;
        this.makeCheckpointTuneAsCameraShot();
    }

    /** The minimum number of race laps is not less than 1 */
    protected setNumberOfRaceLaps(numLaps: int): void {
        this.baseSpeedtrapRaceNumLaps = 1 > numLaps ? 1 : numLaps;
    }

    protected onStreetRacerCheckpointPassedEvent(streetRacer: StreetRacer, lastNode: RouteNode): void {
        if (!streetRacer.isPlayer || this.baseSpeedtrapRaceNumLaps > (streetRacer.currentLap + 1))
            return;
        if (this.getLastCheckpointId() === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    protected onStreetRacerLapPassedEvent(streetRacer: StreetRacer, lastLap: int): void {
        if (this.baseSpeedtrapRaceNumLaps > lastLap)
            return;
        this.recalculateSpeeds(streetRacer.id);
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        if (this.baseSpeedtrapRaceIsFirstCalculation) {
            this.baseSpeedtrapRaceIsFirstCalculation = false;
            let streetRacers = this.getStreetRacers();
            this.baseSpeedtrapRaceNumStreetRacers = streetRacers.length;
            for (let i = 0; i < this.baseSpeedtrapRaceNumStreetRacers; ++i) {
                if (streetRacers[i].isPlayer) {
                    this.baseSpeedtrapRacePlayerStreetRacerIndex = i;
                    this.baseSpeedtrapRacePlayerStreetRacer = streetRacers[i];
                    break;
                }
            }
        }
        Counter.Display(this.baseSpeedtrapRaceGetPlayerPosition(), 1, "RACES44");
        Counter.DisplayWith2Numbers(this.baseSpeedtrapRacePlayerStreetRacer.currentLap + 1, this.baseSpeedtrapRaceNumLaps, "RACES32", 2);
        Counter.Display(this.baseSpeedtrapRacePlayerStreetRacer.summOfSpeed, 3, "KICK1_9");
    }



    private baseSpeedtrapRaceGetPlayerPosition(): int {
        let position = 1;
        for (let i = 0; i < this.baseSpeedtrapRaceNumStreetRacers; ++i) {
            if (this.baseSpeedtrapRacePlayerStreetRacerIndex === i)
                continue;
            let currentStreetRacer = this.getStreetRacer(i);
            if (currentStreetRacer.summOfSpeed > this.baseSpeedtrapRacePlayerStreetRacer.summOfSpeed)
                position += 1;
        }
        return position;
    }

    private recalculateSpeeds(winnerStreetRacerId: int): void {
        let lastCheckpointId = this.getLastCheckpointId();
        for (let i = 0; i < this.baseSpeedtrapRaceNumStreetRacers; ++i) {
            if (winnerStreetRacerId === i || this.baseSpeedtrapRacePlayerStreetRacerIndex === i)
                continue;
            let currentStreetRacer = this.getStreetRacer(i);
            if (lastCheckpointId === currentStreetRacer.nextNodeId) {
                currentStreetRacer.summOfSpeed += this.getRouteNode(lastCheckpointId).speed;
                continue;
            }
            while (lastCheckpointId > currentStreetRacer.nextNodeId) {
                currentStreetRacer.nextNodeId = this.findNextCheckpointId(currentStreetRacer.nextNodeId);
                currentStreetRacer.summOfSpeed += this.getRouteNode(currentStreetRacer.nextNodeId).speed;
            }
        }
        let maxSumm = 0.0;
        winnerStreetRacerId = 0;
        for (let i = 0; i < this.baseSpeedtrapRaceNumStreetRacers; ++i) {
            let currentStreetRacer = this.getStreetRacer(i);
            if (currentStreetRacer.summOfSpeed > maxSumm) {
                maxSumm = currentStreetRacer.summOfSpeed;
                winnerStreetRacerId = i;
            }
        }
        if (this.getStreetRacer(winnerStreetRacerId).isPlayer) {
            this.complete();
            return;
        }
        this.fail("RACEFA", 5000, true);
    }

}