import os = require("os");
import path = require("path");
import * as config from "./config";
import { mkDirByPathSync } from "./fsutils"

export function getToolsFolder(): string {
    let home = getHomeFolder();
    let folder = path.join(home, config.ROOT_FOLDER_NAME);
    mkDirByPathSync(folder);
    return folder;
}

export function getToolsSubfolder(subfolder: string): string {
    let folder = path.join(getToolsFolder(), subfolder)
    mkDirByPathSync(folder);
    return folder;
}

export function getToolsPath(relativePath: string): string {
    let absolutePath = path.join(getToolsFolder(), relativePath)
    return absolutePath;
}

function getHomeFolder(): string {
    return os.homedir();
}

