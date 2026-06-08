import { BaseProject } from "../BaseProject";
import { STORY00 } from "./STORY00";
import { STORY01 } from "./STORY01";
import { STORY02 } from "./STORY02";

export class PROJECT extends BaseProject {

    public constructor() {
        super();
        this.addStoryline(STORY00); // 0
        this.addStoryline(STORY01); // 1
        this.addStoryline(STORY02); // 2
    }

}