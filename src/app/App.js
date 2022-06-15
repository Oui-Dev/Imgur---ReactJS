import './App.scss'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './home/Home'

export default function App() {
    return (
        <Router>
            <header className="App-header">
                <p>React</p>
            </header>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    )
}
