import {useEffect, useState} from "react";
import "./RaceSchedule.scss"

function Race({name, logoImageUrl, trackName}) {
    return <div className={"card text-bg-dark"}>
        <img src={logoImageUrl} className={"card-img race-image opacity-50"} alt={name}/>
        <div className={"card-img-overlay"}>
            <h5 className={"card-title"}>{name}</h5>
            <p className={"card-text"}>{trackName}</p>
        </div>
    </div>;
}

function GameSchedule({logoImageUrl, races}) {
    let cards = [];
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
            <div key={race.name} className={"col"}>
                <Race {...race}/>
            </div>
        );
    }
    return <>
        <div className={"row"}>
            <img src={logoImageUrl} className={"game-schedule-logo my-3"}/>
        </div>
        <div className={"row row-cols-2 row-cols-md-4 row-cols-lg-5 g-4"}>
            {cards}
        </div>
    </>;
}

function LoadingPlaceholder() {
    return <div className={"position-fixed top-50 start-50"}>
        <div className={"spinner-border"} role={"status"}>
            <span className={"visually-hidden"}>Loading...</span>
        </div>
    </div>;
}

export default function RaceSchedule() {
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
        let gameSchedules = [];
        for (const schedule of schedules || []) {
            gameSchedules.push(<GameSchedule key={schedule.logoImageUrl} {...schedule}/>);
        }
        return gameSchedules;
    }
}