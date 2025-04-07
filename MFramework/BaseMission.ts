/// Created by wmysterio, 27.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseScript } from "./BaseScript";
import { BaseScriptedScene } from "./BaseScriptedScene";

/** Base class for missions and sub-missions */
export abstract class BaseMission extends BaseScript {

    private baseMissionState: int;
    private baseMissionControllableErrorToForceMissionTermination: Error;
    private baseMissionSubMissionsFunction: Function;
    private baseMissionHasSubMissionsFunction: boolean;
    private baseMissionCashReward: int;
    private baseMissionRespectReward: int;
    private baseMissionTitleText: string;
    private baseMissionIsTitleTextAGxt: boolean;
    private baseMissionDefaultMissionFailureBigMessage: string;
    private baseMissionIsDefaultMissionFailureBigMessageAGxt: boolean;
    private baseMissionEnableMissionFailureBigMessage: boolean;
    private baseMissionDefaultMissionSuccessBigMessage: string;
    private baseMissionIsDefaultMissionSuccessBigMessageAGxt: boolean;
    private baseMissionEnableMissionSuccessBigMessage: boolean;
    private baseMissionMissionFailureReasonMessage: string;
    private baseMissionEnableMissionSuccessTune: boolean;
    private baseMissionEnableMissionFailureTime: int;
    private baseMissionIsMissionFailureReasonMessageAGxt: boolean;
    private baseMissionMissionPassedGxtKey: string;
    private baseMissionHasMissionSuccess: boolean;
    private baseMissionIsScriptedSceneActive: boolean;

    /** Car with handle -1 by default */
    protected playerCar: Car;

    /** The player group */
    protected playerGroup: Group;

    constructor() {
        super();
        this.baseMissionState = 0;
        this.baseMissionControllableErrorToForceMissionTermination = new Error(); // thanks Seemann!
        this.baseMissionSubMissionsFunction = () => { };
        this.baseMissionHasSubMissionsFunction = false;
        this.baseMissionCashReward = 0;
        this.baseMissionRespectReward = 0;
        this.baseMissionTitleText = "DUMMY";
        this.baseMissionIsTitleTextAGxt = true;
        this.baseMissionDefaultMissionFailureBigMessage = "M_FAIL";
        this.baseMissionIsDefaultMissionFailureBigMessageAGxt = true;
        this.baseMissionEnableMissionFailureBigMessage = true;
        this.baseMissionDefaultMissionSuccessBigMessage = "M_PASSD";
        this.baseMissionIsDefaultMissionSuccessBigMessageAGxt = true;
        this.baseMissionEnableMissionSuccessBigMessage = true;
        this.baseMissionMissionFailureReasonMessage = "";
        this.baseMissionEnableMissionSuccessTune = true;
        this.baseMissionEnableMissionFailureTime = 0;
        this.baseMissionIsMissionFailureReasonMessageAGxt = false;
        this.baseMissionMissionPassedGxtKey = "";
        this.baseMissionHasMissionSuccess = false;
        this.baseMissionIsScriptedSceneActive = false;
        this.playerGroup = this.player.getGroup();
        this.playerCar = new Car(-1);
        ONMISSION = true;
        do {
            wait(0);
            if (this.isPlayerNotPlaying())
                this.baseMissionState = 3;
            switch (this.baseMissionState) {
                case 0:
                    this.baseMissionProcessStart();
                    continue;
                case 1:
                    this.baseMissionProcessUpdate();
                    continue;
                case 2:
                    this.baseMissionProcessSuccess();
                    continue;
                case 3:
                    this.baseMissionProcessFailure();
                    continue;
                case 4:
                    this.baseMissionProcessEnd();
                    continue;
            }
        } while (this.baseMissionState !== 5);
    }

    /** Reaction to the mission start event */
    protected onStartEvent(): void { }

    /** Reaction to the mission update event */
    protected onUpdateEvent(): void { }

    /** Reaction to mission success */
    protected onSuccessEvent(): void { }

    /** Reaction to mission failure */
    protected onFailureEvent(): void { }

    /** Reaction to mission cleanup */
    protected onCleanupEvent(): void { }



    /** Begins a scripted scene */
    protected playScriptedScene<TScriptedScene extends BaseScriptedScene>(baseScriptedSceneType: new (bool) => TScriptedScene, debugMode: boolean = false): void {
        if (this.baseMissionIsScriptedSceneActive || this.baseMissionState !== 1)
            return;
        this.baseMissionIsScriptedSceneActive = true;
        new baseScriptedSceneType(debugMode);
        this.baseMissionIsScriptedSceneActive = false;
    }

    /** The current mission will execute the code of the specified mission */
    protected setSubMission<TMission extends BaseMission>(baseMissionType: new () => TMission): void {
        if (this.baseMissionHasSubMissionsFunction || this.baseMissionState !== 0)
            return;
        this.baseMissionHasSubMissionsFunction = true;
        this.baseMissionSubMissionsFunction = () => { return new baseMissionType().HasSuccess(); };
    }

    /** Sets a cash reward on success */
    protected setCashReward(money: int): void {
        this.baseMissionCashReward = money;
    }

    /** Increases respect on success */
    protected setRespectReward(respect: int): void {
        this.baseMissionRespectReward = respect;
    }

    /** Sets the mission title */
    protected setTitle(title: string, gxtKey: boolean = false): void {
        this.baseMissionTitleText = title;
        this.baseMissionIsTitleTextAGxt = gxtKey;
    }

    /** Disables text notification about mission failure */
    protected disableFailureBigMessage(): void {
        this.baseMissionEnableMissionFailureBigMessage = false;
    }

    /** Sets the default text notification for failure mission completion */
    protected setDefaultMissionFailureBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.baseMissionDefaultMissionFailureBigMessage = message;
        this.baseMissionIsDefaultMissionFailureBigMessageAGxt = gxtKey;
    }

    /** Turns off the sound notification about successful mission completion */
    protected disableMissionSuccessTune(): void {
        this.baseMissionEnableMissionSuccessTune = false;
    }

    /** Disables text notification about successful mission completion */
    protected disableMissionSuccessBigMessage(): void {
        this.baseMissionEnableMissionSuccessBigMessage = false;
    }

    /** Sets the default text notification for successful mission completion */
    protected setDefaultMissionSuccessBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.baseMissionDefaultMissionSuccessBigMessage = message;
        this.baseMissionIsDefaultMissionSuccessBigMessageAGxt = gxtKey;
    }

    /** Aborts the mission with a success notification */
    protected complete(missionNameGxt: string = ""): void {
        if (this.baseMissionState === 1) {
            Restart.CancelOverride();
            if (8 > missionNameGxt.length)
                this.baseMissionMissionPassedGxtKey = missionNameGxt;
            this.baseMissionState = 2;
            throw this.baseMissionControllableErrorToForceMissionTermination;
        }
    }

    /** Aborts the mission with a failure notification */
    protected fail(reasonMessage: string = "", failedMessageTime: int = 5000, gxtKey: boolean = false): void {
        if (this.baseMissionState === 1) {
            Restart.CancelOverride();
            if (gxtKey && reasonMessage.length > 7)
                gxtKey = false;
            this.baseMissionIsMissionFailureReasonMessageAGxt = gxtKey;
            this.baseMissionMissionFailureReasonMessage = reasonMessage;
            this.baseMissionEnableMissionFailureTime = failedMessageTime;
            this.baseMissionState = 3;
            throw this.baseMissionControllableErrorToForceMissionTermination;
        }
    }

    /** Sets the restart position in case of player death or arrest */
    protected setRestartPosition(x: float, y: float, z: float, heading: float = 0.0): void {
        if (this.baseMissionState === 0) {
            Restart.OverrideNext(x, y, z, heading);
        }
    }

    /** Checks whether the mission was successful */
    public HasSuccess(): boolean {
        return this.baseMissionHasMissionSuccess;
    }



    private baseMissionProcessStart(): void {
        this.clearText();
        this.onStartEvent();
        if (this.baseMissionHasSubMissionsFunction) {
            this.baseMissionHasMissionSuccess = this.baseMissionSubMissionsFunction();
            this.baseMissionState = 5;
            return;
        }
        Stat.RegisterMissionGiven();
        this.baseMissionMakeWorldComfortable();
        if (this.baseMissionIsTitleTextAGxt) {
            Text.PrintBig(this.baseMissionTitleText, 1000, 2);
        } else {
            Text.PrintBigFormatted(this.baseMissionTitleText, 1000, 2);
        }
        this.baseMissionState = 1;
    }

    private baseMissionProcessUpdate(): void {
        if (!ONMISSION) {
            this.baseMissionState = 3;
            return;
        }
        try {
            this.onUpdateEvent();
        } catch (e) {
            if (e === this.baseMissionControllableErrorToForceMissionTermination)
                return;
            log(e.toString());
            this.baseMissionState = 3;
        }
    }

    private baseMissionProcessSuccess(): void {
        this.baseMissionProcessCleanup();
        if (this.baseMissionMissionPassedGxtKey.length > 1) {
            Stat.RegisterMissionPassed(this.baseMissionMissionPassedGxtKey);
        } else {
            Stat.IncrementIntNoMessage(147, 1);
        }
        if (this.baseMissionEnableMissionSuccessTune)
            Audio.PlayMissionPassedTune(1);
        this.baseMissionDisplaySuccessMessage();
        this.baseMissionState = 4;
        this.baseMissionHasMissionSuccess = true;
        this.onSuccessEvent();
    }
    private baseMissionDisplaySuccessMessage(): void {
        let flag = 0;
        //Stat.PlayerMadeProgress( 1 );
        if (this.baseMissionRespectReward > 0) {
            flag += 1;
            Stat.AwardPlayerMissionRespect(this.baseMissionRespectReward);
        }
        if (this.baseMissionCashReward > 0) {
            flag += 2;
            this.player.addScore(this.baseMissionCashReward);
        }
        if (!this.baseMissionEnableMissionSuccessBigMessage)
            return;
        switch (flag) {
            case 3:
                Text.PrintWithNumberBig("M_PASSS", this.baseMissionCashReward, 5000, 1); // Mission passed +$ +Respect
                return;
            case 2:
                Text.PrintWithNumberBig("M_PASS", this.baseMissionCashReward, 5000, 1); // Mission passed +$
                return;
            case 1:
                Text.PrintBig("M_PASSR", 5000, 1); // Mission passed +Respect
                return;
            default:
                if (this.baseMissionDefaultMissionSuccessBigMessage.length === 0)
                    return;
                if (this.baseMissionIsDefaultMissionSuccessBigMessageAGxt) {
                    Text.PrintBig(this.baseMissionDefaultMissionSuccessBigMessage, 5000, 1);
                    return;
                }
                Text.PrintBigFormatted(this.baseMissionDefaultMissionSuccessBigMessage, 5000, 1);
                return;
        }
    }

    private baseMissionProcessFailure(): void {
        this.baseMissionProcessCleanup();
        this.baseMissionDisplayFailedMessage();
        this.baseMissionState = 4;
        this.onFailureEvent();
    }
    private baseMissionDisplayFailedMessage(): void {
        this.baseMissionDisplayFailureBigMessage();
        if (1 > this.baseMissionEnableMissionFailureTime)
            return;
        if (this.baseMissionIsMissionFailureReasonMessageAGxt && this.baseMissionMissionFailureReasonMessage.length > 0) {
            Text.PrintNow(this.baseMissionMissionFailureReasonMessage, this.baseMissionEnableMissionFailureTime, 1);
            return;
        }
        Text.PrintFormattedNow(this.baseMissionMissionFailureReasonMessage, this.baseMissionEnableMissionFailureTime);
    }
    private baseMissionDisplayFailureBigMessage(): void {
        if (this.baseMissionDefaultMissionFailureBigMessage.length === 0)
            return;
        if (this.baseMissionEnableMissionFailureBigMessage) {
            if (this.baseMissionIsDefaultMissionFailureBigMessageAGxt) {
                Text.PrintBig(this.baseMissionDefaultMissionFailureBigMessage, 5000, 1);
                return;
            }
            Text.PrintBigFormatted(this.baseMissionDefaultMissionFailureBigMessage, 5000, 1);
        }
    }

    private baseMissionProcessCleanup(): void {
        this.clearText();
        this.onCleanupEvent();
    }

    private baseMissionProcessEnd(): void {
        this.resetCamera();
        Mission.Finish();
        /*
        World.SetPedDensityMultiplier(1.0);
        World.SetCarDensityMultiplier(1.0);
        Game.SetWantedMultiplier(1.0);
        Hud.DisplayZoneNames(true);
        Hud.DisplayCarNames(true);
        Game.SetPoliceIgnorePlayer(player, false);
        Game.SetEveryoneIgnorePlayer(player, false);
        Game.SetCreateRandomGangMembers(true);
        Game.SetCreateRandomCops(true);
        Game.EnableAmbientCrime(true);
        Game.SwitchPoliceHelis(true);
        Game.SwitchCopsOnBikes(true);
        Game.SwitchRandomTrains(true);
        Game.SwitchAmbientPlanes(true);
        Game.SwitchEmergencyServices(true);
        Weather.Release();
        */



        this.playerChar.hideWeaponForScriptedCutscene(false).shutUp(false).setCanBeKnockedOffBike(true);
        if (Car.DoesExist(+this.playerCar)) {
            this.playerCar.setProofs(false, false, false, false, false).setCanBurstTires(true).markAsNoLongerNeeded();
            if (!this.playerChar.isInCar(this.playerCar)) {
                this.playerCar.delete();
                this.playerCar = new Car(-1);
            }
        }
        this.player.setGroupRecruitment(true).setControl(true);
        this.playerGroup.remove();
        ONMISSION = false;
        this.baseMissionState = 5;
    }

    private baseMissionMakeWorldComfortable(): void {
        Game.SetCreateRandomGangMembers(false);
        Game.SetCreateRandomCops(false);
        Game.EnableAmbientCrime(false);
        Game.SwitchPoliceHelis(false);
        Game.SwitchCopsOnBikes(false);
        Game.SwitchRandomTrains(false);
        Game.SwitchAmbientPlanes(false);
        Game.SwitchEmergencyServices(false);
        this.player.setGroupRecruitment(false);
        this.playerGroup.remove();
    }

}