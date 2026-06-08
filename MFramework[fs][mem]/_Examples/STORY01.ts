import { BaseStoryline } from "../BaseStoryline";
import { MISSI02 } from "./MISSI02";
import { MISSI11 } from "./MISSI11";

export class STORY01 extends BaseStoryline {

    public constructor() {
        super();
        this.addMissionWithStorylineProgress(MISSI11, 0, 0);
        this.addMission(MISSI02);
    }

}