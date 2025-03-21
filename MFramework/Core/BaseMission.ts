/// <reference path="../../.config/sa.d.ts" />

export const player: Player = new Player( 0 );
export const char: Char = player.getChar();
export const group: Group = player.getGroup();
export const car: Car = new Car( -1 );

export abstract class BaseMission {

    private missionState: int = 0;
	private missionCancelError: Error = new Error( "STOPPED" ); // Seemann is best
	
    private hasFailedMessageBig: boolean = true; // display big message or ignore
    private isFailedMessageAGxtKey: boolean = false; // use gxt key in message or formatted string
    private failedMessage: string = "";
    private failedMessageTime: int = 0;

    private passedMessageFlag: boolean = true; // display big message if no rewards
    private playTuneFlagOnPassed: boolean = true; // play tune or not
    private passedMissionName: string = "";
    private rewardMoney: int = 0;
    private rewardRespect: int = 0;


    
	constructor() {
        while( true ) {
            wait( 0 );
            if( this.isMissionReadyToForcedFailed() )
                this.missionState = 3;
            switch( this.missionState ) {
                case 0:
                    this.processStart();
                    continue;
                case 1:
                    if( !ONMISSION ) {
                        this.missionState = 3;
                        continue;
                    }
                    try {
                        this.onUpdate();
                    } catch( e ) {
                        if( e !== this.missionCancelError )
                            throw e;
                    }
                    continue;
                case 2:
                    this.processSuccess();
                    continue;
                case 3:
                    this.processFailed();
                    continue;
                case 4:
                    this.setWorldComfortableToMission( false );
                    this.missionState = 5;
                    return;
            }
        }
    }


    
    protected onStart() : void { }
    protected onUpdate() : void { }
    protected onSuccess() : void { }
    protected onFailed() : void { }
    protected onClear() : void { }


    
	protected setMoneyReward( money: int ) : void { this.rewardMoney = money; }
	protected setRespectReward( respect: int ) : void { this.rewardRespect = respect; }
    protected complete( missionNameGxtKey: string = "" ) : void {
		if( this.missionState === 1 ) {
			this.missionState = 2;
			this.passedMissionName = missionNameGxtKey;
			throw this.missionCancelError;
		}
	}
    protected fail( failedMessage: string = "", failedMessageTime: int = 0, asGxtKey: boolean = false ) : void {
		if( this.missionState === 1 ) {
			this.missionState = 3;
			if( failedMessage === "" || failedMessageTime === 0 )
				throw this.missionCancelError;
			this.failedMessage = failedMessage;
			this.failedMessageTime = failedMessageTime;
			this.isFailedMessageAGxtKey = asGxtKey;
			throw this.missionCancelError;
		}
    }
	protected clearText() : void {
		Text.ClearHelp();
		Text.ClearPrints();
		Text.ClearSmallPrints();
	}



    private processStart() : void {
        Stat.RegisterMissionGiven();
        this.setWorldComfortableToMission( true );
        this.missionState = 1;
        this.onStart();
    }


    
    private processSuccess() : void {
        this.missionState = 4;
        this.processClear();
        this.displaySuccessMessage();
        this.onSuccess();
    }
    private displaySuccessMessage() : void {
		if( this.passedMissionName.length > 0 && 8 > this.passedMissionName.length )
			Stat.RegisterMissionPassed( this.passedMissionName );
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
        if( flag === 3 ) {
            Text.PrintWithNumberBig( "M_PASSS", this.rewardMoney, 5000, 1 ); // Mission passed +$ +Respect
            return;
        }
        if( flag === 2 ) {
            Text.PrintWithNumberBig( "M_PASS", this.rewardMoney, 5000, 1 ); // Mission passed +$
            return;
        }
        if( flag === 1 ) {
            Text.PrintBig( "M_PASSR", 5000, 1 ); // Mission passed +Respect
            return;
        }
        if( this.passedMessageFlag )
            Text.PrintBig( "M_PASSD", 5000, 1 ); // Mission passed
    }


    
    private processFailed() : void {
        this.missionState = 4;
        this.processClear();
        this.displayFailedMessage();
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


    
	private isMissionReadyToForcedFailed() : boolean {
        return !player.isPlaying() || !Char.DoesExist( +char ) || Char.IsDead( +char ) || char.hasBeenArrested();
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
        player.setGroupRecruitment( invertIsStartMissionFlag );
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
	
	
*/


/*
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