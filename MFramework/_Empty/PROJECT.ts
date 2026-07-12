import { BaseProject } from "../BaseProject";
import { STORY00 } from "./STORY00";

export class PROJECT extends BaseProject {

    public constructor() {
        super();
        //this.author = "";
        //this.version = "1.0.0";
        this.addStoryline(STORY00); // 0
    }

}