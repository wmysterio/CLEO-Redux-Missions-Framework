/// <reference path="../.config/sa.d.ts" />

import { BaseSave } from "./BaseSave";
import { char, isPlayerOffGame, player } from "./Utils";


  
export abstract class BaseLauncher extends BaseSave {

    protected onStart() : void { }
    protected onCheckBlipCreation() : boolean { return true; }
    protected onCheckMissionStart() : boolean { return true; }


    
    private blip: Blip = undefined;
    private starterState: int = 0;
    private radarSprite: int = 15;
    private positionX: float = 0.0;
    private positionY: float = 0.0;
    private positionZ: float = 0.0;


    
    protected setPosition( x: float, y: float, z: float ) : void {
        this.positionX = x;
        this.positionY = y;
        this.positionZ = z;
    }
    protected setRadarSprite( radarSprite: int ) : void {
        this.radarSprite = radarSprite;
    }


    
    constructor() {
        ///@ts-ignore
        super( __MissionMameInternal__ );
        do {
            wait( 0 );
            if( isPlayerOffGame() ) {
                wait( 249 );
                continue;
            }
            switch( this.starterState ) {
                case 0:
                    this.processStart();
                    continue;
                case 1:
                    this.processBlipCreation();
                    continue;
                case 2:
                    this.processLaunchMission();
                    continue;
            }
        } while( this.starterState !== 3 );
    }



    private processStart() : void {
        this.onStart();
        this.starterState = 1;
    }



    private processBlipCreation() : void {
        if( !this.onCheckBlipCreation() ) {
            wait( 1499 );
            return;
        }
        this.blip = Blip.AddSpriteForCoord( this.positionX, this.positionY, this.positionZ, this.radarSprite );
        this.blip.changeDisplay( 2 );
        this.starterState = 2;
    }


    
    private processLaunchMission() : void {
        if( !char.locateAnyMeans3D( this.positionX, this.positionY, this.positionZ, 40.0, 40.0, 40.0, false ) ) {
            wait( 249 );
            return;
        }
        if( Camera.GetFadingStatus() || ONMISSION || !player.isControlOn() ) {
            wait( 249 );
            return; 
        }
        if( !char.locateAnyMeans3D( this.positionX, this.positionY, this.positionZ, 1.25, 1.25, 2.0, true ) || player.isUsingJetpack() )
            return;
        if( !this.onCheckMissionStart() )
            return;
        this.blip.remove();
        this.blip = undefined
        this.starterState = 3;
        ///@ts-ignore
        CLEO.runScript( __MissionFilePathInternal__, { __MissionMameInternal__: __MissionMameInternal__, __MissionFilePathInternal__: __MissionFilePathInternal__, __LauncherFilePathInternal__: __LauncherFilePathInternal__ } );
    }
    
}