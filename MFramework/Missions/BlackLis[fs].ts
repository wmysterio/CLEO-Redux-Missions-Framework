/// <reference path="../../.config/sa.d.ts" />

import { BaseMission } from "../BaseMission";
import { char } from "../Utils";



new class BlackList extends BaseMission {

    protected onStart() : void {
		this.setMoneyReward( 5000 );
		char.setCoordinates( 2459.4629, -1660.1523, 13.3047 ).setHeading( 41.9871 );
		Text.PrintHelpFormatted( "Start" );
	}

    protected onUpdate() : void {
		if( Pad.IsKeyPressed( 50 ) ) // 2
			this.fail( "Don't press the '2' key!", 4000 );
		if( Pad.IsKeyPressed( 9 ) ) // tab
			this.complete();
	}

	protected onSuccess(): void {
		this.incrementSavedIntValue( "TOTAL_MISSION_PASSED", 0, true );
	}

}