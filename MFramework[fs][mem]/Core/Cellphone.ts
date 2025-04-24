/// Created by wmysterio, 19.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.././.config/sa.d.ts" />

import { CELLPHONE } from "../Models";
import { Save } from "../Save";
import { Dialog } from "../Core/Dialog";
import { Timer } from "../Timer";

/** Class for working with the player's phone */
export class Cellphone {

    private static MAX_DELAY: int = 60000;
    private static TIME_TO_RESPONCE: int = 20000;
    private static RINGTONE_ID: int = 23000;

    private cellphoneState: int;
    private cellphoneLastDialog: Dialog;
    private cellphoneLastDialogSubfolder: string;

    constructor() {
        this.cellphoneReset();
    }

    public call(dialog: Dialog, subfolder: string = ""): void {
        if (this.cellphoneState === 0) {
            this.cellphoneLastDialog = dialog;
            this.cellphoneLastDialogSubfolder = subfolder;
        }
        this.cellphoneState = 1;
    }

    public isOn(): boolean {
        return this.cellphoneState > 0;
    }

    public update(player: Player, playerChar: Char, timer: Timer): void {
        if (this.cellphoneState === 0)
            return;
        switch (this.cellphoneState) {
            case 1:
                let state = Save.GetIntFromSection("<CELLPHONE>", "Calling", 0);
                if (state === 1)
                    return;
                Save.SetCellphoneCallPlayer(true);
                this.cellphoneState = 2;
                return;
            case 2:
                Streaming.RequestModel(CELLPHONE);
                Audio.LoadMissionAudio(1, Cellphone.RINGTONE_ID);
                this.cellphoneState = 3;
                return;
            case 3:
                if (Streaming.HasModelLoaded(CELLPHONE) && Audio.HasMissionAudioLoaded(1)) {
                    timer.set(Cellphone.TIME_TO_RESPONCE);
                    this.cellphoneState = 4;
                }
                return;
            case 4:
                if (!this.cellphoneIsPlayerCanSpeek(player, playerChar)) {
                    if (Text.IsThisHelpMessageBeingDisplayed("ANSWER"))
                        Text.ClearHelp();
                    return;
                }
                if (Pad.IsButtonPressed(0, 15)) { // VEHICLE_ENTER_EXIT 
                    this.cellphoneWaitRecall(timer);
                    return;
                }
                if (Audio.HasMissionAudioFinished(1)) {
                    if (0 >= timer.getMillisecondsLeft()) {
                        this.cellphoneWaitRecall(timer);
                        return;
                    }
                    Audio.PlayMissionAudio(1);
                }
                if (!Text.IsThisHelpMessageBeingDisplayed("ANSWER")) {
                    Text.SetHelpMessageBoxSize(200);
                    Text.PrintHelpForever("ANSWER");
                }
                if (Pad.IsButtonPressed(0, 4)) { // PED_ANSWER_PHONE_FIREWEAPON_ALT
                    Text.ClearHelp();
                    this.cellphoneState = 6;
                }
                return;
            case 5:
                if (0 >= timer.getMillisecondsLeft()) {
                    timer.set(Cellphone.TIME_TO_RESPONCE);
                    this.cellphoneState = 4;
                }
                return;
            case 6:
                this.cellphoneSetPlayer(player, playerChar, false);
                playerChar.clearTasks();
                this.cellphoneLastDialog.load(this.cellphoneLastDialogSubfolder);
                Task.UseMobilePhone(playerChar, true);
                timer.set();
                this.cellphoneState = 7;
                return;
            case 7:
                if (2000 > timer.getMillisecondsPassed())
                    return;
                if (Char.IsDead(+playerChar)) {
                    this.cellphoneLastDialog.unload();
                    Task.UseMobilePhone(playerChar, false);
                    playerChar.setCurrentWeapon(0).clearTasks();
                    this.cellphoneSetPlayer(player, playerChar, true);
                    this.cellphoneWaitRecall(timer);
                    return;
                }
                if (!Text.IsThisHelpMessageBeingDisplayed("CELSKIP")) {
                    Text.SetHelpMessageBoxSize(200);
                    Text.PrintHelpForever("CELSKIP");
                }
                if (!Pad.IsButtonPressed(0, 15) && this.cellphoneLastDialog.perform(playerChar))  // VEHICLE_ENTER_EXIT 
                    return;
                Text.ClearHelp();
                Task.UseMobilePhone(playerChar, false);
                this.cellphoneState = 8;
                return;
            case 8:
                this.cellphoneLastDialog.unload();
                this.cellphoneSetPlayer(player, playerChar, true);
                Streaming.MarkModelAsNoLongerNeeded(CELLPHONE);
                Audio.ClearMissionAudio(1);
                this.cellphoneReset();
                Save.SetCellphoneCallPlayer(false);
                this.cellphoneState = 0;
                return;
        }
    }



    private cellphoneReset(): void {
        this.cellphoneLastDialog = undefined;
        this.cellphoneLastDialogSubfolder = "";
        this.cellphoneState = 0;
    }

    private cellphoneSetPlayer(player: Player, playerChar: Char, enable: boolean): void {
        playerChar.setProofs(enable, enable, enable, enable, enable).shutUp(!enable)
            .setCurrentWeapon(0).stopFacialTalk();
        Game.SetPoliceIgnorePlayer(player, !enable);
        Game.SetEveryoneIgnorePlayer(player, !enable);
        Pad.SetPlayerDuckButton(player, enable);
        Pad.SetPlayerJumpButton(player, enable);
        Pad.SetPlayerEnterCarButton(player, enable);
        Pad.SetPlayerDisplayVitalStatsButton(player, enable);
        Pad.SetPlayerCycleWeaponButton(player, enable);
        Pad.SetPlayerFireButton(player, enable);
    }

    private cellphoneIsPlayerCanSpeek(player: Player, playerChar: Char): boolean {
        if (ONMISSION || Streaming.GetAreaVisible() !== 0 || playerChar.getAreaVisible() !== 0)
            return false;
        if (playerChar.isInAir() || Camera.GetFadingStatus() || Game.IsMinigameInProgress())
            return false;
        if (Char.IsDead(+playerChar) || playerChar.hasBeenArrested())
            return false;
        if (Game.IsGangWarFightingGoingOn() || playerChar.isDucking() || player.isWantedLevelGreater(0))
            return false;
        if (player.isUsingJetpack() || playerChar.isInWater())
            return false;
        return player.isControlOn() && playerChar.isOnFoot();
    }

    private cellphoneWaitRecall(timer: Timer): void {
        Text.ClearHelp();
        timer.set(Cellphone.MAX_DELAY);
        this.cellphoneState = 5;
    }

}