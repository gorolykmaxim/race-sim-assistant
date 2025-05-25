import {contextBridge, ipcRenderer} from "electron";

const api = {
    initTimeOfDayAndWeatherInAllSims: () => ipcRenderer.invoke("race-sim-init:initTimeOfDayAndWeatherInAllSims"),
    fetchRaceSchedule: () => ipcRenderer.invoke("race-schedule:fetchRaceSchedule"),
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
