/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseMission } from "./BaseMission";
import { Save } from "./Save";
import { player, playerChar, isPlayerNotPlaying } from "./Utils";

//@ts-ignore
Save.SetDefaultIniSectionName(__MissionNameInternal__);

/** Base class for starting missions (starter) */
export abstract class BaseLauncher {

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
     * Reaction to mission end event
     * @param hasSuccess Completed mission status
     * @returns Returns true if the launcher can be started again
     */
    protected onMissionEndEvent(hasSuccess: boolean): boolean { return true; }

    /**
     * Sets a new mission launch position
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     */
    protected setPosition(x: float, y: float, z: float): void {
        this.baseLauncherPositionX = x;
        this.baseLauncherPositionY = y;
        this.baseLauncherPositionZ = z;
    }

    /**
     * Sets a new radar icon for the mission
     * @param radarSprite Radar icon ID
     */
    protected setRadarSprite(radarSprite: int): void {
        this.baseLauncherRadarSprite = radarSprite;
    }

    /**
     * Sets the radius of the cylinder along the X and Y axes
     * @param sphereRadius New radius
     */
    protected setSphereRadius(sphereRadius: float): void {
        this.baseLauncherSphereRadius = sphereRadius;
    }



    /**
     * @param baseMissionType Specify the name of the type that will be used as the default mission
     */
    constructor(baseMissionType: new () => BaseMission) {
        this.baseLauncherRunMissionFunction = () => {
            return new baseMissionType().HasSuccess();
        };
        do {
            wait(0);
            if (isPlayerNotPlaying()) {
                wait(499);
                continue;
            }
            switch (this.baseLauncherStatus) {
                case 0:
                    this.baseLauncherProcessStart();
                    continue;
                case 1:
                    this.baseLauncherProcessWaitBlip();
                    continue;
                case 2:
                    this.baseLauncherProcessWaitMission();
                    continue;
                case 3:
                    this.baseLauncherProcessMissionEnd();
                    continue;
            }
        } while (this.baseLauncherStatus !== 4);
    }

    //----------------------------------------------------------------------------------------------------

    private baseLauncherStatus: int = 0;
    private baseLauncherSphereRadius: int = 1.25;
    private baseLauncherRadarSprite: int = 15;
    private baseLauncherPositionX: float = 0.0;
    private baseLauncherPositionY: float = 0.0;
    private baseLauncherPositionZ: float = 0.0;
    private baseLauncherBlip: Blip = new Blip(-1);

    private baseLauncherHasSuccessInMission: boolean = false;
    private baseLauncherRunMissionFunction: () => boolean;

    //----------------------------------------------------------------------------------------------------

    private baseLauncherProcessStart(): void {
        this.onStartEvent();
        this.baseLauncherStatus = 1;
    }

    private baseLauncherProcessWaitBlip(): void {
        if (!this.onBlipCreationEvent()) {
            wait(1499);
            return;
        }
        this.baseLauncherBlip = Blip.AddSpriteForCoord(this.baseLauncherPositionX, this.baseLauncherPositionY, this.baseLauncherPositionZ, this.baseLauncherRadarSprite);
        this.baseLauncherBlip.changeDisplay(2);
        this.baseLauncherStatus = 2;
    }

    private baseLauncherProcessWaitMission(): void {
        if (!playerChar.locateAnyMeans3D(this.baseLauncherPositionX, this.baseLauncherPositionY, this.baseLauncherPositionZ, 40.0, 40.0, 40.0, false)) {
            wait(249);
            return;
        }
        if (Camera.GetFadingStatus() || ONMISSION || !player.isControlOn()) {
            wait(249);
            return;
        }
        if (!playerChar.locateAnyMeans3D(this.baseLauncherPositionX, this.baseLauncherPositionY, this.baseLauncherPositionZ, this.baseLauncherSphereRadius, this.baseLauncherSphereRadius, 2.0, true) || player.isUsingJetpack())
            return;
        if (!this.onMissionLaunchEvent())
            return;
        if (this.baseLauncherBlip !== undefined && Blip.DoesExist(+this.baseLauncherBlip))
            this.baseLauncherBlip.remove();
        this.baseLauncherSwitchFxtFile(true);
        this.baseLauncherHasSuccessInMission = this.baseLauncherRunMissionFunction();
        this.baseLauncherStatus = 3;
    }

    private baseLauncherProcessMissionEnd(): void {
        this.baseLauncherStatus = this.onMissionEndEvent(this.baseLauncherHasSuccessInMission) ? 0 : 4;
        this.baseLauncherSwitchFxtFile(false);
        this.baseLauncherHasSuccessInMission = false;
    }

    private baseLauncherSwitchFxtFile(toLoading: boolean): void {
        let fxtFilePath = __dirname + "\\Missions\\" + Save.GetCurrentIniSectionName() + ".fxt";
        if (Fs.DoesFileExist(fxtFilePath))
            (toLoading ? Text.LoadFxt : Text.UnloadFxt)(fxtFilePath);
    }

}