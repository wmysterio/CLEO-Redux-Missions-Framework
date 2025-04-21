/// Created by wmysterio, 19.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.././.config/sa.d.ts" />

import { AudioPlayer } from "./AudioPlayer";
import { Timer } from "./Timer";

/** Class on working with dynamic dialogs */
export class Dialog {

    private dialogAudioPlayer: AudioPlayer;
    private dialogTimer: Timer;
    private dialogForPlayerFlags: boolean[];
    private dialogMessages: string[];
    private dialogMessagesGxtFlags: boolean[];
    private dialogDurations: int[];
    private dialogAudioNumbers: int[];
    private dialogCountOfReplicas: int;
    private dialogCanSpeekAction: () => boolean;
    private dialogCurrentReplicaIndex: int;

    constructor() {
        this.dialogAudioPlayer = new AudioPlayer();
        this.dialogTimer = new Timer();
        this.dialogReset();
    }

    /**
     * Adds a new replica to the dialogue
     * @param forPlayer Whether the player will move their mouth during a replica
     */
    public addAReplica(playerSpeek: boolean, message: string, durationInMilliseconds: int, asGxtKey: boolean = false): Dialog {
        this.dialogForPlayerFlags.push(playerSpeek);
        this.dialogMessages.push(message);
        this.dialogMessagesGxtFlags.push(asGxtKey);
        this.dialogDurations.push(durationInMilliseconds);
        this.dialogAudioNumbers.push(this.dialogCountOfReplicas);
        this.dialogCountOfReplicas += 1;
        return this;
    }

    /** Loads audio files if any */
    public load(subfolder: string = ""): void {
        this.dialogAudioPlayer.load(this.dialogCountOfReplicas, subfolder);
    }

    /** Resets the default replicas settings and unloads audio files if any */
    public unload(): void {
        this.dialogAudioPlayer.unload();
        this.dialogReset();
    }

    /** Specifies a method that checks whether someone can say a replica */
    public setCanSpeekAction(action: () => boolean): void {
        if (action === undefined)
            return;
        this.dialogCanSpeekAction = action;
    }

    /**
     * Plays all dialogue replicas in sequence. Must be used in a loop
     * @returns Returns false if the dialog has ended
     */
    public perform(playerChar: Char): boolean {
        if (this.dialogIsEnded())
            return false;
        if (!this.dialogCanSpeekAction())
            return true;
        let passedMilliseconds = this.dialogTimer.getMillisecondsPassed();
        if (!Text.IsMessageBeingDisplayed() && this.dialogCurrentReplicaIndex !== -1) {
            let newTime = this.dialogDurations[this.dialogCurrentReplicaIndex] - passedMilliseconds;
            if (this.dialogMessagesGxtFlags[this.dialogCurrentReplicaIndex]) {
                Text.PrintNow(this.dialogMessages[this.dialogCurrentReplicaIndex], newTime, 1);
            } else {
                Text.PrintFormattedNow(this.dialogMessages[this.dialogCurrentReplicaIndex], newTime);
            }
        }
        if (this.dialogCurrentReplicaIndex > -1) {
            let dialogDurationInMilliseconds = this.dialogDurations[this.dialogCurrentReplicaIndex];
            if (this.dialogAudioPlayer.isPlaying() || dialogDurationInMilliseconds >= passedMilliseconds)
                return true;
        }
        playerChar.stopFacialTalk();
        this.dialogCurrentReplicaIndex += 1;
        if (this.dialogIsEnded()) {
            Text.ClearPrints();
            this.dialogCanSpeekAction = () => { return false; };
            return false;
        }
        this.fixDialogDurationIfAudioPlayerUsed(this.dialogCurrentReplicaIndex);
        if (this.dialogForPlayerFlags[this.dialogCurrentReplicaIndex])
            playerChar.startFacialTalk(this.dialogDurations[this.dialogCurrentReplicaIndex]);
        Text.ClearPrints();
        this.dialogTimer.set();
        return true;
    }




    private fixDialogDurationIfAudioPlayerUsed(index: int): void {
        this.dialogDurations[index] = this.dialogAudioPlayer.playNext(this.dialogDurations[index]);
    }

    private dialogReset(): void {
        this.dialogForPlayerFlags = new Array<boolean>();
        this.dialogMessages = new Array<string>();
        this.dialogMessagesGxtFlags = new Array<boolean>();
        this.dialogDurations = new Array<int>();
        this.dialogAudioNumbers = new Array<int>();
        this.dialogCountOfReplicas = 0;
        this.dialogCanSpeekAction = () => { return true; };
        this.dialogCurrentReplicaIndex = -1;
    }

    private dialogIsEnded(): boolean {
        if (this.dialogCountOfReplicas === 0)
            return true;
        return this.dialogCurrentReplicaIndex >= this.dialogCountOfReplicas;
    }

}