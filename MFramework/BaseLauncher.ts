/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseMission } from "./BaseMission";
import { BaseScript } from "./BaseScript";
import { Save } from "./Save";

//@ts-ignore
Save.SetDefaultIniSectionName(__LauncherNameInternal__);

/** Base class for the mission launcher (starter) */
export abstract class BaseLauncher extends BaseScript {

    private baseLauncherStatus: int;
    private baseLauncherSphereRadius: int;
    private baseLauncherRadarSprite: int;
    private baseLauncherPositionX: float;
    private baseLauncherPositionY: float;
    private baseLauncherPositionZ: float;
    private baseLauncherBlip: Blip;
    private baseLauncherHasSuccessInMission: boolean;
    private baseLauncherRunMissionFunction: Function;
    private baseLauncherLeftHour: int;
    private baseLauncherRightHour: int;
    private baseLauncherUseTimeRange: boolean;
    private baseLauncherHasLongRange: boolean;

    /**
     * @param baseMissionType Specify the name of the type that will be used as the default mission
     */
    constructor(baseMissionType: new () => BaseMission) {
        super();
        this.baseLauncherReset();
        this.baseLauncherBlip = new Blip(-1);
        this.baseLauncherHasSuccessInMission = false;
        this.baseLauncherRunMissionFunction = () => {
            return new baseMissionType().HasSuccess();
        };
        do {
            wait(0);
            if (this.isPlayerNotPlaying()) {
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

    /** Reaction to the launcher start event */
    protected onStartEvent(): void { }

    /**
     * Reaction to the blip creation check event
     * @returns Returns true if the blip can be created
     */
    protected onBlipCreationEvent(): boolean {
        return true;
    }

    /**
     * Reaction to the mission launch check event
     * @returns Returns true if the mission can be started
     */
    protected onMissionLaunchEvent(): boolean {
        return true;
    }

    /**
     * Reaction to mission end event
     * @param hasSuccess Completed mission status
     * @returns Returns true if the launcher can be started again
     */
    protected onMissionEndEvent(hasSuccess: boolean): boolean {
        return !hasSuccess;
    }



    /** Sets a new mission launch position */
    protected setPosition(x: float, y: float, z: float): void {
        this.baseLauncherPositionX = x;
        this.baseLauncherPositionY = y;
        this.baseLauncherPositionZ = z;
    }

    /** Sets a new radar icon for the mission */
    protected setRadarSprite(radarSpriteId: int): void {
        this.baseLauncherRadarSprite = radarSpriteId;
    }

    /** Sets the radius of the cylinder along the X and Y axes */
    protected setSphereRadius(sphereRadius: float): void {
        this.baseLauncherSphereRadius = sphereRadius;
    }

    /** Sets the clock hour range when the mission can start */
    protected setClockHourRange(left: int, right: int): void {
        this.baseLauncherUseTimeRange = true;
        this.baseLauncherLeftHour = left;
        this.baseLauncherRightHour = right;
    }

    /** Makes the blip range short */
    protected disableBlipLongRange(): void {
        this.baseLauncherHasLongRange = false;
    }



    private baseLauncherProcessStart(): void {
        this.onStartEvent();
        this.baseLauncherStatus = 1;
    }

    private baseLauncherProcessWaitBlip(): void {
        if (!this.onBlipCreationEvent()) {
            wait(1499);
            return;
        }
        if (this.baseLauncherHasLongRange) {
            this.baseLauncherBlip = Blip.AddSpriteForContactPoint(this.baseLauncherPositionX, this.baseLauncherPositionY, this.baseLauncherPositionZ, this.baseLauncherRadarSprite);
        } else {
            this.baseLauncherBlip = Blip.AddShortRangeSpriteForContactPoint(this.baseLauncherPositionX, this.baseLauncherPositionY, this.baseLauncherPositionZ, this.baseLauncherRadarSprite);
        }
        this.baseLauncherBlip.changeDisplay(2);
        this.baseLauncherStatus = 2;
    }

    private baseLauncherProcessWaitMission(): void {
        if (!this.playerChar.locateAnyMeans3D(this.baseLauncherPositionX, this.baseLauncherPositionY, this.baseLauncherPositionZ, 40.0, 40.0, 40.0, false)) {
            wait(249);
            return;
        }
        if (Camera.GetFadingStatus() || ONMISSION || !this.player.isControlOn()) {
            wait(249);
            return;
        }
        if (!this.playerChar.locateAnyMeans3D(this.baseLauncherPositionX, this.baseLauncherPositionY, this.baseLauncherPositionZ, this.baseLauncherSphereRadius, this.baseLauncherSphereRadius, 2.0, true) || this.player.isUsingJetpack())
            return;
        if (this.baseLauncherUseTimeRange && !this.isClockHourInRange(this.baseLauncherLeftHour, this.baseLauncherRightHour)) {
            if (!Text.IsMessageBeingDisplayed())
                Text.PrintFormattedNow("You can start this mission between %.2d:00 and %.2d:00.", 5000, this.baseLauncherLeftHour, this.baseLauncherRightHour);
            return;
        }
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
        this.baseLauncherReset();
    }

    private baseLauncherSwitchFxtFile(toLoading: boolean): void {
        let fxtFilePath = __dirname + "\\Launchers\\" + Save.GetCurrentIniSectionName() + ".fxt";
        if (Fs.DoesFileExist(fxtFilePath))
            (toLoading ? Text.LoadFxt : Text.UnloadFxt)(fxtFilePath);
    }

    private baseLauncherReset(): void {
        this.baseLauncherStatus = 0;
        this.baseLauncherSphereRadius = 1.6;
        this.baseLauncherRadarSprite = 15;
        this.baseLauncherPositionX = 0.0;
        this.baseLauncherPositionY = 0.0;
        this.baseLauncherPositionZ = 0.0;
        this.baseLauncherLeftHour = 0;
        this.baseLauncherRightHour = 0;
        this.baseLauncherUseTimeRange = false;
        this.baseLauncherHasLongRange = true;
    }

}