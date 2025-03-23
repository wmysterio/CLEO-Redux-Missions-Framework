/// <reference path="../.config/sa.d.ts" />

// just test

import { BlackList } from "./BlackList";

//wait(2000);
//showTextBox("Starter");
let mission = new BlackList();
let status = mission.IsFailed() ? 0 : 1;
Text.PrintFormattedNow( "Mission status: %d", 4000, status );