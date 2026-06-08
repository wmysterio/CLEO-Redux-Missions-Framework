import { BaseStoryline } from "../BaseStoryline";
import { MISSI04 } from "./MISSI04";
import { MISSI05 } from "./MISSI05";
import { MISSI06 } from "./MISSI06";
import { MISSI07 } from "./MISSI07";
import { MISSI08 } from "./MISSI08";
import { MISSI09 } from "./MISSI09";
import { MISSI10 } from "./MISSI10";

export class STORY02 extends BaseStoryline {

    public constructor() {
        super();
        this.addMission(MISSI04);
        this.addMission(MISSI05);
        this.addMission(MISSI06);
        this.addMission(MISSI07);
        this.addMission(MISSI08);
        this.addMission(MISSI09);
        this.addMission(MISSI10);
    }

}