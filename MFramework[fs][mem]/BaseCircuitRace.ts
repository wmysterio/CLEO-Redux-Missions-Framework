/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

import { Screen } from "./Screen";
import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RouteNode } from "./Core/RouteNode";
import { StreetRacer } from "./Core/StreetRacer";

/** Base class implementing circuit racing */
export abstract class BaseCircuitRace extends BaseRaceMission {

    private baseCircuitRaceIsFirstCalculation: boolean;
    private baseCircuitRaceNumStreetRacers: int;
    private baseCircuitRaceStreetRacerPlayer: StreetRacer;
    private baseCircuitRaceStreetRacerPlayerId: int;
    private baseCircuitRaceNumLaps: int;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseCircuitRaceIsFirstCalculation = true;
        this.baseCircuitRaceNumLaps = 2;
        this.baseCircuitRaceNumStreetRacers = 0;
        this.baseCircuitRaceStreetRacerPlayer = undefined;
        this.baseCircuitRaceStreetRacerPlayerId = -1;
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
            this.baseCircuitRaceNumStreetRacers = this.getNumberOfStreetRacers();
            this.baseCircuitRaceStreetRacerPlayer = this.getStreetRacerPlayer();
            this.baseCircuitRaceStreetRacerPlayerId = this.getStreetRacerPlayerId();
        }
        Screen.DisplayCounter(this.baseCircuitRaceGetPlayerPosition(), 1, "RACES44");
        Screen.DisplayCounterWith2Numbers(this.baseCircuitRaceStreetRacerPlayer.currentLap + 1, this.baseCircuitRaceNumLaps, "RACES32", 2);
    }



    private baseCircuitRaceGetPlayerPosition(): int {
        let position = 1;
        let currentPlayerCheckpointId = this.baseCircuitRaceStreetRacerPlayer.nextNodeId;
        for (let i = 0; i < this.baseCircuitRaceNumStreetRacers; ++i) {
            if (this.baseCircuitRaceStreetRacerPlayerId === i)
                continue;
            let currentStreetRacer = this.getStreetRacer(i);
            if (currentStreetRacer.currentLap > this.baseCircuitRaceStreetRacerPlayer.currentLap) {
                position += 1;
            } else if (currentStreetRacer.currentLap === this.baseCircuitRaceStreetRacerPlayer.currentLap) {
                let currentStreetRacerCheckpointId = currentStreetRacer.nextNodeId;
                if (!this.isRouteNodeACheckpoint(currentStreetRacerCheckpointId))
                    currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
                if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                    position += 1;
                } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                    let playerCoord = this.baseCircuitRaceStreetRacerPlayer.car.getCoordinates();
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