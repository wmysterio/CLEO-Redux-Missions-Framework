/// Created by wmysterio, 13.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { BaseRaceMission } from "./Core/BaseRaceMission";
import { RouteNode } from "./Core/RouteNode";
import { StreetRacer } from "./Core/StreetRacer";

/** A base class that implements a race in the "speed trap" mode */
export abstract class BaseSpeedTrapRace extends BaseRaceMission {

    private baseSpeedTrapRaceIsFirstCalculation: boolean;
    private baseSpeedTrapRaceNumStreetRacers: int;
    private baseSpeedTrapRacePlayerStreetRacer: StreetRacer;
    private baseSpeedTrapRacePlayerStreetRacerIndex: int;
    private baseSpeedTrapRaceNumLaps: int;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseSpeedTrapRaceNumLaps = 1;
        this.baseSpeedTrapRaceIsFirstCalculation = true;
        this.baseSpeedTrapRaceNumStreetRacers = 0;
        this.baseSpeedTrapRacePlayerStreetRacer = undefined;
        this.baseSpeedTrapRacePlayerStreetRacerIndex = -1;
        this.makeCheckpointTuneAsCameraShot();
    }

    /** The minimum number of race laps is not less than 1 */
    protected setNumberOfRaceLaps(numLaps: int): void {
        this.baseSpeedTrapRaceNumLaps = 1 > numLaps ? 1 : numLaps;
    }

    protected onStreetRacerCheckpointPassedEvent(streetRacer: StreetRacer, lastNode: RouteNode): void {
        if (!streetRacer.isPlayer || this.baseSpeedTrapRaceNumLaps > (streetRacer.currentLap + 1))
            return;
        if (this.getLastCheckpointId() === this.findNextCheckpointId(lastNode.checkpointId))
            this.markAllCheckpointsAsFinish();
    }

    protected onStreetRacerLapPassedEvent(streetRacer: StreetRacer, lastLap: int): void {
        if (this.baseSpeedTrapRaceNumLaps > lastLap)
            return;
        this.recalculateSpeeds(streetRacer.id);
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        if (this.baseSpeedTrapRaceIsFirstCalculation) {
            this.baseSpeedTrapRaceIsFirstCalculation = false;
            let streetRacers = this.getStreetRacers();
            this.baseSpeedTrapRaceNumStreetRacers = streetRacers.length;
            for (let i = 0; i < this.baseSpeedTrapRaceNumStreetRacers; ++i) {
                if (streetRacers[i].isPlayer) {
                    this.baseSpeedTrapRacePlayerStreetRacerIndex = i;
                    this.baseSpeedTrapRacePlayerStreetRacer = streetRacers[i];
                    break;
                }
            }
        }
        Hud.DrawRect(540.0, 346.2812, 138.2072, 94.2072, 0, 0, 0, 255);
        Hud.DrawRect(540.0, 346.2812, 136.2072, 92.2072, 134, 155, 184, 255);
        Hud.DrawRect(540.0, 346.2812, 132.2072, 90.2072, 0, 0, 0, 255);
        Text.SetFont(3);
        Text.SetScale(1.0, 3.6);
        Text.SetRightJustify(true);
        Text.SetWrapX(640.0);
        Text.SetDropshadow(2, 0, 0, 0, 180);
        Text.SetColor(134, 155, 184, 255);
        Text.DisplayWithNumber(600.0, 357.0, "RACES44", this.baseSpeedTrapRaceGetPlayerPosition());
        Text.SetScale(0.7, 2.0);
        Text.SetRightJustify(true);
        Text.SetWrapX(640.0);
        Text.SetColor(134, 155, 184, 255);
        Text.DisplayWith2Numbers(600.0, 326.0, "RACES32", this.baseSpeedTrapRacePlayerStreetRacer.currentLap + 1, this.baseSpeedTrapRaceNumLaps);
        Text.SetScale(0.7, 2.0);
        Text.SetRightJustify(true);
        Text.SetWrapX(640.0);
        Text.SetColor(134, 155, 184, 255);
        Text.DisplayWithNumber(600.0, 306.0, "KICK1_9", this.baseSpeedTrapRacePlayerStreetRacer.summOfSpeed);
    }



    private baseSpeedTrapRaceGetPlayerPosition(): int {
        let position = 1;
        for (let i = 0; i < this.baseSpeedTrapRaceNumStreetRacers; ++i) {
            if (this.baseSpeedTrapRacePlayerStreetRacerIndex === i)
                continue;
            let currentStreetRacer = this.getStreetRacer(i);
            if (currentStreetRacer.summOfSpeed > this.baseSpeedTrapRacePlayerStreetRacer.summOfSpeed)
                position += 1;
        }
        return position;
    }

    private recalculateSpeeds(winnerStreetRacerId: int): void {
        let lastCheckpointId = this.getLastCheckpointId();
        for (let i = 0; i < this.baseSpeedTrapRaceNumStreetRacers; ++i) {
            if (winnerStreetRacerId === i || this.baseSpeedTrapRacePlayerStreetRacerIndex === i)
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
        for (let i = 0; i < this.baseSpeedTrapRaceNumStreetRacers; ++i) {
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