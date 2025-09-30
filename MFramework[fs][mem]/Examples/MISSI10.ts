import { BUFFALO } from "../Models";
import { BaseCheckpointChallenge } from "../Racing";

new class MISSI09 extends BaseCheckpointChallenge {

    public onRacerSetupEvent(): void {
        //this.enableProgressSaving = false;

        this.addPlayerRacer(BUFFALO, 1197.2827, -1322.1071, 13.0082, 178.2271);

        this.addRouteNode(1197.4524, -1400.2775, 12.8647, 177.0966, 0.0, 5000);
        this.addRouteNode(1195.5041, -1534.1971, 12.9867, 172.8321, 0.0, 6000);
    }

}