import { BaseProject } from "../BaseProject";
import "./STORY00"; // 0
import "./STORY01"; // 1
import "./STORY02"; // 2

new class PROJECT extends BaseProject { public getRootDirectory(): string { return __dirname; } }