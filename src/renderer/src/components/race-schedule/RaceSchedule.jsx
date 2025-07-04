import {useEffect, useState} from "react";
import "./RaceSchedule.scss"
import TracksACC from "./TracksACC";
import TracksLMU from "./TracksLMU";
import TracksRF2 from "./TracksRF2";
import ACCLogo from "../../assets/race-sim-logos/acc.png";
import LMULogo from "../../assets/race-sim-logos/lmu.png";
import RF2Logo from "../../assets/race-sim-logos/rf2.png";
import seedrandom from "seedrandom";

function pickRandomTrack(tracks) {
    tracks = tracks.slice();
    const msInDay = 1000 * 60 * 60 * 24;
    const msInWeek = msInDay * 7;
    const ts = Date.now() + msInDay * 2; // Each week starts on tuesday
    const weeks = Math.floor(ts / msInWeek);
    const seed = Math.floor(weeks / tracks.length);
    const random = seedrandom(seed);
    let i = tracks.length;
    while (i !== 0) {
        let j = Math.floor(random() * i);
        i--;
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    const track = tracks[weeks % tracks.length];
    const layout = track.layouts[random() < 0.5 ? 0 : Math.floor(random() * track.layouts.length)];
    return {name: track.name, thumbnail: track.thumbnail, layout};
}

function Race({raceSimLogo, tracks}) {
    const [track, setTrack] = useState({});
    useEffect(() => setTrack(pickRandomTrack(tracks)), []);
    return (
        <div className={"col"}>
            <div className={"card text-bg-dark"}>
                <img src={track.thumbnail} className={"card-img race-image opacity-50"} alt={track.name}/>
                <div className={"card-img-overlay d-flex flex-column justify-content-between"}>
                    <div>
                        <h5 className={"card-title"}>{track.name}</h5>
                        <p className={"card-text"}>{track.layout}</p>
                    </div>
                    <img src={raceSimLogo} className={"race-sim-logo align-self-end"}/>
                </div>
            </div>
        </div>
    );
}

export default function RaceSchedule({className}) {
    return <div className={`row row-cols-3 g-4 ${className || ""}`}>
        <Race raceSimLogo={LMULogo} tracks={TracksLMU}/>
        <Race raceSimLogo={ACCLogo} tracks={TracksACC}/>
        <Race raceSimLogo={RF2Logo} tracks={TracksRF2}/>
    </div>;
}