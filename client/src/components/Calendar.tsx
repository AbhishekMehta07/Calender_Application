import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers'
import { LogoutOutlined, Add as AddIcon, CalendarMonth } from '@mui/icons-material'
import axios from 'axios'

interface Event {
  _id: string
  title: string
  description: string
  date: string
  userId: string
}

const Calendar: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', description: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    fetchEvents()
  }, [navigate])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEvents(response.data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  const handleAddEvent = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:5000/api/events',
        {
          ...newEvent,
          date: selectedDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setOpenDialog(false)
      setNewEvent({ title: '', description: '' })
      fetchEvents()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add event')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const filteredEvents = events.filter(
    (event) =>
      new Date(event.date).toDateString() === selectedDate.toDateString()
  )

  // Get all events for the current month
  const getMonthlyEvents = () => {
    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const monthlyEvents = getMonthlyEvents()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Calendar
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutOutlined />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1, p: 2 }}>
        <Paper elevation={3} sx={{ p: 2, mr: 2 }}>
          <DateCalendar
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue || new Date())}
          />
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Events for {selectedDate.toDateString()}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Add Event
                </Button>
              </Box>
              {filteredEvents.length === 0 ? (
                <Typography color="text.secondary">No events for this day</Typography>
              ) : (
                filteredEvents.map((event) => (
                  <Paper key={event._id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">{event.title}</Typography>
                    <Typography color="text.secondary">{event.description}</Typography>
                  </Paper>
                ))
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Upcoming Events in {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              <List>
                {monthlyEvents.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No events this month" />
                  </ListItem>
                ) : (
                  monthlyEvents.map((event, index) => (
                    <React.Fragment key={event._id}>
                      <ListItem>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.secondary">
                                {new Date(event.date).toLocaleDateString()}
                              </Typography>
                              <br />
                              {event.description}
                            </>
                          }
                        />
                      </ListItem>
                      {index < monthlyEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEvent} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Calendar 