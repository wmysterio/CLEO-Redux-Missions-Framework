import { BaseStoryline } from "../BaseStoryline";
import { MISS000 } from "./MISS000";

export class STORY00 extends BaseStoryline {

    public constructor() {
        super();
        this.addMission(MISS000); // 0
    }

}