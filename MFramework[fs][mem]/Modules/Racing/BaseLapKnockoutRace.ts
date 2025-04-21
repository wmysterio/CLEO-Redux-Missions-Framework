/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { Screen } from "../../Screen";
import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RouteNode } from "./Core/RouteNode";
import { StreetRacer } from "./Core/StreetRacer";

/** Basic class implementing a knockout race. The number of laps depends on the number of racers */
export abstract class BaseLapKnockoutRace extends BaseRaceMission {

    private baseLapKnockoutRaceIsFirstCalculation: boolean;
    private baseLapKnockoutRaceNumStreetRacers: int;
    private baseLapKnockoutRacePlayerStreetRacer: StreetRacer;
    private baseLapKnockoutRacePlayerStreetRacerIndex: int;
    private baseLapKnockoutRaceNumLaps: int;
    private baseLapKnockoutRaceSafeZPositionForCars: float;
    private baseLapKnockoutRaceRandomNames: int[];

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseLapKnockoutRaceNumLaps = 1;
        this.baseLapKnockoutRaceIsFirstCalculation = true;
        this.baseLapKnockoutRaceNumStreetRacers = 0;
        this.baseLapKnockoutRacePlayerStreetRacer = undefined;
        this.baseLapKnockoutRacePlayerStreetRacerIndex = -1;
        this.baseLapKnockoutRaceSafeZPositionForCars = -1000.0;
        this.baseLapKnockoutRaceRandomNames = new Array<int>();
        for (let i = 0; i < 10; ++i)
            this.baseLapKnockoutRaceRandomNames.push(i);
        for (let i = 0; i < 80; ++i) {
            let left = 9 * Math.random();
            let temp = this.baseLapKnockoutRaceRandomNames[0];
            this.baseLapKnockoutRaceRandomNames[0] = this.baseLapKnockoutRaceRandomNames[left];
            this.baseLapKnockoutRaceRandomNames[left] = temp;
        }
        FxtStore.insert("NAMEKNO", "~d~ ~a~ ~d~", false);
    }

    protected onCleanupEvent(): void {
        super.onCleanupEvent();
        FxtStore.delete("NAMEKNO", false);
    }

    protected canMarkCheckpointsAsFinish(): boolean {
        return false;
    }

    protected onStreetRacerCheckpointPassedEvent(streetRacer: StreetRacer, lastNode: RouteNode): void {
        if (!streetRacer.isPlayer || this.baseLapKnockoutRaceNumLaps > (streetRacer.currentLap + 1))
            return;
        if (this.getLastCheckpointId() === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    protected onStreetRacerLapPassedEvent(streetRacer: StreetRacer, lastLap: int): void {
        let isKnocked = true;
        for (let i = 0; i < this.baseLapKnockoutRaceNumStreetRacers; ++i) {
            let racer = this.getStreetRacer(i);
            if (racer.isKnockedOut) // || streetRacer.id === i
                continue;
            if (lastLap > racer.currentLap) {
                isKnocked = false;
                break;
            }
        }
        if (isKnocked) {
            if (streetRacer.isPlayer) {
                this.fail("RACEFA", 5000, true);
                return;
            }
            this.hideStreetRacerBlip(streetRacer.id);
            streetRacer.isKnockedOut = true;
            this.baseLapKnockoutRaceSafeZPositionForCars -= 10.0;
            streetRacer.char.setProofs(true, true, true, true, true).clearTasks();
            streetRacer.car.setProofs(true, true, true, true, true).setRotationVelocity(0.0, 0.0, 0.0)
                .setCoordinates(0.0, 0.0, this.baseLapKnockoutRaceSafeZPositionForCars)
                .freezePositionAndDontLoadCollision(true);
            if (this.baseLapKnockoutRaceRandomNames.length > 0) {
                let gxtKey = "CRED61" + this.baseLapKnockoutRaceRandomNames.pop();
                Text.PrintStringInStringNow("NAMEKNO", gxtKey, 4000, 1);
            }
            return;
        }
        if (this.baseLapKnockoutRaceNumLaps > lastLap)
            return;
        if (streetRacer.isPlayer) {
            this.complete();
        } else {
            this.fail("RACEFA", 5000, true);
        }
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        if (this.baseLapKnockoutRaceIsFirstCalculation) {
            this.baseLapKnockoutRaceIsFirstCalculation = false;
            let streetRacers = this.getStreetRacers();
            this.baseLapKnockoutRaceNumStreetRacers = streetRacers.length;
            this.baseLapKnockoutRaceNumLaps = this.baseLapKnockoutRaceNumStreetRacers - 1;
            for (let i = 0; i < this.baseLapKnockoutRaceNumStreetRacers; ++i) {
                if (streetRacers[i].isPlayer) {
                    this.baseLapKnockoutRacePlayerStreetRacerIndex = i;
                    this.baseLapKnockoutRacePlayerStreetRacer = streetRacers[i];
                    break;
                }
            }
        }
        Screen.DisplayCounter(this.baseLapKnockoutRaceGetPlayerPosition(), 1, "RACES44");
        if (this.baseLapKnockoutRaceNumLaps > 1)
            Screen.DisplayCounterWith2Numbers(this.baseLapKnockoutRacePlayerStreetRacer.currentLap + 1, this.baseLapKnockoutRaceNumLaps, "RACES32", 2);
    }



    private baseLapKnockoutRaceGetPlayerPosition(): int {
        let position = 1;
        let currentPlayerCheckpointId = this.baseLapKnockoutRacePlayerStreetRacer.nextNodeId;
        for (let i = 0; i < this.baseLapKnockoutRaceNumStreetRacers; ++i) {
            if (this.baseLapKnockoutRacePlayerStreetRacerIndex === i)
                continue;
            let currentStreetRacer = this.getStreetRacer(i);
            if (currentStreetRacer.currentLap > this.baseLapKnockoutRacePlayerStreetRacer.currentLap) {
                position += 1;
            } else if (currentStreetRacer.currentLap === this.baseLapKnockoutRacePlayerStreetRacer.currentLap) {
                let currentStreetRacerCheckpointId = currentStreetRacer.nextNodeId;
                if (!this.isRouteNodeACheckpoint(currentStreetRacerCheckpointId))
                    currentStreetRacerCheckpointId = this.findNextCheckpointId(currentStreetRacerCheckpointId);
                if (currentStreetRacerCheckpointId > currentPlayerCheckpointId) {
                    position += 1;
                } else if (currentStreetRacerCheckpointId === currentPlayerCheckpointId) {
                    let playerCoord = this.baseLapKnockoutRacePlayerStreetRacer.car.getCoordinates();
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