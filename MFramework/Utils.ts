/// <reference path="../.config/sa.d.ts" />

export const player: Player = new Player( 0 );
export const char: Char = player.getChar();
export const group: Group = player.getGroup();
export const car: Car = new Car( -1 );

export function isPlayerOffGame() : boolean {
    return !player.isPlaying() || !Char.DoesExist( +char ) || Char.IsDead( +char ) || char.hasBeenArrested();
}