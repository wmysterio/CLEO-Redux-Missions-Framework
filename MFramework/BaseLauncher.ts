/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseSave } from "./BaseSave";
import { player, playerChar, isPlayerNotPlaying } from "./Utils";

/** Base class for starting missions (starter) */
export abstract class BaseLauncher extends BaseSave {

    /** Reaction to the launcher start event */
    protected onStartEvent(): void { }

    /**
     * Reaction to the blip creation check event
     * @returns Returns true if the blip can be created
     */
    protected onBlipCreationEvent(): boolean { return true; }

    /**
     * Reaction to the mission launch check event
     * @returns Returns true if the mission can be started
     */
    protected onMissionLaunchEvent(): boolean { return true; }

    /**
     * Sets a new mission launch position
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     */
    protected setPosition(x: float, y: float, z: float): void {
        this.positionX = x;
        this.positionY = y;
        this.positionZ = z;
    }

    /**
     * Sets a new radar icon for the mission
     * @param radarSprite Radar icon ID
     */
    protected setRadarSprite(radarSprite: int): void {
        this.radarSprite = radarSprite;
    }

    constructor() {
        ///@ts-ignore
        super(__MissionMameInternal__);
        do {
            wait(0);
            if (isPlayerNotPlaying()) {
                wait(499);
                continue;
            }
            switch (this.launcherStatus) {
                case 0:
                    this.processStart();
                    continue;
                case 1:
                    this.processBlipCreation();
                    continue;
                case 2:
                    this.processMissionLaunch();
                    continue;
            }
        } while (this.launcherStatus !== 3);
    }

    //----------------------------------------------------------------------------------------------------

    private launcherStatus: int = 0;
    private radarSprite: int = 15;
    private positionX: float = 0.0;
    private positionY: float = 0.0;
    private positionZ: float = 0.0;
    private blip: Blip = undefined;

    //----------------------------------------------------------------------------------------------------

    private processStart(): void {
        this.onStartEvent();
        this.launcherStatus = 1;
    }

    private processBlipCreation(): void {
        if (!this.onBlipCreationEvent()) {
            wait(1499);
            return;
        }
        this.blip = Blip.AddSpriteForCoord(this.positionX, this.positionY, this.positionZ, this.radarSprite);
        this.blip.changeDisplay(2);
        this.launcherStatus = 2;
    }

    private processMissionLaunch(): void {
        if (!playerChar.locateAnyMeans3D(this.positionX, this.positionY, this.positionZ, 40.0, 40.0, 40.0, false)) {
            wait(249);
            return;
        }
        if (Camera.GetFadingStatus() || ONMISSION || !player.isControlOn()) {
            wait(249);
            return;
        }
        if (!playerChar.locateAnyMeans3D(this.positionX, this.positionY, this.positionZ, 1.25, 1.25, 2.0, true) || player.isUsingJetpack())
            return;
        if (!this.onMissionLaunchEvent())
            return;
        if (this.blip !== undefined)
            this.blip.remove();
        ///@ts-ignore
        CLEO.runScript(__MissionFilePathInternal__, { __MissionMameInternal__: __MissionMameInternal__, __MissionFilePathInternal__: __MissionFilePathInternal__, __LauncherFilePathInternal__: __LauncherFilePathInternal__ });
        this.launcherStatus = 3;
    }

}