/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

export let player: Player = new Player(0);
export let playerChar: Char = player.getChar();

/** Returns true if the player is not found, not playing, dead, or arrested */
export function isPlayerNotPlaying(): boolean {
    return !player.isPlaying() || !Char.DoesExist(+playerChar) || Char.IsDead(+playerChar) || playerChar.hasBeenArrested();
}