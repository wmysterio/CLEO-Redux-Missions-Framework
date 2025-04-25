/// Created by wmysterio, 04.04.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path=".././.config/sa.d.ts" />

import { Timer } from "./Timer";

/** Class for working with scripted video clips */
export class ScriptedClips {

    private scriptedClipsDurations: int[];
    private scriptedClipsConditions: Function[];
    private scriptedClipsActions: Function[];
    private scriptedClipsTimer: Timer;

    constructor() {
        this.scriptedClipsDurations = new Array<int>();
        this.scriptedClipsConditions = new Array<Function>();
        this.scriptedClipsActions = new Array<Function>();
        this.scriptedClipsTimer = new Timer();
    }

    /** Plays all added scripted clips. Used for internal work of the framework */
    public static Play(clips: ScriptedClips): void {
        const contollableSkipScriptSceneError = new Error();
        const _wait = wait;
        const _fade = Camera.DoFade;
        Camera.DoFade = (time, direction) => {
            log("Don't use the 'Camera.DoFade' method during a scripted scene. There may be bugs!")
        };
        //@ts-ignore
        wait = (time) => {
            log("Don't use the 'wait' function during a scripted scene. There may be bugs!")
        };
        const scriptedWait = (time) => {
            _wait(time);
            if (Pad.IsSkipCutsceneButtonPressed())
                throw contollableSkipScriptSceneError;
        };
        let length = clips.scriptedClipsDurations.length;
        try {
            for (let i = 0; i < length; ++i) {
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
                //log("D:" + duration + " L:" + clips.scriptedClipsTimer.getMillisecondsLeft() + " P:" + clips.scriptedClipsTimer.getMillisecondsPassed());
                while (duration > clips.scriptedClipsTimer.getMillisecondsPassed())
                    scriptedWait(0);
            }
        } catch (e) {
            if (e !== contollableSkipScriptSceneError)
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
        return this;
    }

    /** Tells the scripted clip to wait for the specified time in milliseconds  */
    public wait(duration: int): ScriptedClips {
        //log(duration);
        this.scriptedClipsDurations.push(0 > duration ? 0 : duration);
        this.scriptedClipsConditions.push(undefined);
        this.scriptedClipsActions.push(undefined);
        return this;
    }

    /** Tells the scripted clip to wait until a condition is met */
    public waitUntil(condition: () => boolean): ScriptedClips {
        this.scriptedClipsDurations.push(-1);
        this.scriptedClipsConditions.push(condition);
        this.scriptedClipsActions.push(undefined);
        return this;
    }

}