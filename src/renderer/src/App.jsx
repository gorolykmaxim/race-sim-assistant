import ToolBar from "./components/ToolBar";
import RaceSchedule from "./components/race-schedule/RaceSchedule";
import Notes from "./components/Notes";
import {useState} from "react";

export default function App() {
    const [displayNotes, setDisplayNotes] = useState(false);
    return (
        <>
            <div className="container pb-4">
                <ToolBar onNotesClick={() => setDisplayNotes(!displayNotes)}/>
                {displayNotes ? <Notes className={"pb-2"}/> : null}
                <RaceSchedule className={"pt-2"}/>
            </div>
        </>
    );
}