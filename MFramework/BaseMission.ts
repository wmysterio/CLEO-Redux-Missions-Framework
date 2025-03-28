/// Created by wmysterio, 27.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { player, playerGroup, isPlayerNotPlaying } from "./Utils";

/** Base class for missions and sub-missions */
export abstract class BaseMission {

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
     * The current mission will execute the code of the specified mission.
     * Only one sub-mission can be assigned at a time.
     * @param baseMissionType A data type extended from BaseMission.
     */
    protected setSubMission<TMission extends BaseMission>(baseMissionType: new () => TMission): void {
        if (this.baseMissionHasSubMissionsFunction || this.baseMissionState !== 0)
            return;
        this.baseMissionHasSubMissionsFunction = true;
        this.baseMissionSubMissionsFunction = () => { return new baseMissionType().HasSuccess(); };
    }

    /**
     * Sets a cash reward on success.
     * @param money Reward
     */
    protected setCashReward(money: int): void { this.baseMissionCashReward = money; }

    /**
     * Increases respect on success
     * @param money Reward
     */
    protected setRespectReward(respect: int): void { this.baseMissionRespectReward = respect; }

    /**
     * Sets the mission title
     * @param title The text that is shown at the beginning of the mission
     * @param gxtKey Set true if the text is a GXT key
     */
    protected setTitle(title: string, gxtKey: boolean = false): void {
        this.baseMissionTitleText = title;
        this.baseMissionIsTitleTextAGxt = gxtKey;
    }

    /** Disables text notification about mission failure */
    protected disableFailureBigMessage(): void { this.baseMissionEnableMissionFailureBigMessage = false; }

    /**
     * Sets the default text notification for failure mission completion
     * @param message Notification text
     * @param gxtKey Set true if the text is a GXT key
     */
    protected setDefaultMissionFailureBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.baseMissionDefaultMissionFailureBigMessage = message;
        this.baseMissionIsDefaultMissionFailureBigMessageAGxt = gxtKey;
    }

    /** Turns off the sound notification about successful mission completion */
    protected disableMissionSuccessTune(): void { this.baseMissionEnableMissionSuccessTune = false; }

    /** Disables text notification about successful mission completion */
    protected disableMissionSuccessBigMessage(): void { this.baseMissionEnableMissionSuccessBigMessage = false; }

    /**
     * Sets the default text notification for successful mission completion
     * @param message Notification text
     * @param gxtKey Set true if the text is a GXT key
     */
    protected setDefaultMissionSuccessBigMessage(message: string, gxtKey: boolean = false): void {
        if (gxtKey && message.length > 7)
            return;
        this.baseMissionDefaultMissionSuccessBigMessage = message;
        this.baseMissionIsDefaultMissionSuccessBigMessageAGxt = gxtKey;
    }

    /** Aborts the mission with a success notification */
    protected complete(): void {
        if (this.baseMissionState === 1) {
            this.baseMissionState = 2;
            throw this.baseMissionControllableErrorToForceMissionTermination;
        }
    }

    /** Aborts the mission with a failure notification */
    protected fail(reasonMessage: string = "", failedMessageTime: int = 5000, gxtKey: boolean = false): void {
        if (this.baseMissionState === 1) {
            if (gxtKey && reasonMessage.length > 7)
                gxtKey = false;
            this.baseMissionIsMissionFailureReasonMessageAGxt = gxtKey;
            this.baseMissionMissionFailureReasonMessage = reasonMessage;
            this.baseMissionEnableMissionFailureTime = failedMessageTime;
            this.baseMissionState = 3;
            throw this.baseMissionControllableErrorToForceMissionTermination;
        }
    }

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

    /**
     * Checks whether the mission was successful.
     * @returns Returns true if the mission was successful
     */
    public HasSuccess(): boolean { return this.baseMissionHasMissionSuccess; }



    constructor() {
        do {
            wait(0);
            if (isPlayerNotPlaying())
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

    //----------------------------------------------------------------------------------------------------

    private baseMissionState: int = 0;
    private baseMissionControllableErrorToForceMissionTermination: Error = new Error(); // thanks Seemann!
    private baseMissionSubMissionsFunction: () => boolean;
    private baseMissionHasSubMissionsFunction: boolean = false;
    private baseMissionCashReward: int = 0;
    private baseMissionRespectReward: int = 0;
    private baseMissionTitleText: string = "DUMMY";
    private baseMissionIsTitleTextAGxt: boolean = true;
    private baseMissionDefaultMissionFailureBigMessage: string = "M_FAIL";
    private baseMissionIsDefaultMissionFailureBigMessageAGxt: boolean = true;
    private baseMissionEnableMissionFailureBigMessage: boolean = true;
    private baseMissionDefaultMissionSuccessBigMessage: string = "M_PASSD";
    private baseMissionIsDefaultMissionSuccessBigMessageAGxt: boolean = true;
    private baseMissionEnableMissionSuccessBigMessage: boolean = true;
    private baseMissionMissionFailureReasonMessage: string = "";
    private baseMissionEnableMissionSuccessTune: boolean = true;
    private baseMissionEnableMissionFailureTime: int = 0;
    private baseMissionIsMissionFailureReasonMessageAGxt: boolean = false;
    private baseMissionMissionPassedGxtKey: string = "";
    private baseMissionHasMissionSuccess: boolean = false;

    //----------------------------------------------------------------------------------------------------

    private baseMissionProcessStart(): void {
        this.clearText();
        this.onStartEvent();
        if (this.baseMissionHasSubMissionsFunction) {
            this.baseMissionHasMissionSuccess = this.baseMissionSubMissionsFunction();
            this.baseMissionState = 5;
            return;
        }
        Stat.RegisterMissionGiven();
        this.baseMissionSetWorldComfortableForMission(true);
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
        if (this.baseMissionMissionPassedGxtKey.length > 1)
            Stat.RegisterMissionPassed(this.baseMissionMissionPassedGxtKey);
        if (this.baseMissionEnableMissionSuccessTune)
            Audio.PlayMissionPassedTune(1);
        this.baseMissionDisplaySuccessMessage();
        this.baseMissionState = 4;
        this.baseMissionHasMissionSuccess = true;
        this.onSuccessEvent();
    }
    private baseMissionDisplaySuccessMessage(): void {
        let flag = 0;
        //Stat.PlayerMadeProgress( 1 ); // recalculate max progress. how get? and why?
        if (this.baseMissionRespectReward > 0) {
            flag += 1;
            Stat.AwardPlayerMissionRespect(this.baseMissionRespectReward); // recalculate max respect. how get? and why?
        }
        if (this.baseMissionCashReward > 0) {
            flag += 2;
            player.addScore(this.baseMissionCashReward);
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
        this.baseMissionSetWorldComfortableForMission(false);
        this.makeCameraBehaviorDefault();
        Mission.Finish();
        this.baseMissionState = 5;
    }

    private baseMissionSetWorldComfortableForMission(isStartMissionFlag: boolean): void {
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