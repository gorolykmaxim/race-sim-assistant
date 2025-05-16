export default function App() {
    const ipcHandle = () => window.electron.ipcRenderer.send('ping');
    return (
        <>
            <div className="container py-4 px-3 mx-auto">
                <h1>Hello, Bootstrap and Vite!</h1>
                <button className="btn btn-primary" onClick={ipcHandle}>Primary button</button>
            </div>
        </>
    );
}