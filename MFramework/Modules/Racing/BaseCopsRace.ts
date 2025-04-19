/// Created by wmysterio, 18.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../../.././.config/sa.d.ts" />

import { Timer } from "../Timer";
import { BaseRaceMission } from "./Core/BaseRaceMission";

/** Base class implementing catch-up with cops */
export abstract class BaseCopsRace extends BaseRaceMission {

    private baseCopsRaceStage: int;
    private baseCopsRaceFailedWantedLevel: int;
    private baseCopsRaceTimeMinimum: int;
    private baseCopsRaceTimer: Timer;
    private baseCopsRaceMandatoryToAvoidPolice: boolean;
    private baseCopsRaceStartGxt: string;
    private baseCopsRaceLostWantedGxt: string;
    private baseCopsRaceClearWantedGxt: string;

    protected onInitEvent(): void {
        super.onInitEvent();
        this.baseCopsRaceTimer = new Timer(10000);
        this.baseCopsRaceStage = 0;
        this.baseCopsRaceFailedWantedLevel = 1;
        this.disablePlayerCheckpointsChek();
        this.baseCopsRaceMandatoryToAvoidPolice = false;
        this.savePlayerWeapon();
        this.loadWeaponModelsNow(29);
        this.playerChar.giveWeapon(29, 9999);
        this.unloadWeaponModels(29);
        this.baseCopsRaceStartGxt = "";
        this.baseCopsRaceLostWantedGxt = "RACEFA";
        this.baseCopsRaceClearWantedGxt = "RYD3_I";
        this.setRaceTraffic(0.0, 0.0, true, 1.0);
    }

    /** Overrides the startup message */
    protected overrideStartMessage(gxtKey: string): void {
        if (1 > gxtKey.length || gxtKey.length > 7)
            return;
        this.baseCopsRaceStartGxt = gxtKey;
    }

    /** Overrides the message when the wanted level is lost */
    protected overrideLostWantedMessage(gxtKey: string): void {
        if (1 > gxtKey.length || gxtKey.length > 7)
            return;
        this.baseCopsRaceLostWantedGxt = gxtKey;
    }

    /** Overrides the message about the need to clear the wanted level */
    protected overrideClearWantedMessage(gxtKey: string): void {
        if (1 > gxtKey.length || gxtKey.length > 7)
            return;
        this.baseCopsRaceClearWantedGxt = gxtKey;
    }

    /** Sets the minimum time the police want level is maintained */
    protected setTimeMinimum(timeInMilliseconds: int): void {
        this.baseCopsRaceTimeMinimum = timeInMilliseconds;
    }

    /** Sets the minimum wanted level required to hold */
    protected setFailedWanted(wantedLevel: int): void {
        if (1 > wantedLevel)
            wantedLevel = 1;
        if (wantedLevel > 5)
            wantedLevel = 5;
        this.baseCopsRaceFailedWantedLevel = wantedLevel;
    }

    /** Make it mandatory to avoid the police */
    protected makeMandatoryToAvoidPolice(): void {
        this.baseCopsRaceMandatoryToAvoidPolice = true;
    }

    protected setRaceTraffic(cars: float, peds: float, cops?: boolean, wantedMultiplier?: float): void {
        super.setRaceTraffic(cars, peds, true, wantedMultiplier);
    }

    protected canMarkCheckpointsAsFinish(): boolean {
        return false;
    }

    protected onDrawInfoEvent(): void {
        super.onDrawInfoEvent();
        switch (this.baseCopsRaceStage) {
            case 0:
                this.baseCopsRaceTimer.set(this.baseCopsRaceTimeMinimum);
                this.player.alterWantedLevel(this.baseCopsRaceFailedWantedLevel);
                if (this.baseCopsRaceStartGxt.length > 0) {
                    Text.PrintNow(this.baseCopsRaceStartGxt, 6000, 1);
                } else {
                    Text.PrintNow("GYM1_6" + this.baseCopsRaceFailedWantedLevel.toString(), 5000, 1);
                }
                this.baseCopsRaceStage = 1;
                return;
            case 1:
                let minutes = this.baseCopsRaceTimer.getMinutesLeft();
                let seconds = this.baseCopsRaceTimer.getSecondsLeft();
                Timer.Display(minutes, seconds);
                if (this.baseCopsRaceFailedWantedLevel > this.player.storeWantedLevel()) {
                    this.fail(this.baseCopsRaceLostWantedGxt, 5000, true);
                    return;
                }
                if (this.baseCopsRaceTimer.getMillisecondsLeft() > 1)
                    return;
                if (this.baseCopsRaceMandatoryToAvoidPolice) {
                    if (1 > this.baseCopsRaceClearWantedGxt.length)
                        Text.LoadMissionText("RYDER3");
                    Text.PrintNow(this.baseCopsRaceClearWantedGxt, 6000, 1);
                    this.baseCopsRaceStage = 2;
                    return;
                }
                this.baseCopsRaceStage = 3;
                return;
            case 2:
                if (this.player.storeWantedLevel() === 0)
                    this.baseCopsRaceStage = 3;
                return;
            case 3:
                Text.LoadMissionText("RACETOR");
                this.player.clearWantedLevel();
                this.complete();
                return;
        }
    }

}