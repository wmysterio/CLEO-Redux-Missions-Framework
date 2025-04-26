/// Created by wmysterio, 04.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

import { Timer } from "./Timer";

/** Class for working with scripted video clips */
export class ScriptedClips {

    private scriptedClipsDurations: int[];
    private scriptedClipsConditions: Function[];
    private scriptedClipsActions: Function[];
    private scriptedClipsSubClips: ScriptedClips[];
    private scriptedClipsTimer: Timer;
    private scriptedClipsBeforeAction: Function;

    constructor() {
        this.scriptedClipsDurations = new Array<int>();
        this.scriptedClipsConditions = new Array<Function>();
        this.scriptedClipsActions = new Array<Function>();
        this.scriptedClipsSubClips = new Array<ScriptedClips>();
        this.scriptedClipsTimer = new Timer();
        this.scriptedClipsBeforeAction = undefined;
    }

    /** Plays scripted clips */
    public static Play(clips: ScriptedClips): void {
        const contollableSkipScriptSceneError = new Error();
        let _wait = wait;
        let _fade = Camera.DoFade;
        Camera.DoFade = (time, direction) => {
            if (!clips.scriptedClipsSubClips)
                log("Don't use the 'Camera.DoFade' method during a scripted scene. There may be bugs!")
        };
        //@ts-ignore
        wait = (time) => {
            if (!clips.scriptedClipsSubClips)
                log("Don't use the 'wait' function during a scripted scene. There may be bugs!")
        };
        let scriptedWait = (time) => {
            _wait(time);
            if (Pad.IsSkipCutsceneButtonPressed())
                throw contollableSkipScriptSceneError;
        };
        let length = clips.scriptedClipsDurations.length;
        try {
            for (let i = 0; i < length; ++i) {
                let subClip = clips.scriptedClipsSubClips[i];
                if (subClip !== undefined) {
                    if (!Camera.GetFadingStatus())
                        _fade(800, 0);
                    while (Camera.GetFadingStatus())
                        _wait(199);
                    if (subClip.scriptedClipsBeforeAction !== undefined)
                        subClip.scriptedClipsBeforeAction();
                    _wait(1000);
                    //@ts-ignore
                    wait = _wait;
                    Camera.DoFade = _fade;
                    _fade(800, 1);
                    ScriptedClips.Play(subClip);
                    _fade(800, 0);
                    while (Camera.GetFadingStatus())
                        _wait(199);
                    Camera.ResetNewScriptables()
                    Camera.RestoreJumpcut();
                    Camera.SetBehindPlayer();
                    _wait = wait;
                    _fade = Camera.DoFade;
                    continue;
                }
                let duration = clips.scriptedClipsDurations[i];
                let clipAction = clips.scriptedClipsActions[i];
                let clipCondition = clips.scriptedClipsConditions[i];
                if (clipAction !== undefined)
                    clipAction();
                if (duration === -1) {
                    if (clipCondition === undefined)
                        continue;
                    while (clipCondition())
                        scriptedWait(0);
                    continue;
                }
                clips.scriptedClipsTimer.set();
                while (duration > clips.scriptedClipsTimer.getMillisecondsPassed())
                    scriptedWait(0);
            }
        } catch (e) {
            if (e !== contollableSkipScriptSceneError) {
                //@ts-ignore
                wait = _wait;
                Camera.DoFade = _fade;
                throw e;
            }
            log(e);
        }
        //@ts-ignore
        wait = _wait;
        Camera.DoFade = _fade;
    }

    /** Tells the scripted clip to perform the specified action without waiting or conditions */
    public action(action: () => void): ScriptedClips {
        this.scriptedClipsDurations.push(-1);
        this.scriptedClipsConditions.push(undefined);
        this.scriptedClipsActions.push(action);
        this.scriptedClipsSubClips.push(undefined);
        return this;
    }

    /** Tells the scripted clip to wait for the specified time in milliseconds  */
    public wait(duration: int): ScriptedClips {
        this.scriptedClipsDurations.push(0 > duration ? 0 : duration);
        this.scriptedClipsConditions.push(undefined);
        this.scriptedClipsActions.push(undefined);
        this.scriptedClipsSubClips.push(undefined);
        return this;
    }

    /** Tells the scripted clip to wait until a condition is met */
    public waitUntil(condition: () => boolean): ScriptedClips {
        this.scriptedClipsDurations.push(-1);
        this.scriptedClipsConditions.push(condition);
        this.scriptedClipsActions.push(undefined);
        this.scriptedClipsSubClips.push(undefined);
        return this;
    }

    /** Tells a script clip to play another script clip. Try not to call this method recursively! */
    public play(scriptedClips: ScriptedClips, beforeAction: () => void = undefined): void {
        this.scriptedClipsDurations.push(-1);
        this.scriptedClipsConditions.push(undefined);
        this.scriptedClipsActions.push(undefined);
        scriptedClips.scriptedClipsBeforeAction = beforeAction;
        this.scriptedClipsSubClips.push(scriptedClips);
    }

}