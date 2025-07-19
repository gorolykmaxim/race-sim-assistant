import ToolBar from "./components/ToolBar";
import RaceSchedule from "./components/race-schedule/RaceSchedule";
import Notes from "./components/Notes";
import {useState} from "react";
import WeeklyProgression from "./components/WeeklyProgression";

export default function App() {
    const [displayProgression, setDisplayProgression] = useState(false);
    const [displayNotes, setDisplayNotes] = useState(false);
    return (
        <>
            <div className="container pb-4">
                <ToolBar
                    onNotesClick={() => setDisplayNotes(!displayNotes)}
                    onWeeklyProgressionClick={() => setDisplayProgression(!displayProgression)}/>
                {displayProgression ? <WeeklyProgression className={"pb-2"}/> : null}
                {displayNotes ? <Notes className={"pb-2"}/> : null}
                <RaceSchedule className={"pt-2"}/>
            </div>
        </>
    );
}