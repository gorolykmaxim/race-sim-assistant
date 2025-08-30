import {useEffect, useState} from "react";
import "./RaceSchedule.scss"
import TracksACC from "./TracksACC";
import TracksLMU from "./TracksLMU";
import TracksRF2 from "./TracksRF2";
import TracksAMS2IMSA from "./TracksAMS2IMSA";
import TracksAMS2IndyCar from "./TracksAMS2IndyCar";
import ACCLogo from "../../assets/race-sim-logos/acc.png";
import LMULogo from "../../assets/race-sim-logos/lmu.png";
import RF2Logo from "../../assets/race-sim-logos/rf2.png";
import AMS2IMSALogo from "../../assets/race-sim-logos/ams2-imsa.png";
import AMS2IndyCarLogo from "../../assets/race-sim-logos/ams2-indycar.png";
import seedrandom from "seedrandom";

function LoadingPlaceholder() {
    return <div className={"d-flex justify-content-center mt-2 mb-2"}>
        <div className={"spinner-border"} role={"status"}>
            <span className={"visually-hidden"}>Loading...</span>
        </div>
    </div>;
}

function Race({title, subtitle, thumbnail, logo}) {
    return <div className={"col"}>
        <div className={"card text-bg-dark"}>
            <img src={thumbnail} className={"card-img race-image opacity-50"} alt={title}/>
            <div className={"card-img-overlay d-flex flex-column justify-content-between"}>
                <div>
                    <h5 className={"card-title"}>{title}</h5>
                    <p className={"card-text"}>{subtitle}</p>
                </div>
                <img src={logo} className={"race-sim-logo align-self-end"}/>
            </div>
        </div>
    </div>;
}

function Schedule({title, className, children}) {
    return <div className={className}>
        <h3 className={"mt-4 mb-2"}>{title}</h3>
        <div className={"row row-cols-4 g-4"}>
            {children}
        </div>
    </div>;
}

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

function SingleplayerRace({raceSimLogo, tracks}) {
    const [track, setTrack] = useState({});
    useEffect(() => setTrack(pickRandomTrack(tracks)), []);
    return <Race title={track.name} subtitle={track.layout} thumbnail={track.thumbnail} logo={raceSimLogo}/>;
}

function SingleplayerRaceSchedule({className}) {
    return <Schedule title={"Singleplayer Races"} className={className}>
        <SingleplayerRace raceSimLogo={LMULogo} tracks={TracksLMU}/>
        <SingleplayerRace raceSimLogo={ACCLogo} tracks={TracksACC}/>
        <SingleplayerRace raceSimLogo={AMS2IMSALogo} tracks={TracksAMS2IMSA}/>
        <SingleplayerRace raceSimLogo={AMS2IndyCarLogo} tracks={TracksAMS2IndyCar}/>
        <SingleplayerRace raceSimLogo={RF2Logo} tracks={TracksRF2}/>
    </Schedule>;
}

function MultiplayerRaceSchedule() {
    const [schedules, setSchedules] = useState(null);

    async function init() {
        const CACHE_TTL_MS = 2 * 60 * 60 * 1000;
        let raceSchedule = localStorage.getItem("raceSchedule");
        if (raceSchedule) {
            raceSchedule = JSON.parse(raceSchedule);
            if (Date.now() - raceSchedule.timestamp < CACHE_TTL_MS) {
                setSchedules(raceSchedule.schedules);
                return;
            }
        }
        raceSchedule = {
            schedules: await api.fetchRaceSchedule(),
            timestamp: Date.now(),
        };
        localStorage.setItem("raceSchedule", JSON.stringify(raceSchedule));
        setSchedules(raceSchedule.schedules);
    }

    useEffect(() => {
        init();
    }, []);

    if (schedules == null) {
        return <LoadingPlaceholder/>;
    } else {
        let cards = [];
        for (const schedule of schedules || []) {
            const {logoImageUrl, races} = schedule;
            races.sort((r1, r2) => {
                if (r1.name < r2.name) {
                    return -1;
                } else if (r1.name === r2.name) {
                    return 0;
                } else {
                    return 1;
                }
            });
            for (const race of races) {
                cards.push(
                    <Race key={race.name} title={race.trackName} subtitle={race.name} thumbnail={race.logoImageUrl}
                          logo={logoImageUrl}/>
                );
            }
        }
        return <Schedule title={"Multiplayer Races"}>{cards}</Schedule>;
    }
}

export default function RaceSchedule({className}) {
    return <>
        <SingleplayerRaceSchedule className={className}/>
        <MultiplayerRaceSchedule/>
    </>;
}