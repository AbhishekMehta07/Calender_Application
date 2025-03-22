import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Login from './components/Login'
import Register from './components/Register'
import Calendar from './components/Calendar'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App 