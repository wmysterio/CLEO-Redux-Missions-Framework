/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { Counter } from "../Counter";
import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RouteNode } from "./Core/RouteNode";
import { StreetRacer } from "./Core/StreetRacer";

/** Base class implementing circuit racing */
export abstract class BaseCircuitRace extends BaseRaceMission {

    private baseCircuitRaceIsFirstCalculation: boolean;
    private baseCircuitRaceNumStreetRacers: int;
    private baseCircuitRacePlayerStreetRacer: StreetRacer;
    private baseCircuitRacePlayerStreetRacerIndex: int;
    private baseCircuitRaceNumLaps: int;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseCircuitRaceNumLaps = 2;
        this.baseCircuitRaceIsFirstCalculation = true;
        this.baseCircuitRaceNumStreetRacers = 0;
        this.baseCircuitRacePlayerStreetRacer = undefined;
        this.baseCircuitRacePlayerStreetRacerIndex = -1;
    }

    /** The minimum number of race laps is not less than 2 */
    protected setNumberOfRaceLaps(numLaps: int): void {
        this.baseCircuitRaceNumLaps = 2 > numLaps ? 2 : numLaps;
    }

    protected canMarkCheckpointsAsFinish(): boolean {
        return false;
    }

    protected onStreetRacerCheckpointPassedEvent(streetRacer: StreetRacer, lastNode: RouteNode): void {
        if (!streetRacer.isPlayer || this.baseCircuitRaceNumLaps > (streetRacer.currentLap + 1))
            return;
        if (this.getLastCheckpointId() === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    protected onStreetRacerLapPassedEvent(streetRacer: StreetRacer, lastLap: int): void {
        if (this.baseCircuitRaceNumLaps > lastLap)
            return;
        if (streetRacer.isPlayer) {
            this.complete();
            return;
        }
        this.fail("RACEFA", 5000, true);
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        if (this.baseCircuitRaceIsFirstCalculation) {
            this.baseCircuitRaceIsFirstCalculation = false;
            let streetRacers = this.getStreetRacers();
            this.baseCircuitRaceNumStreetRacers = streetRacers.length;
            for (let i = 0; i < this.baseCircuitRaceNumStreetRacers; ++i) {
                if (streetRacers[i].isPlayer) {
                    this.baseCircuitRacePlayerStreetRacerIndex = i;
                    this.baseCircuitRacePlayerStreetRacer = streetRacers[i];
                    break;
                }
            }
        }
        Counter.Display(this.baseCircuitRaceGetPlayerPosition(), 1, "RACES44");
        Counter.DisplayWith2Numbers(this.baseCircuitRacePlayerStreetRacer.currentLap + 1, this.baseCircuitRaceNumLaps, "RACES32", 2);
    }



    private baseCircuitRaceGetPlayerPosition(): int {
        let position = 1;
        let currentPlayerCheckpointId = this.baseCircuitRacePlayerStreetRacer.nextNodeId;
        for (let i = 0; i < this.baseCircuitRaceNumStreetRacers; ++i) {
            if (this.baseCircuitRacePlayerStreetRacerIndex === i)
                continue;
            let currentStreetRacer = this.getStreetRacer(i);
            if (currentStreetRacer.currentLap > this.baseCircuitRacePlayerStreetRacer.currentLap) {
                position += 1;
            } else if (currentStreetRacer.currentLap === this.baseCircuitRacePlayerStreetRacer.currentLap) {
                let currentStreetRacerCheckpointId = currentStreetRacer.nextNodeId;
                if (!this.isRouteNodeACheckpoint(currentStreetRacerCheckpointId))
                    currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
                if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                    position += 1;
                } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                    let playerCoord = this.baseCircuitRacePlayerStreetRacer.car.getCoordinates();
                    let racerCoord = currentStreetRacer.car.getCoordinates();
                    let nextNode = this.getRouteNode(currentPlayerCheckpointId);
                    let playerDistance = Math.GetDistanceBetweenCoords3D(playerCoord.x, playerCoord.y, playerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    let racerDistance = Math.GetDistanceBetweenCoords3D(racerCoord.x, racerCoord.y, racerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                    if (playerDistance > racerDistance)
                        position += 1;
                }
            }
        }
        return position;
    }

}