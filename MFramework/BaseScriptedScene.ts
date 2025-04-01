/// Created by wmysterio, 30.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

import { BaseScript } from "./BaseScript";
import { player, playerChar } from "./Utils";

/** Base class for scripted scenes */
export abstract class BaseScriptedScene extends BaseScript {

    /** Reaction to the loading event */
    protected onLoadEvent(): void { }

    /** Reaction to the start of a script scene */
    protected onStartEvent(): void { }

    /** Reaction to the unloading event */
    protected onUnloadEvent(): void { }

    /**
     * @param autoContol Use true if you want automatic control over script scene events, or false for manual control
     */
    constructor(autoContol: boolean = true) {
        super();
        if (autoContol) {
            World.SetPedDensityMultiplier(0.0);
            World.SetCarDensityMultiplier(0.0);
            Game.SetWantedMultiplier(0.0);
            Game.SetPoliceIgnorePlayer(player, true);
            Game.SetEveryoneIgnorePlayer(player, true);
            Hud.DisplayZoneNames(false);
            Hud.DisplayCarNames(false);
            player.setControl(false);
            Camera.DoFade(800, 0);
            while (Camera.GetFadingStatus())
                wait(199);
            playerChar.shutUp(true).hideWeaponForScriptedCutscene(true);
            this.onLoadEvent();
            Hud.DisplayRadar(false);
            Hud.Display(false);
            Hud.SwitchWidescreen(true);
            wait(800);
            this.clearText();
            Camera.DoFade(800, 1);
            this.onStartEvent();
            this.clearText();
            Camera.DoFade(800, 0);
            while (Camera.GetFadingStatus())
                wait(199);
            this.onUnloadEvent();
            wait(800);
            World.SetPedDensityMultiplier(1.0);
            World.SetCarDensityMultiplier(1.0);
            Game.SetWantedMultiplier(1.0);
            Game.SetPoliceIgnorePlayer(player, false);
            Game.SetEveryoneIgnorePlayer(player, false);
            Hud.DisplayZoneNames(true);
            Hud.DisplayCarNames(true);
            player.setControl(true);
            playerChar.shutUp(false).hideWeaponForScriptedCutscene(false);
            Hud.DisplayRadar(true);
            Hud.Display(true);
            Hud.SwitchWidescreen(false);
            this.resetCamera();
            this.clearText();
            Camera.DoFade(800, 1);
            return;
        }
        this.onLoadEvent();
        this.onStartEvent();
        this.onUnloadEvent();
    }

}