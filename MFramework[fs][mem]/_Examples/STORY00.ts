import { BaseStoryline } from "../BaseStoryline";
import { MISSI00 } from "./MISSI00";
import { MISSI01 } from "./MISSI01";
import { MISSI03 } from "./MISSI03";

export class STORY00 extends BaseStoryline {

    public constructor() {
        super();
        this.addMission(MISSI00);
        this.addMission(MISSI01);
        this.addMission(MISSI03);
    }

}