/// <reference path="../../.config/sa.d.ts" />

import { BaseLauncher } from "../BaseLauncher";



new class BlackListLauncher extends BaseLauncher {

    protected onCheckBlipCreation(): boolean {
        if( this.loadIntValue( "TOTAL_MISSION_PASSED", 0, true ) > 4 )
            exit();
        return true;
    }

    protected onStart() : void {
        this.setPosition( 2452.3093, -1649.698, 13.4468 );
    }

}
