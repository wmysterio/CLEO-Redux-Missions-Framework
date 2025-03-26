/// Created by wmysterio, 27.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseSave } from "./BaseSave";
import { player, playerGroup, isPlayerNotPlaying } from "./Utils";

/** Base class for missions and sub-missions */
export abstract class BaseMission extends BaseSave {

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

    /** Clear the screen of all text */
    protected clearText(): void {
        Text.ClearThisPrintBigNow(1);
        Text.ClearThisPrintBigNow(2);
        Text.ClearHelp();
        Text.ClearPrints();
        Text.ClearSmallPrints();
    }

    /**
     * Allows you to add sub-missions via a function
     * @param subMissionsFunction Function for creating sub-missions
     */
    protected setSubMissions(subMissionsFunction: () => void): void {
        if (this.hasSubMissionsFunction || this.missionState !== 0)
            return;
        this.hasSubMissionsFunction = true;
        this.subMissionsFunction = subMissionsFunction;
    }

    /**
     * Sets a cash reward on success.
     * @param money Reward
     */
    protected setCashReward(money: int): void { this.cashReward = money; }

    /**
     * Increases respect on success
     * @param money Reward
     */
    protected setRespectReward(respect: int): void { this.respectReward = respect; }

    /**
     * Sets the mission title
     * @param title The text that is shown at the beginning of the mission
     * @param gxtKey Set true if the text is a GXT key
     */
    protected setTitle(title: string, gxtKey: boolean = false): void {
        this.titleText = title;
        this.isTitleTextAGxt = gxtKey;
    }

    /** Disables text notification about mission failure */
    protected disableFailureBigMessage(): void { this.enableMissionFailureBigMessage = false; }

    /**
     * Sets the default text notification for failure mission completion
     * @param message Notification text
     * @param gxtKey Set true if the text is a GXT key
     */
    protected setDefaultMissionFailureBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.defaultMissionFailureBigMessage = message;
        this.isDefaultMissionFailureBigMessageAGxt = gxtKey;
    }

    /** Turns off the sound notification about successful mission completion */
    protected disableMissionSuccessTune(): void { this.enableMissionSuccessTune = false; }

    /** Disables text notification about successful mission completion */
    protected disableMissionSuccessBigMessage(): void { this.enableMissionSuccessBigMessage = false; }

    /**
     * Sets the default text notification for successful mission completion
     * @param message Notification text
     * @param gxtKey Set true if the text is a GXT key
     */
    protected setDefaultMissionSuccessBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.defaultMissionSuccessBigMessage = message;
        this.isDefaultMissionSuccessBigMessageAGxt = gxtKey;
    }

    /** Aborts the mission with a success notification */
    protected complete(): void {
        if (this.missionState === 1) {
            this.missionState = 2;
            throw this.controllableErrorToForceMissionTermination;
        }
    }

    /** Aborts the mission with a failure notification */
    protected fail(reasonMessage: string = "", failedMessageTime: int = 5000, gxtKey: boolean = false): void {
        if (this.missionState === 1) {
            if (gxtKey && reasonMessage.length > 7)
                gxtKey = false;
            this.isMissionFailureReasonMessageAGxt = gxtKey;
            this.missionFailureReasonMessage = reasonMessage;
            this.missionFailureTime = failedMessageTime;
            this.missionState = 3;
            throw this.controllableErrorToForceMissionTermination;
        }
    }

    /** Prevents this mission's launcher from running */
    protected disableMissionLauncher(): void { this.enableMissionLauncher = false; }

    /** Returns the camera behavior to default mode */
    protected makeCameraBehaviorDefault(): void {
        Camera.RestoreJumpcut();
        Camera.SetBehindPlayer();
    }

    /**
     * Sets the camera fixed position
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     */
    protected setCameraPosition(x: float, y: float, z: float): void { Camera.SetFixedPosition(x, y, z, 0.0, 0.0, 0.0); }

    /**
     * Loads a scene and requests a collision at point
     * @param x Position on the x axis
     * @param y Position on the y axis
     * @param z Position on the z axis
     */
    protected refresh_area(x: float, y: float, z: float): void {
        Streaming.RequestCollision(x, y);
        Streaming.LoadScene(x, y, z);
    }


    constructor() {
        ///@ts-ignore
        super(__MissionMameInternal__);
        do {
            wait(0);
            if (isPlayerNotPlaying())
                this.missionState = 3;
            switch (this.missionState) {
                case 0:
                    this.processStart();
                    continue;
                case 1:
                    this.processUpdate();
                    continue;
                case 2:
                    this.processSuccess();
                    continue;
                case 3:
                    this.processFailure();
                    continue;
                case 4:
                    this.processEnd();
                    continue;
            }
        } while (this.missionState !== 5);
    }

    //----------------------------------------------------------------------------------------------------

    private missionState: int = 0;
    private controllableErrorToForceMissionTermination: Error = new Error(); // thanks Seemann!
    private subMissionsFunction: Function = undefined;
    private hasSubMissionsFunction: boolean = false;
    private cashReward: int = 0;
    private respectReward: int = 0;
    private titleText: string = "DUMMY";
    private isTitleTextAGxt: boolean = true;
    private defaultMissionFailureBigMessage: string = "M_FAIL";
    private isDefaultMissionFailureBigMessageAGxt: boolean = true;
    private enableMissionFailureBigMessage: boolean = true;
    private defaultMissionSuccessBigMessage: string = "M_PASSD";
    private isDefaultMissionSuccessBigMessageAGxt: boolean = true;
    private enableMissionSuccessBigMessage: boolean = true;
    private missionFailureReasonMessage: string = "";
    private enableMissionSuccessTune: boolean = true;
    private missionFailureTime: int = 0;
    private isMissionFailureReasonMessageAGxt: boolean = false;
    private missionPassedGxtKey: string = "";
    private enableMissionLauncher: boolean = true;

    //----------------------------------------------------------------------------------------------------

    private processStart(): void {
        this.clearText();
        this.onStartEvent();
        if (this.hasSubMissionsFunction) {
            this.subMissionsFunction();
            this.missionState = 5;
            return;
        }
        Stat.RegisterMissionGiven();
        this.setWorldComfortableForMission(true);
        if (this.isTitleTextAGxt) {
            Text.PrintBig(this.titleText, 1000, 2);
        } else {
            Text.PrintBigFormatted(this.titleText, 1000, 2);
        }
        this.missionState = 1;
    }

    private processUpdate(): void {
        if (!ONMISSION) {
            this.missionState = 3;
            return;
        }
        try {
            this.onUpdateEvent();
        } catch (e) {
            if (e !== this.controllableErrorToForceMissionTermination)
                throw e;
        }
    }

    private processSuccess(): void {
        this.processCleanup();
        if (this.missionPassedGxtKey.length > 1)
            Stat.RegisterMissionPassed(this.missionPassedGxtKey);
        if (this.enableMissionSuccessTune)
            Audio.PlayMissionPassedTune(1);
        this.displaySuccessMessage();
        this.missionState = 4;
        this.onSuccessEvent();
    }
    private displaySuccessMessage(): void {
        let flag = 0;
        //Stat.PlayerMadeProgress( 1 ); // recalculate max progress. how get? and why?
        if (this.respectReward > 0) {
            flag += 1;
            Stat.AwardPlayerMissionRespect(this.respectReward); // recalculate max respect. how get? and why?
        }
        if (this.cashReward > 0) {
            flag += 2;
            player.addScore(this.cashReward);
        }
        if (!this.enableMissionSuccessBigMessage)
            return;
        switch (flag) {
            case 3:
                Text.PrintWithNumberBig("M_PASSS", this.cashReward, 5000, 1); // Mission passed +$ +Respect
                return;
            case 2:
                Text.PrintWithNumberBig("M_PASS", this.cashReward, 5000, 1); // Mission passed +$
                return;
            case 1:
                Text.PrintBig("M_PASSR", 5000, 1); // Mission passed +Respect
                return;
            default:
                if (this.defaultMissionSuccessBigMessage.length == 0)
                    return;
                if (this.isDefaultMissionSuccessBigMessageAGxt) {
                    Text.PrintBig(this.defaultMissionSuccessBigMessage, 5000, 1);
                    return;
                }
                Text.PrintBigFormatted(this.defaultMissionSuccessBigMessage, 5000, 1);
                return;
        }
    }

    private processFailure(): void {
        this.processCleanup();
        this.displayFailedMessage();
        this.missionState = 4;
        this.onFailureEvent();
    }
    private displayFailedMessage(): void {
        this.displayFailureBigMessage();
        if (1 > this.missionFailureTime)
            return;
        if (this.isMissionFailureReasonMessageAGxt && this.missionFailureReasonMessage.length > 0) {
            Text.PrintNow(this.missionFailureReasonMessage, this.missionFailureTime, 1);
            return;
        }
        Text.PrintFormattedNow(this.missionFailureReasonMessage, this.missionFailureTime);
    }
    private displayFailureBigMessage(): void {
        if (this.defaultMissionFailureBigMessage.length === 0)
            return;
        if (this.enableMissionFailureBigMessage) {
            if (this.isDefaultMissionFailureBigMessageAGxt) {
                Text.PrintBig(this.defaultMissionFailureBigMessage, 5000, 1);
                return;
            }
            Text.PrintBigFormatted(this.defaultMissionFailureBigMessage, 5000, 1);
        }
    }

    private processCleanup(): void {
        this.clearText();
        this.makeCameraBehaviorDefault();
        Mission.Finish();
        this.onCleanupEvent();
    }

    private processEnd(): void {
        this.setWorldComfortableForMission(false);
        this.missionState = 5;
        if (this.enableMissionLauncher) {
            ///@ts-ignore
            CLEO.runScript(__LauncherFilePathInternal__, { __MissionMameInternal__: __MissionMameInternal__, __MissionFilePathInternal__: __MissionFilePathInternal__, __LauncherFilePathInternal__: __LauncherFilePathInternal__ });
        }
    }

    private setWorldComfortableForMission(isStartMissionFlag: boolean): void {
        let invertIsStartMissionFlag = !isStartMissionFlag;
        let offmissionMultipliers = isStartMissionFlag ? 0.0 : 1.0;

        World.SetPedDensityMultiplier(offmissionMultipliers);
        World.SetCarDensityMultiplier(offmissionMultipliers);
        Hud.DisplayZoneNames(invertIsStartMissionFlag);
        Hud.DisplayCarNames(invertIsStartMissionFlag);
        Game.SetPoliceIgnorePlayer(player, isStartMissionFlag);
        Game.SetEveryoneIgnorePlayer(player, isStartMissionFlag);

        Game.SetWantedMultiplier(offmissionMultipliers);
        Game.SetCreateRandomGangMembers(invertIsStartMissionFlag);


        Game.SetCreateRandomCops(invertIsStartMissionFlag);
        Game.EnableAmbientCrime(invertIsStartMissionFlag);
        Game.SwitchPoliceHelis(invertIsStartMissionFlag);
        Game.SwitchCopsOnBikes(invertIsStartMissionFlag);
        Game.SwitchRandomTrains(invertIsStartMissionFlag);
        Game.SwitchAmbientPlanes(invertIsStartMissionFlag);
        Game.SwitchEmergencyServices(invertIsStartMissionFlag);

        Weather.Release();

        playerGroup.remove();
        player.setGroupRecruitment(invertIsStartMissionFlag).setControl(invertIsStartMissionFlag);
        ONMISSION = isStartMissionFlag;
    }

}


/*
    static void __toggle_cinematic( bool enable ) {
        PlayerActor.hide_weapons_in_scene( enable );
        enable_radar( !enable );
        enable_hud( !enable );
        enable_widescreen( enable );
        text_clear_all();
        remove_text_box();
    }    static void __renderer_at( Float x, Float y, Float z ) { refresh_game_renderer( x, y ); CAMERA.refresh( x, y, z ); }
    static void __camera_default() { CAMERA.restore_with_jumpcut().set_behind_player(); }
    static void __fade( Int type_bool, bool delay = false ) {
        set_fade_color_rgb( 0, 0, 0 );
        fade( type_bool, 500 );
        if( delay )
            wait( 500 );
    }


            a.set_muted( false ).set_can_be_knocked_off_bike( false );



    static void __clear_text() {  }


	
	
	
    static void __toggle_cinematic( bool enable ) {
        PlayerActor.hide_weapons_in_scene( enable );
        enable_radar( !enable );
        enable_hud( !enable );
        enable_widescreen( enable );
        text_clear_all();
        remove_text_box();
    }
	

function start_scene_skip( sceneAction ) : void {
    const _wait = wait;
    const cancel = new Error( "ABORTED" );
    wait = ( delay ) => {
        _wait( delay );
        if( Pad.IsKeyPressed( 32 ) ) // KeyCode.Space
            throw cancel;
    };
    try {
        sceneAction();
    } catch( e ) {
        if( e !== cancel )
            throw e;
    }
    wait = _wait;
}

// simulate mission

wait(2000);

start_scene_skip( () => {
	
    Text.PrintFormattedNow( "stage 1", 4000 );
    wait( 4000 );
	
    Text.PrintFormattedNow( "stage 2", 4000 );
    wait( 4000 );
	
    Text.PrintFormattedNow( "stage 3", 4000 );
    wait( 4000 );

    Text.PrintFormattedNow( "stage 4", 4000 );
    wait( 4000 );
	
    Text.PrintFormattedNow( "stage 5", 4000 );
    wait( 4000 );
	
    Text.PrintFormattedNow( "stage 6", 4000 );
    wait( 4000 );
} );


Text.PrintFormattedNow( "skip or end", 4000 );
*/