# Calendar

This application was my final project for CS410: Voice Assistants at Portland State University. It is a voice assistant that schedules and manages calendar events. I created this application through [Dialogflow](https://cloud.google.com/dialogflow), a natural language understanding platform from Google.

# Features

* Add a calendar event
* Locate a calendar event
* Update a calendar event
* Duplicate a calendar event
* Undo/complete a calendar event
* Sort calendar events

# How to use

## Create calendar event

Enter the type of event (reminder, event, etc), the day/time, and the location. If you just enter one of these, the voice assistant will prompt for more info. You will also need to enter a valid command to trigger the add intent: "add", "create", "schedule", "make", etc.

Sample commands: 
  * _create a meeting on June 1st 5:00PM in Los Angeles_
  * _make a calendar event for tomorrow in Seattle_
  * _add a reminder_                  

## Locate calendar event

Enter the type of event, or the day/time, or the location, all three at once, or just look for everything. If you just enter one parameter, it will find every event matching that one parameter entered. Otherwise, it will find the event that matches all three parameters. If you tell the calendar to list everything, it will output every event currently in the calendar.

Sample commands: 
  * _list everything in the calendar_
  * _do I have a meeting on June 1st 5:00PM in Los Angeles_
  * _list all reminders_  

## Update calendar event

Enter the type of event, or the day/time, or the location, or all three at once. If you just enter one paramater, you must enter the value you want to update it with. For example, you can change a "reminder" to a "shopping trip." If you enter all three, you can choose which paramters to update. Because there are three parameters (type of event, time, and location), you can update only, two, or all three of them.

Sample commands: 
  * _update the meeting on June 1st 5:00PM in Los Angeles to a visit on 6:00PM in San Diego_
  * _change the meeting on June 1st 5:00PM in Los Angeles to in Seattle_
  * _update all reminder events to shopping events_  

## Duplicate calendar event

Enter the type of event, or the day/time, or the location, or all three at once. The logic is identical to updating a calendar event, except it will add a new calendar event instead of changing it.

Sample commands: 
  * _duplicate the meeting on June 1st 5:00PM in Los Angeles as a visit on 6:00PM in San Diego_
  * _make another meeting on June 1st 5:00PM in Los Angeles as in Seattle_
  * _duplicate every reminder as a shopping trip_  

## Sort calendar event

Enter the type of event, or the day/time, or the location. THe application will find every event matching the value that was entered and move it to the front of the calendar. Every event that does not match the value will not be touched.

Sample commands: 
  * _sort by reminder events_
  * _put events on tomorrow first_
  * _put all events happening in Portland in the front_  

# Valid Calendar Events

The application will accept the following types of calendar events:
  * event
  * meeting
  * goal
  * reminder
  * task
  * shopping/shopping trip
  * class
  * workout
  * birthday/birthday party
  * appointment
  * visit

# Demo

[Here](https://media.pdx.edu/media/t/1_7rjckcua) is a recording of me demonstrating how to use the application.
