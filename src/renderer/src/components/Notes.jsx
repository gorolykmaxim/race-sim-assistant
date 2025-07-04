import {useState} from "react";

export default function Notes({className}) {
    const [value, setValue_] = useState(localStorage.getItem("notes"));

    function setValue(e) {
        const v = e.target.value;
        setValue_(v);
        localStorage.setItem("notes", v);
    }

    return <div className={className}>
        <label htmlFor={"notesTextArea"} className={"form-label"}>Notes</label>
        <textarea id={"notesTextArea"} autoFocus={true} className={"form-control"} rows={10} value={value}
                  onChange={setValue}/>
    </div>;
}