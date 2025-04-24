/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

import { Screen } from "./Screen";
import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RouteNode } from "./Core/RouteNode";
import { StreetRacer } from "./Core/StreetRacer";

/** Base class implementing sprint racing */
export abstract class BaseSprintRace extends BaseRaceMission {

    private baseSprintRaceIsFirstCalculation: boolean;
    private baseSprintRaceNumStreetRacers: int;
    private baseSprintRaceStreetRacerPlayer: StreetRacer;
    private baseSprintRaceStreetRacerPlayerId: int;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseSprintRaceIsFirstCalculation = true;
        this.baseSprintRaceNumStreetRacers = 0;
        this.baseSprintRaceStreetRacerPlayer = undefined;
        this.baseSprintRaceStreetRacerPlayerId = -1;
    }

    protected onStreetRacerCheckpointPassedEvent(streetRacer: StreetRacer, lastNode: RouteNode): void {
        if (streetRacer.isPlayer && this.getLastCheckpointId() === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    protected onStreetRacerLapPassedEvent(streetRacer: StreetRacer, lastLap: int): void {
        if (streetRacer.isPlayer) {
            this.complete();
            return;
        }
        this.fail("RACEFA", 5000, true);
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        if (this.baseSprintRaceIsFirstCalculation) {
            this.baseSprintRaceIsFirstCalculation = false;
            this.baseSprintRaceNumStreetRacers = this.getNumberOfStreetRacers();
            this.baseSprintRaceStreetRacerPlayer = this.getStreetRacerPlayer();
            this.baseSprintRaceStreetRacerPlayerId = this.getStreetRacerPlayerId();
        }
        Screen.DisplayCounter(this.baseSprintRaceGetPlayerPosition(), 1, "RACES44");
    }



    private baseSprintRaceGetPlayerPosition(): int {
        let position = 1;
        let currentPlayerCheckpointId = this.baseSprintRaceStreetRacerPlayer.nextNodeId;
        for (let i = 0; i < this.baseSprintRaceNumStreetRacers; ++i) {
            if (this.baseSprintRaceStreetRacerPlayerId === i)
                continue;
            let currentStreetRacer = this.getStreetRacer(i);
            let currentStreetRacerCheckpointId = currentStreetRacer.nextNodeId;
            if (!this.isRouteNodeACheckpoint(currentStreetRacerCheckpointId))
                currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
            if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                position += 1;
            } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                let playerCoord = this.baseSprintRaceStreetRacerPlayer.car.getCoordinates();
                let racerCoord = currentStreetRacer.car.getCoordinates();
                let nextNode = this.getRouteNode(currentPlayerCheckpointId);
                let playerDistance = Math.GetDistanceBetweenCoords3D(playerCoord.x, playerCoord.y, playerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                let racerDistance = Math.GetDistanceBetweenCoords3D(racerCoord.x, racerCoord.y, racerCoord.z, nextNode.x, nextNode.y, nextNode.z);
                if (playerDistance > racerDistance)
                    position += 1;
            }
        }
        return position;
    }

}