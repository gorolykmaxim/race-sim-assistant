import {contextBridge, ipcRenderer} from "electron";

const api = {
    initTimeOfDayAndWeatherInAllSims: () => ipcRenderer.invoke("race-sim-init:initTimeOfDayAndWeatherInAllSims"),
};

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("api", api);
    } catch (error) {
        console.error(error);
    }
} else {
    window.api = api;
}
