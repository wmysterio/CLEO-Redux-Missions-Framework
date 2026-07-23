import { FADE_TRANSITION_DURATION } from "./App";
import { BaseMission } from "./BaseMission";
import { BaseProject } from "./BaseProject";
import { BaseScriptedScene, ISequenceChaining } from "./BaseScriptedScene";
import { BaseStoryline } from "./BaseStoryline";
import { Logger } from "./Logger";
import { Timer } from "./Timer";
import modInfo from "./mod.json";

class ProjectInfo {

    public static readonly MAIN_INI_SECTION: string = "PROJECT";
    public static readonly GAME_DIFFICULTY_INI_KEY: string = "GAME_DIFFICUlTY";
    public static readonly USER_DATA_INI_SECTION: string = "DATA";

    public difficulty: int = 1;
    public titleGxtKey: string;
    public projectIndex: int = -1;
    public rootDirectory: string = "";
    public savePath: string = "";
    public storylines: Map<int, StorylineInfo> = new Map<int, StorylineInfo>();
    public author: string = "";
    public version: string = "";

    public changeDifficulty(level: int): boolean {
        if (this.difficulty === level)
            return true;
        return this.forceChangeDifficulty(level);
    }

    public forceChangeDifficulty(level: int): boolean {
        this.difficulty = this._clampGameDifficulty(level);
        return IniFile.WriteInt(this.difficulty, this.savePath, ProjectInfo.MAIN_INI_SECTION, ProjectInfo.GAME_DIFFICULTY_INI_KEY);
    }



    public constructor(titleGxtKey: string) {
        this.titleGxtKey = titleGxtKey;
    }



    private _clampGameDifficulty(level: int): int {
        if (level < 0)
            return 0;
        if (level > 2)
            return 2;
        return level;
    }

}

class StorylineInfo {

    public progress: int = -1;
    public projectIndex: int = -1;
    public storylineIndex: int = -1;
    public titleGxtKey: string;
    public missions: Map<int, MissionInfo>;

    public constructor(titleGxtKey: string) {
        this.titleGxtKey = titleGxtKey;
        this.missions = new Map<int, MissionInfo>();
    }

}

class MissionInfo {

    public projectIndex: int = -1;
    public storylineIndex: int = -1;
    public missionIndex: int = -1;
    public missionProgressCheckStorylineIndex: int = -1;
    public missionProgressCheckStorylineProgress: int = -1;
    public titleGxtKey: string;
    public create: new () => BaseMission;

    public constructor(titleGxtKey: string, create: new () => BaseMission) {
        this.titleGxtKey = titleGxtKey;
        this.create = create;
    }

    public canStartMission(): boolean {
        if (0 > this.missionProgressCheckStorylineIndex || 0 > this.missionProgressCheckStorylineProgress)
            return true;
        return Core.GetStorylineInfoAt(this.projectIndex, this.missionProgressCheckStorylineIndex).progress > this.missionProgressCheckStorylineProgress;
    }

}

class StorylneProgressChecker {

    public storylineIndex: int;
    public storylineMinProgress: int;

    public constructor(storylineIndex: int, storylineMinProgress: int) {
        this.storylineIndex = storylineIndex;
        this.storylineMinProgress = storylineMinProgress;
    }

}

export class Core {

    private static _ActiveMissionState: int = 0;
    private static _ProjectInfos: Map<int, ProjectInfo> = new Map<int, ProjectInfo>();
    private static _ProjectIndexToRegister: int = -1;
    private static _StorylineIndexToRegister: int = -1;
    private static _MissionToRegister: Array<new () => BaseMission> = [];
    private static _StorylneProgressCheckers: StorylneProgressChecker[] = [];

    private static readonly SKIP_SCRIPTED_SCENE_ERROR = new Error();

    public static readonly MISSION_FAILURE_ERROR = new Error();
    public static readonly MISSION_SUCCESS_ERROR = new Error();
    public static readonly PED_TYPE_FRIEND: int = 29;
    public static readonly PED_TYPE_ENEMY: int = 30;
    public static readonly PED_TYPE_NEUTRAL: int = 31;
    public static readonly SAVE_POSITION_Z: float = 10000.0;

    //@ts-ignore
    public static readonly ActiveMissionInfo: MissionInfo = new MissionInfo("DUMMY", undefined);

    public static CanSetSubMission: boolean = false;
    public static ActiveSubMission: BaseMission;

    public static ActiveMissionStageIndex: int = 0;
    public static ActiveMissionStages: Function[] = [];

    public static GameRootDirectory: string;

    public static ActivationKeyCode: int;
    public static BuildVersion: int;

    public static Player: Player;
    public static PlayerChar: Char;
    public static PlayerGroup: Group;

    public static get ProjectsCount(): int {
        return this._ProjectInfos.size;
    }

    public static get ProjectDifficulty(): int {
        return this.GetProjectInfoAt(this.ActiveMissionInfo.projectIndex).difficulty;
    }

    public static set ProjectDifficulty(level: int) {
        this.GetProjectInfoAt(this.ActiveMissionInfo.projectIndex).changeDifficulty(level);
    }



    public static GetProjectInfoAt(projectIndex: int): ProjectInfo {
        //@ts-ignore
        return this._ProjectInfos.get(projectIndex);
    }

    public static GetStorylineInfoAt(projectIndex: int, storylineIndex: int): StorylineInfo {
        //@ts-ignore
        return this._ProjectInfos.get(projectIndex).storylines.get(storylineIndex);
    }

    public static GetMissionInfoAt(projectIndex: int, storylineIndex: int, missionIndex: int): MissionInfo {
        //@ts-ignore
        return this._ProjectInfos.get(projectIndex).storylines.get(storylineIndex).missions.get(missionIndex);
    }

    public static RegisterMission<TBaseMission extends BaseMission>(baseMissionType: new () => TBaseMission, storylineIndex: int, minStorylineProgress: int): void {
        this._MissionToRegister.push(baseMissionType);
        this._StorylneProgressCheckers.push(new StorylneProgressChecker(storylineIndex, minStorylineProgress));
    }

    public static RegisterStoryline<TBaseStoryline extends BaseStoryline>(baseStorylineType: new () => TBaseStoryline): void {
        new baseStorylineType();
        const missionCount = this._MissionToRegister.length;
        if (missionCount === 0)
            Logger.Exit(`Storyline must have at least one mission!`, true);
        const storylineInfo = new StorylineInfo(baseStorylineType.name);
        storylineInfo.projectIndex = this._ProjectIndexToRegister;
        //@ts-ignore
        storylineInfo.storylineIndex = this._ProjectInfos.get(this._ProjectIndexToRegister).storylines.size;
        this._StorylineIndexToRegister = storylineInfo.storylineIndex;
        for (let i = 0; i < missionCount; ++i) {
            const missionInfo = new MissionInfo(this._MissionToRegister[i].name, this._MissionToRegister[i]);
            missionInfo.projectIndex = this._ProjectIndexToRegister;
            missionInfo.storylineIndex = this._StorylineIndexToRegister;
            missionInfo.missionIndex = i;
            missionInfo.missionProgressCheckStorylineIndex = this._StorylneProgressCheckers[i].storylineIndex;
            missionInfo.missionProgressCheckStorylineProgress = this._StorylneProgressCheckers[i].storylineMinProgress;
            storylineInfo.missions.set(i, missionInfo);
        }
        storylineInfo.progress = this._loadProgress(storylineInfo.missions.size);
        //@ts-ignore
        this._ProjectInfos.get(this._ProjectIndexToRegister).storylines.set(this._StorylineIndexToRegister, storylineInfo);
        this._MissionToRegister = [];
        this._StorylneProgressCheckers = [];
    }

    public static RegisterProject<TBaseProject extends BaseProject>(directoryName: string, baseProjectType: new () => TBaseProject): void {
        const projectInfo = new ProjectInfo(baseProjectType.name);
        projectInfo.projectIndex = this._ProjectInfos.size;
        projectInfo.rootDirectory = `${__dirname}\\${directoryName}`;
        projectInfo.savePath = `${projectInfo.rootDirectory}\\PROJECT.save`;
        let result = IniFile.ReadInt(projectInfo.savePath, ProjectInfo.MAIN_INI_SECTION, ProjectInfo.GAME_DIFFICULTY_INI_KEY);
        if (result === undefined)
            result = 1;
        projectInfo.forceChangeDifficulty(result);
        this._ProjectInfos.set(this._ProjectInfos.size, projectInfo);
        this._ProjectIndexToRegister = projectInfo.projectIndex;
        const project = new baseProjectType();
        projectInfo.author = this._cutProjectInfoAdditionalInfo(project.author);
        projectInfo.version = this._cutProjectInfoAdditionalInfo(project.version);
        //@ts-ignore
        if (this._ProjectInfos.get(this._ProjectIndexToRegister).storylines.size === 0)
            Logger.Exit(`Project must have at least one storyline!`, true);
    }

    public static ClearText(): void {
        Text.ClearHelp();
        Text.ClearPrints();
        Text.ClearSmallPrints();
        for (let i = 0; i < 8; ++i) {
            if (i === 3)
                continue;
            Text.ClearThisPrintBigNow(i);
        }
    }

    public static WaitUntilLoaded<T>(items: T[], checkLoaded: (item: T) => boolean): void {
        do {
            wait(0);
        } while (items.some(item => !checkLoaded(item)));
    }

    public static IsPlayerInactive(): boolean {
        if (!this.Player.isPlaying() || !Char.DoesExist(+this.PlayerChar))
            return true;
        return this.IsCharInactive(this.PlayerChar);
    }

    public static IsCharInactive(char: Char): boolean {
        return !Char.DoesExist(+char) || Char.IsDead(+char) || char.hasBeenArrested();
    }

    public static ResetProject(projectIndex: int): void {
        const projectInfo = this._ProjectInfos.get(projectIndex);
        //@ts-ignore
        const storylines = projectInfo.storylines;
        //@ts-ignore
        if (Fs.DoesFileExist(projectInfo.savePath)) {
            //@ts-ignore
            IniFile.DeleteSection(projectInfo.savePath, ProjectInfo.MAIN_INI_SECTION);
            //@ts-ignore
            IniFile.DeleteSection(projectInfo.savePath, ProjectInfo.USER_DATA_INI_SECTION);
            //@ts-ignore
            projectInfo.forceChangeDifficulty(1);
            //Fs.DeleteFile(projectInfo.savePath) || Logger.Print(`Failed to reset project!`);
        }
        for (const [_, storyline] of storylines)
            storyline.progress = 0;
    }

    public static LoadFxtFile(projectIndex: int): void {
        //@ts-ignore
        const fxtPath = `${this._ProjectInfos.get(projectIndex).rootDirectory}\\PROJECT.fxt`;
        if (Fs.DoesFileExist(fxtPath))
            Text.LoadFxt(fxtPath) || Logger.Print(`Failed to load Fxt file!`);
    }

    public static UnloadFxtFile(projectIndex: int): void {
        //@ts-ignore
        const fxtPath = `${this._ProjectInfos.get(projectIndex).rootDirectory}\\PROJECT.fxt`;
        //Text.UnloadFxt(fxtPath) || Logger.Print(`Failed to unload Fxt file!`); // always false?
        if (Fs.DoesFileExist(fxtPath))
            Text.UnloadFxt(fxtPath);
    }

    public static WriteIntValueToSaveFile(projectIndex: int, key: string, value: int): void {
        const projectInfo = this.GetProjectInfoAt(projectIndex);
        if (!IniFile.WriteInt(value, projectInfo.savePath, ProjectInfo.USER_DATA_INI_SECTION, key))
            Logger.Print(`Failed to write int value to save file!`);
    }

    public static ReadIntValueFromSaveFile(projectIndex: int, key: string, defaultValue: int = 0): int {
        const projectInfo = this.GetProjectInfoAt(projectIndex);
        const value = IniFile.ReadInt(projectInfo.savePath, ProjectInfo.USER_DATA_INI_SECTION, key);
        return value === undefined ? defaultValue : value;
    }

    public static WriteFloatValueToSaveFile(projectIndex: int, key: string, value: float): void {
        const projectInfo = this.GetProjectInfoAt(projectIndex);
        if (!IniFile.WriteFloat(value, projectInfo.savePath, ProjectInfo.USER_DATA_INI_SECTION, key))
            Logger.Print(`Failed to write float value to save file!`);
    }

    public static ReadFloatValueFromSaveFile(projectIndex: int, key: string, defaultValue: float = 0.0): float {
        const projectInfo = this.GetProjectInfoAt(projectIndex);
        const value = IniFile.ReadFloat(projectInfo.savePath, ProjectInfo.USER_DATA_INI_SECTION, key);
        return value === undefined ? defaultValue : value;
    }

    public static WriteStringValueToSaveFile(projectIndex: int, key: string, value: string): void {
        const projectInfo = this.GetProjectInfoAt(projectIndex);
        if (!IniFile.WriteString(value, projectInfo.savePath, ProjectInfo.USER_DATA_INI_SECTION, key))
            Logger.Print(`Failed to write float value to save file!`);
    }

    public static ReadStringValueFromSaveFile(projectIndex: int, key: string, defaultValue: string = ""): string {
        const projectInfo = this.GetProjectInfoAt(projectIndex);
        const value = IniFile.ReadString(projectInfo.savePath, ProjectInfo.USER_DATA_INI_SECTION, key);
        return value === undefined ? defaultValue : value;
    }

    public static InitializePlayer(): void {
        this.Player = new Player(0);
        while (!this.Player.isPlaying())
            wait(250);
        this.PlayerChar = Core.Player.getChar();
        this.PlayerGroup = Core.Player.getGroup();
    }

    public static Run(): void {
        if (HOST !== "sa")
            exit(`Unsupported game!`);
        if (this.ProjectsCount === 0)
            Logger.Exit(`Application must have at least one project!`, true);
        this.ActivationKeyCode = modInfo.userData.activationKeyCode;
        this.BuildVersion = modInfo.userData.buildVersion;
        this._initializeGameRootDirectory();
        this.InitializePlayer();
        //@ts-ignore
        this._MissionToRegister = undefined;
        //@ts-ignore
        this._StorylneProgressCheckers = undefined;
    }

    public static RunMission(): void {
        const missionInfo = this.GetMissionInfoAt(this.ActiveMissionInfo.projectIndex, this.ActiveMissionInfo.storylineIndex, this.ActiveMissionInfo.missionIndex);
        let mission = new missionInfo.create();
        ONMISSION = true;
        TIMERA = 0;
        TIMERB = 0;
        try {
            do {
                wait(0);
                if (this.IsPlayerInactive())
                    this._ActiveMissionState = 3;
                switch (this._ActiveMissionState) {
                    case 0:
                        this.CanSetSubMission = true;
                        mission.onInitEvent();
                        if (this.ActiveSubMission !== undefined)
                            mission = this.ActiveSubMission;
                        this.CanSetSubMission = false;
                        this.ClearActiveMissionStages();
                        this._runMissionStartEvent(mission);
                        break;
                    case 1:
                        this._runMissionUpdateEvent(mission);
                        break;
                    case 2:
                        this._runMissionSuccessEvent(mission);
                        break;
                    case 3:
                        this._runMissionFailureEvent(mission);
                        break;
                    case 4:
                        this._runMissionEndEvent(mission);
                        break;
                }
            } while (this._ActiveMissionState !== 5);
        } catch (error: any) {
            this.ClearText();
            Logger.Print(error.message, true);
        }
        this.ClearActiveMissionStages();
        this.CanSetSubMission = false;
        //@ts-ignore
        this._ActiveSubMission = undefined;
        ONMISSION = false;
        this._ActiveMissionState = 0;
    }

    public static ClearActiveMissionStages(): void {
        this.ActiveMissionStageIndex = 0;
        this.ActiveMissionStages = [];
    }

    public static RunScriptedScene(scriptedScene: BaseScriptedScene, debugMode: boolean): void {
        this._runScriptedSceneBeforeInitEvent();
        scriptedScene.onInitEvent();
        if (debugMode) {
            scriptedScene.onStartEvent();
            wait(1500);
            scriptedScene.onRunEvent();
            this._playSequenceChaining(scriptedScene);
            scriptedScene.resetCamera();
            scriptedScene.onCleanupEvent();
            scriptedScene.onEndEvent();
            this._runScriptedSceneAfterEndEvent();
            return;
        }
        Hud.DisplayZoneNames(false);
        Hud.DisplayCarNames(false);
        this.Player.setControl(false);
        wait(scriptedScene.fadeToOpaque());
        Hud.DisplayRadar(false);
        Hud.Display(false);
        Hud.SwitchWidescreen(true);
        this._disableDefaultWorldSetting();
        scriptedScene.onStartEvent();
        wait(1500);
        scriptedScene.clearText();
        scriptedScene.fadeToTransparent();
        scriptedScene.onRunEvent();
        this._playSequenceChaining(scriptedScene);
        scriptedScene.clearText();
        wait(scriptedScene.fadeToOpaque());
        scriptedScene.resetCamera();
        scriptedScene.onCleanupEvent();
        scriptedScene.onEndEvent();
        wait(FADE_TRANSITION_DURATION);
        this._runScriptedSceneAfterEndEvent();
        this.PlayerChar.clearTasksImmediately();
        this.Player.setControl(true);
        scriptedScene.resetHud();
        scriptedScene.clearText();
        this._enableDefaultWorldSetting();
        if (scriptedScene.preventFadeToTransparentAtEnd)
            return;
        scriptedScene.fadeToTransparent();
    }

    public static ReadStringFromMemory(pBuffer: int, length: int): string {
        let result = "";
        for (let i = 0; i < length; ++i) {
            const charCode = Memory.ReadU8(pBuffer + i, false);
            if (charCode === 0)
                break;
            result += String.fromCharCode(charCode);
        }
        return result;
    }

    public static AllocateMemoryFilled(size: int, byte: int = 0): int | undefined {
        const pBuffer = Memory.Allocate(size);
        if (pBuffer !== undefined)
            this.FillBuffer(pBuffer, size, byte);
        return pBuffer;
    }

    public static FillBuffer(pBuffer: int, length: int, byte: int = 0): void {
        for (let i = 0; i < length; ++i)
            Memory.WriteU8(pBuffer + i, byte);
    }

    public static WriteStringToMemory(text: string): { pointer: int | undefined, length: int } {
        const length = text.length;
        let hasError = false;
        for (let i = 0; i < length; ++i) {
            const charCode = text.charCodeAt(i);
            if (0x80 > charCode)
                continue;
            hasError = true;
            break;
        }
        const result = {
            length: 0,
            pointer: hasError ? undefined : this.AllocateMemoryFilled(length + 1),
        };
        if (result.pointer !== undefined) {
            result.length = length + 1;
            Memory.WriteUtf8(result.pointer, text, false);
            Memory.WriteI8(result.pointer + length, 0, false);
        }
        return result;
    }

    public static GetTrainModels(trainType: int): int[] {
        if (0 > trainType || trainType > 15)
            throw new Error(`Incorrect train type '${trainType}'!`);
        if (trainType === 15)
            return [538];
        if ([8, 9, 14].includes(trainType))
            return [449];
        if ([1, 2, 4, 5, 7, 11].includes(trainType))
            return [538, 570];
        return [537, 569];
    }

    public static FindCharsByPedType(chars: Char[], type: int): Char[] {
        const resullt: Char[] = [];
        chars.forEach(char => {
            if (char.getPedType() === type)
                resullt.push(char);
        });
        return resullt;
    }


    private static _runMissionStartEvent(mission: BaseMission): void {
        mission.clearText();
        Stat.RegisterMissionGiven();
        Stat.ShowUpdateStats(false);
        Game.SetCreateRandomGangMembers(false);
        Game.SetCreateRandomCops(false);
        Game.EnableAmbientCrime(false);
        Game.SwitchPoliceHelis(false);
        Game.SwitchCopsOnBikes(false);
        Game.SwitchRandomTrains(false);
        Game.SwitchAmbientPlanes(false);
        Game.SwitchEmergencyServices(false);
        Game.SetRelationship(0, this.PED_TYPE_NEUTRAL, 0);
        Game.SetRelationship(0, this.PED_TYPE_NEUTRAL, this.PED_TYPE_NEUTRAL);
        Game.SetRelationship(0, this.PED_TYPE_NEUTRAL, this.PED_TYPE_FRIEND);
        Game.SetRelationship(0, this.PED_TYPE_NEUTRAL, this.PED_TYPE_ENEMY);
        Game.SetRelationship(0, this.PED_TYPE_FRIEND, 0);
        Game.SetRelationship(0, this.PED_TYPE_FRIEND, this.PED_TYPE_NEUTRAL);
        Game.SetRelationship(0, this.PED_TYPE_FRIEND, this.PED_TYPE_FRIEND);
        Game.SetRelationship(4, this.PED_TYPE_FRIEND, this.PED_TYPE_ENEMY);
        Game.SetRelationship(4, this.PED_TYPE_ENEMY, 0);
        Game.SetRelationship(0, this.PED_TYPE_ENEMY, this.PED_TYPE_NEUTRAL);
        Game.SetRelationship(4, this.PED_TYPE_ENEMY, this.PED_TYPE_FRIEND);
        Game.SetRelationship(0, this.PED_TYPE_ENEMY, this.PED_TYPE_ENEMY);
        this.Player.setGroupRecruitment(false);
        mission.playerGroup.remove();
        mission.backgroundAudio.play(0, true);
        if (mission.enableTitleMessage) {
            if (this.ActiveSubMission === undefined) {
                Text.PrintBig(this.ActiveMissionInfo.titleGxtKey, 1000, 2);
            } else {
                Text.PrintBig(this.ActiveSubMission.constructor.name, 1000, 2);
            }
        }
        mission.onStartEvent();
        mission.backgroundAudio.play(0, true);
        this._ActiveMissionState = 1;
    }

    private static _runMissionUpdateEvent(mission: BaseMission): void {
        try {
            if (ONMISSION) {
                mission.onUpdateEvent();
                const activeMissionStageIndex = this.ActiveMissionStageIndex;
                if (this.ActiveMissionStages.length > activeMissionStageIndex && this.ActiveMissionStages[activeMissionStageIndex].call(mission)) {
                    if (activeMissionStageIndex !== this.ActiveMissionStageIndex)
                        return;
                    if (this.ActiveMissionStages.length > 0)
                        this.ActiveMissionStageIndex += 1;
                }
                return;
            }
            throw this.MISSION_FAILURE_ERROR;
        } catch (error) {
            if (error === this.MISSION_SUCCESS_ERROR) {
                this._ActiveMissionState = 2;
            } else if (error === this.MISSION_FAILURE_ERROR) {
                this._ActiveMissionState = 3;
            } else {
                this._ActiveMissionState = 5;
                throw error;
            }
        }
    }

    private static _runMissionSuccessEvent(mission: BaseMission): void {
        this._runMissionCleanupEvent(mission);
        Stat.IncrementIntNoMessage(147, 1);
        if (mission.successSound)
            Audio.PlayMissionPassedTune(1);
        const respectReward = mission.respectReward;
        const cashReward = mission.cashReward;
        let rewardFlag = 0;
        if (mission.respectReward > 0) {
            rewardFlag += 1;
            Stat.AwardPlayerMissionRespect(respectReward);
        }
        if (cashReward > 0) {
            rewardFlag += 2;
            this.Player.addScore(cashReward);
        }
        const bigMessage = mission.successBigMessage;
        if (bigMessage.isEnabled) {
            switch (rewardFlag) {
                case 3:
                    Text.PrintWithNumberBig("M_PASSS", cashReward, 5000, 1); // Mission passed +$ +Respect
                    break;
                case 2:
                    Text.PrintWithNumberBig("M_PASS", cashReward, 5000, 1); // Mission passed +$
                    break;
                case 1:
                    Text.PrintBig("M_PASSR", 5000, 1); // Mission passed +Respect
                    break;
                default:
                    Text.PrintBig(bigMessage.gxt, bigMessage.duration, 1);
                    break;
            }
        }
        mission.onSuccessEvent();
        if (mission.enableProgressSaving)
            this._saveProgress();
        this._ActiveMissionState = 4;
    }

    private static _runMissionFailureEvent(mission: BaseMission): void {
        this._runMissionCleanupEvent(mission);
        mission.onFailureEvent();
        const bigMessage = mission.failureBigMessage;
        if (bigMessage.isEnabled) {
            wait(250);
            Text.PrintBig(bigMessage.gxt, bigMessage.duration, 1);
        }
        const smallMessage = mission.failureSmallMessage;
        if (smallMessage.duration > 0)
            Text.PrintNow(smallMessage.gxt, smallMessage.duration, 1);
        this._ActiveMissionState = 4;
    }

    private static _runMissionCleanupEvent(mission: BaseMission): void {
        mission.clearText();
        mission.voiceAudio.unload();
        mission.backgroundAudio.unload();
        mission.dialogue.unload();
        mission.onCleanupEvent();
    }

    private static _runMissionEndEvent(mission: BaseMission): void {
        Game.SetCreateRandomGangMembers(true);
        Game.SetCreateRandomCops(true);
        Game.EnableAmbientCrime(true);
        Game.SwitchPoliceHelis(true);
        Game.SwitchCopsOnBikes(true);
        Game.SwitchRandomTrains(true);
        Game.SwitchAmbientPlanes(true);
        Game.SwitchEmergencyServices(true);
        Game.ClearRelationship(0, this.PED_TYPE_NEUTRAL, 0);
        Game.ClearRelationship(0, this.PED_TYPE_NEUTRAL, this.PED_TYPE_NEUTRAL);
        Game.ClearRelationship(0, this.PED_TYPE_NEUTRAL, this.PED_TYPE_FRIEND);
        Game.ClearRelationship(0, this.PED_TYPE_NEUTRAL, this.PED_TYPE_ENEMY);
        Game.ClearRelationship(0, this.PED_TYPE_FRIEND, 0);
        Game.ClearRelationship(0, this.PED_TYPE_FRIEND, this.PED_TYPE_NEUTRAL);
        Game.ClearRelationship(0, this.PED_TYPE_FRIEND, this.PED_TYPE_FRIEND);
        Game.ClearRelationship(4, this.PED_TYPE_FRIEND, this.PED_TYPE_ENEMY);
        Game.ClearRelationship(4, this.PED_TYPE_ENEMY, 0);
        Game.ClearRelationship(0, this.PED_TYPE_ENEMY, this.PED_TYPE_NEUTRAL);
        Game.ClearRelationship(4, this.PED_TYPE_ENEMY, this.PED_TYPE_FRIEND);
        Game.ClearRelationship(0, this.PED_TYPE_ENEMY, this.PED_TYPE_ENEMY);
        this._runScriptedSceneAfterEndEvent();
        mission.resetHud();
        mission.resetCamera();
        this._enableDefaultWorldSetting();
        Weather.Release();
        this.Player.alterWantedLevelNoDrop(0);
        this.Player.setGroupRecruitment(true).setControl(true);
        this.PlayerGroup.remove();
        Stat.ShowUpdateStats(true);
        Mission.Finish();
        mission.onEndEvent();
        this._ActiveMissionState = 5;
    }

    private static _playSequenceChaining(sequenceChaining: ISequenceChaining): void {
        Game.AllowPauseInWidescreen(true);
        const _wait = wait;
        const _fade = Camera.DoFade;
        Camera.DoFade = (time, direction) => {
            Logger.Print("Do not use 'Camera.DoFade' method during a scripted scene. There may be bugs!", true);
        };
        //@ts-ignore
        wait = (time) => {
            Logger.Print("Do not use the 'wait' function during a scripted scene. There may be bugs!", true);
        };
        const scriptedWait = (time: int) => {
            _wait(time);
            if (Pad.IsSkipCutsceneButtonPressed())
                throw this.SKIP_SCRIPTED_SCENE_ERROR;
        };
        const timer = new Timer();
        const actions = sequenceChaining.actionsSequence;
        try {
            for (let i = 0; i < actions.length; ++i) {
                const action = actions[i];
                if (action.action !== undefined)
                    action.action();
                if (action.duration === -1) {
                    if (action.condition === undefined)
                        continue;
                    while (action.condition())
                        scriptedWait(0);
                    continue;
                }
                timer.reset();
                while (action.duration > timer.millisecondsPassed)
                    scriptedWait(0);
            }
        } catch (e) {
            if (e !== this.SKIP_SCRIPTED_SCENE_ERROR)
                throw e;
        } finally {
            //@ts-ignore
            wait = _wait;
            Camera.DoFade = _fade;
            Game.AllowPauseInWidescreen(false);
        }
    }

    private static _runScriptedSceneBeforeInitEvent(): void {
        this.PlayerChar
            .hideWeaponForScriptedCutscene(true)
            .shutUp(true)
            .clearTasks()
            .clearLookAt()
            .stopFacialTalk();
    }

    private static _runScriptedSceneAfterEndEvent(): void {
        this.PlayerChar
            .hideWeaponForScriptedCutscene(false)
            .shutUp(false)
            .clearTasks()
            .clearLookAt()
            .stopFacialTalk()
            .setCanBeKnockedOffBike(false);
    }

    private static _disableDefaultWorldSetting(): void {
        World.SetPedDensityMultiplier(0.0);
        World.SetCarDensityMultiplier(0.0);
        Game.SetWantedMultiplier(0.0);
        Game.SetPoliceIgnorePlayer(this.Player, true);
        Game.SetEveryoneIgnorePlayer(this.Player, true);
    }

    private static _enableDefaultWorldSetting(): void {
        World.SetPedDensityMultiplier(1.0);
        World.SetCarDensityMultiplier(1.0);
        Game.SetWantedMultiplier(1.0);
        Game.SetPoliceIgnorePlayer(this.Player, false);
        Game.SetEveryoneIgnorePlayer(this.Player, false);
    }

    private static _getMissionsPassedIniKey(storylineIndex: int): string {
        return `STORYLINE_${storylineIndex}_MISSIONS_PASSED`;
    }

    private static _loadProgress(maxProgress: int): int {
        //@ts-ignore
        let progress = IniFile.ReadInt(this._ProjectInfos.get(this._ProjectIndexToRegister).savePath, ProjectInfo.MAIN_INI_SECTION, this._getMissionsPassedIniKey(this._StorylineIndexToRegister));
        if (progress === undefined || 0 > progress)
            progress = 0;
        const numMissions = maxProgress;
        if (progress >= numMissions)
            progress = numMissions;
        return progress;
    }

    private static _saveProgress(): void {
        const nextProgress: int = this.ActiveMissionInfo.missionIndex + 1;
        //@ts-ignore
        IniFile.WriteInt(nextProgress, this._ProjectInfos.get(this.ActiveMissionInfo.projectIndex).savePath, ProjectInfo.MAIN_INI_SECTION, this._getMissionsPassedIniKey(this.ActiveMissionInfo.storylineIndex));
        //@ts-ignore
        this._ProjectInfos.get(this.ActiveMissionInfo.projectIndex).storylines.get(this.ActiveMissionInfo.storylineIndex).progress = nextProgress;
    }

    private static _initializeGameRootDirectory(): void {
        const split = __dirname.split('\\');
        const cleoIndex = split.findIndex(s => s.toUpperCase() === "CLEO");
        if (cleoIndex === -1 || cleoIndex < 2)
            Logger.Exit(`Invalid framework directory: '${__dirname}'!`, true);
        this.GameRootDirectory = split.slice(cleoIndex).join('\\').replace(/^\\/g, '');
    }

    private static _cutProjectInfoAdditionalInfo(infoString: string): string {
        if (infoString === undefined)
            return "";
        infoString = infoString.trim();
        if (infoString.length > 30)
            infoString = infoString.substring(0, 30);
        return infoString;
    }



    private constructor() { }

}