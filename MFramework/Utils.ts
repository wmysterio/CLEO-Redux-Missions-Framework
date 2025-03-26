/// Created by wmysterio, 26.03.2025
/// https://github.com/wmysterio/CLEO-Redux-Missions-Framework
/// <reference path="../.config/sa.d.ts" />

export const player: Player = new Player(0);
export const playerChar: Char = player.getChar();
export const playerGroup: Group = player.getGroup();
/** Car with handle -1 by default */
export let playerCar: Car = new Car(-1);

/**
 * Checks if the player is unable to play
 * @returns Returns true if the player is not found, not playing, dead, or arrested
 */
export function isPlayerNotPlaying(): boolean {
    return !player.isPlaying() || !Char.DoesExist(+playerChar) || Char.IsDead(+playerChar) || playerChar.hasBeenArrested();
}