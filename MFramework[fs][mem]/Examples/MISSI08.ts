import { REEFER } from "../Models";
import { BaseWantedChallenge } from "../Racing";

new class MISSI08 extends BaseWantedChallenge {

    public onRacerSetupEvent(): void {
        //this.enableProgressSaving = false;

        this.addPlayerRacer(REEFER, 219.6066, -1926.7351, 1.3797, 185.5792);
        this.timeMinimum = 10000; // 10sec
        this.minWantedLevel = 2;
        this.makeMandatoryToAvoidPolice();
    }

}