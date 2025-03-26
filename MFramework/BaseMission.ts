/// <reference path="../.config/sa.d.ts" />

import { BaseSave } from "./BaseSave";
import { group, isPlayerOffGame, player } from "./Utils";



export abstract class BaseMission extends BaseSave {

    private subMissionsAction: () => void = undefined;
    private hasSubMissions: boolean = false;

    private missionState: int = 0;
    private missionNameGxtKey: string = "";
	private missionAbortError: Error = new Error(); // Seemann is best

    //private isScriptSceneNeeded: boolean = false;

    private forceDontCreateLauncher: boolean = false;
    private hasFailedMessageBig: boolean = true; // display big message or ignore
    private isFailedMessageAGxtKey: boolean = false; // use gxt key in message or formatted string
    private failedMessage: string = ""; // answer to why mission failed 
    private failedMessageTime: int = 5000;

    private hasPassedMessageBig: boolean = true; // display big message or ignore
    private playTuneFlagOnPassed: boolean = true; // play tune or not

    private rewardMoney: int = 0;
    private rewardRespect: int = 0;

    

	constructor() {
        ///@ts-ignore
        super( __MissionMameInternal__ );
        do {
            wait( 0 );
            if( isPlayerOffGame() )
                this.missionState = 3;
            switch( this.missionState ) {
                case 0:
                    this.processStart();
                    continue;
                case 1:
                    this.processUpdate();
                    continue;
                case 2:
                    this.processPassed();
                    continue;
                case 3:
                    this.processFailed();
                    continue;
                case 4:
                    this.processEnd();
                    continue;
            }
        } while( this.missionState !== 5 );
    }


    
    protected onStart() : void { }
    protected onUpdate() : void { }
    protected onPassed() : void { }
    protected onFailed() : void { }
    protected onClear() : void { }


    
    protected setPassedMessageBig( state: boolean ) : void { this.hasPassedMessageBig = state; }
	protected setMoneyReward( money: int ) : void { this.rewardMoney = money; }
	protected setRespectReward( respect: int ) : void { this.rewardRespect = respect; }
    protected dontCreateLauncher() : void { this.forceDontCreateLauncher = true; }
    protected setSubMissions( subMissionsAction: () => void ) : void {
        if( this.missionState !== 0 && this.hasSubMissions )
            return;
        this.subMissionsAction = subMissionsAction;
        this.hasSubMissions = true;
    }



    protected complete( missionNameGxtKey: string = "" ) : void {
		if( this.missionState === 1 ) { // && !this.isScriptSceneNeeded
            this.missionNameGxtKey = missionNameGxtKey;
			this.missionState = 2;
			throw this.missionAbortError;
		}
	}
    protected fail( failedMessage: string = "", failedMessageTime: int = 4000, asGxtKey: boolean = false ) : void {
		if( this.missionState === 1 ) { //  && !this.isScriptSceneNeeded
			this.missionState = 3;
			if( failedMessage === "" || failedMessageTime === 0 )
				throw this.missionAbortError;
			this.failedMessage = failedMessage;
			this.failedMessageTime = failedMessageTime;
			this.isFailedMessageAGxtKey = asGxtKey;
			throw this.missionAbortError;
		}
    }
	protected clearText() : void {
        Text.ClearThisPrintBigNow( 1 );
        Text.ClearThisPrintBigNow( 2 );
		Text.ClearHelp();
		Text.ClearPrints();
		Text.ClearSmallPrints();
	}


    
    private processStart() : void {
        Stat.RegisterMissionGiven();
        this.setWorldComfortableToMission( true );
        this.clearText();
        this.onStart();
        if( this.hasSubMissions ) {
            this.missionState = 5;
            this.subMissionsAction();
            return;
        }
        let nameLength = this.missionNameGxtKey.length;
        if( nameLength > 0 && 8 > nameLength )
            Text.PrintBig( this.missionNameGxtKey, 1000, 2 );
        this.missionState = 1;
    }



    private processUpdate() : void {
        if( !ONMISSION ) {
            this.missionState = 3;
            return;
        }
        try {
            this.onUpdate();
        } catch( e ) {
            if( e !== this.missionAbortError )
                throw e;
        }
    }



    private processPassed() : void {
        this.processClear();
        this.displaySuccessMessage();
        this.missionState = 4;
        this.onPassed();
    }
    private displaySuccessMessage() : void {
		if( this.missionNameGxtKey.length > 0 && 8 > this.missionNameGxtKey.length )
			Stat.RegisterMissionPassed( this.missionNameGxtKey );
        let flag = 0;
        // recalculate max progress. how get?
        //Stat.PlayerMadeProgress( 1 );
        if( this.rewardRespect > 0 ) {
            flag += 1;
            // recalculate max respect. how get?
            //Stat.AwardPlayerMissionRespect( this.rewardRespect );
        }
        if( this.rewardMoney > 0 ) {
            flag += 2;
            player.addScore( this.rewardMoney );
        }
        if( this.playTuneFlagOnPassed )
            Audio.PlayMissionPassedTune( 1 );
        switch( flag ) {
            case 3:
                Text.PrintWithNumberBig( "M_PASSS", this.rewardMoney, 5000, 1 ); // Mission passed +$ +Respect
                return;
            case 2:
                Text.PrintWithNumberBig( "M_PASS", this.rewardMoney, 5000, 1 ); // Mission passed +$
                return;
            case 1:
                Text.PrintBig( "M_PASSR", 5000, 1 ); // Mission passed +Respect
                return;
            default:
                if( this.hasPassedMessageBig )
                    Text.PrintBig( "M_PASSD", 5000, 1 ); // Mission passed
                return;
        }
    }


    
    private processFailed() : void {
        this.processClear();
        this.displayFailedMessage();
        this.missionState = 4;
        this.onFailed();
    }
    private displayFailedMessage() : void {
        if( this.hasFailedMessageBig )
            Text.PrintBig( "M_FAIL", 5000, 1 ); // Mission failed
        if( 1 > this.failedMessageTime )
			return;
		if( this.isFailedMessageAGxtKey ) {
			Text.PrintNow( this.failedMessage, this.failedMessageTime, 1 );
			return;
		}	
        Text.PrintFormattedNow( this.failedMessage, this.failedMessageTime );
    }


    
    private processClear() : void {
		this.clearText();
        this.onClear();
    }


    
    private processEnd() : void {
        this.setWorldComfortableToMission( false );
        this.missionState = 5;
        if( this.forceDontCreateLauncher )
            return;
        ///@ts-ignore
        CLEO.runScript( __LauncherFilePathInternal__, { __MissionMameInternal__: __MissionMameInternal__, __MissionFilePathInternal__: __MissionFilePathInternal__, __LauncherFilePathInternal__: __LauncherFilePathInternal__ } );
    }


    
    private setWorldComfortableToMission( isStartMissionFlag: boolean ) : void {
		let invertIsStartMissionFlag = !isStartMissionFlag;
		let offmissionMultipliers = isStartMissionFlag ? 0.0 : 1.0;

        World.SetPedDensityMultiplier( offmissionMultipliers );
        World.SetCarDensityMultiplier( offmissionMultipliers );
        Hud.DisplayZoneNames( invertIsStartMissionFlag );
        Hud.DisplayCarNames( invertIsStartMissionFlag );
        Game.SetPoliceIgnorePlayer( player, isStartMissionFlag );
        Game.SetEveryoneIgnorePlayer( player, isStartMissionFlag );
		
        Game.SetWantedMultiplier( offmissionMultipliers );
		Game.SetCreateRandomGangMembers( invertIsStartMissionFlag );
		
		
		Game.SetCreateRandomCops( invertIsStartMissionFlag );
        Game.EnableAmbientCrime( invertIsStartMissionFlag );
		Game.SwitchPoliceHelis( invertIsStartMissionFlag );
		Game.SwitchCopsOnBikes( invertIsStartMissionFlag );
        Game.SwitchRandomTrains( invertIsStartMissionFlag );
		Game.SwitchAmbientPlanes( invertIsStartMissionFlag );
		Game.SwitchEmergencyServices( invertIsStartMissionFlag );
		
		Weather.Release();
		
        group.remove();
        player.setGroupRecruitment( invertIsStartMissionFlag ).setControl( invertIsStartMissionFlag );
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



    static void __renderer_at( Float x, Float y, Float z ) { refresh_game_renderer( x, y ); CAMERA.refresh( x, y, z ); }
    static void __camera_default() { CAMERA.restore_with_jumpcut().set_behind_player(); }
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