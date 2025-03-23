/// <reference path="../.config/sa.d.ts" />

import { BaseMission } from "./Core/BaseMission";

export class BlackList extends BaseMission {

    protected onStart() : void {
		this.setMoneyReward( 5000 );
		this.setRespectReward( 10 );
		Text.PrintHelpFormatted( "Start" );
	}
    protected onUpdate() : void {
		if( Pad.IsKeyPressed( 50 ) ) // 2
			this.fail( "Don't press the '2' key!", 4000 ); // or ONMISSION = false;
		if( Pad.IsKeyPressed( 9 ) ) // tab    !this.sceneFlag
			this.complete();
	}

}