// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
let events = [];
let holdTime = "";
let holdType = "";
let holdCity = "";
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  // Add a new calendar event
  function addEvent(agent) {
    let duplicate = false;
    let time = agent.parameters.time;
    const datetime = agent.parameters.time.date_time;
	const type = agent.parameters.eventType;
    const city = agent.parameters.city;
    let speakOutput = "";
    
    if (datetime) {
      time = datetime;
    }
    
    // At some point they entered a valid time, type, or city (not necessarily this current execution)
    if(time != "") {
      holdTime = time;
    }
    if(type != "") {
      holdType = type;
    }
    if(city != "") {
      holdCity = city;
    }
    
    // Still need more data to add a calendar event
    if (holdTime == "") {
      speakOutput += "When does this event take place?";
    }
    else if (holdType == "") {
	  speakOutput += "What type of event is this?";
    }
    else if (holdCity == "") {
      speakOutput += "What city does this event take place in?";
    }
    
    // Since last add, all three parts of the event have been added
    if (holdTime && holdType && holdCity) {
      const input = holdType + " for " + holdTime + " in " + holdCity;
      for (let i = 0; i < events.length; i++) {
        if (events[i].includes(holdTime)) {
          duplicate = true;
        }
      }
      // Not a duplicate event
      if (duplicate == false) {
        events.push(input);
        speakOutput += "Added " + "'" + input + "'" + " to the calendar. Would you like to add anything else?";
      }
      else {
        speakOutput += "Sorry, there is already a event scheduled at that time.";
      }
      holdType = "";
      holdTime = "";
      holdCity = "";
    }
    if (speakOutput == "") {
      speakOutput += "Sorry, I was unable to add the event.";
    }
    agent.add(speakOutput);
  }
  
  // Search for a certain existing calendar event
  function searchEvent(agent) {
   	let time = agent.parameters.time;
    const datetime = agent.parameters.time.date_time;
	const type = agent.parameters.eventType;
    const city = agent.parameters.city;
    let speakOutput = "";

    if (datetime) {
      time = datetime;
    }
    
    // Just date
    if(time && type == "" && city == "") {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(time)) {
          const split = events[i].split(' ');
          speakOutput += split[0] + " in " + split[4] + "\n";
        }
      }
    }
    // Just type 
    else if(time == "" && type && city  == "") {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(type)) {
          const split = events[i].split(' ');
          speakOutput += " on " + split[2] + " in " + split[4] + "\n";
      	}
      }
    }
    // Just city
    else if(time == "" && type == "" && city) {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(city)) {
          const split = events[i].split(' ');
          speakOutput += split[0] + " on " + split[2] + "\n";
      	}
      }
    }
    // Time, type, and city
    else if (time && type && city) {
      const input = type + " for " + time + " in " + city;
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(input)) {
          speakOutput += "Yes, you have a calendar event scheduled at that time.";
        }
      }
    }
    // List everything
    else {
      speakOutput += "Here is everything currently in the calendar: ";
      for (let i = 0; i < events.length; i++) {
        speakOutput += events[i] + "\n";
      }
    }
    if (speakOutput == "") {
      speakOutput += "Sorry, I couldn't find any matching events. Would you like to try again?";
    }
    agent.add(speakOutput);
  }
  
  // Delete an existing calendar event
  function undoEvent(agent) {
   	let time = agent.parameters.time;
    const datetime = agent.parameters.time.date_time;
	const type = agent.parameters.eventType;
    const city = agent.parameters.city;
    let speakOutput = "";
    let count = 0;

    if (datetime) {
      time = datetime;
    }
    
    // Just time
    if(time && type == "" && city == "") {
      for (let i = events.length; i--; ) {
        if(events[i].includes(time)) {
          events.splice(i, 1);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Removed all calendar events on " + time + " Do you want to remove any other calendar events?";
      }
    }
    // Just type 
    else if(time == "" && type && city  == "") {
      for (let i = events.length; i--; ) {
        if(events[i].includes(type)) {
          events.splice(i, 1);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Removed all " + type + " calendar events. Do you want to remove any other calendar events?";
      }
    }
    // Just city
    else if(time == "" && type == "" && city) {
      for (let i = events.length; i--; ) {
        if(events[i].includes(city)) {
          events.splice(i, 1);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Removed all calendar events happening in " + city + " Do you want to remove any other calendar events?";
      }
    }
    // Time, type, and city
    else if (time && type && city) {
      const input = type + " for " + time + " in " + city;
      for (let i = events.length; i--; ) {
        if(events[i].includes(input)) {
          events.splice(i, 1);
          count += 1;
        }
      }
      if(count > 0) {
      	speakOutput += "The event was removed. Do you want me to remove any other calendar events?";
      }
    }
    // Clear the calendar
    else {
      events.length = 0;
      speakOutput += "The calendar has been cleared. Ready to start from scratch?";
    }
    if (speakOutput == "") {
      speakOutput += "Sorry, I couldn't find any matching events. Would you like to try again?";
    }
    agent.add(speakOutput);
  }
  
  // Update an existing event with new values
  function updateEvent(agent) {
    let time1 = agent.parameters.time1;
    let time2 = agent.parameters.time2;
    const datetime1 = agent.parameters.time1.date_time;
    const datetime2 = agent.parameters.time2.date_time;
	const type1 = agent.parameters.eventType1;
    const type2 = agent.parameters.eventType2;
    const city1 = agent.parameters.city1;
    const city2 = agent.parameters.city2;
    let speakOutput = "";
    let count = 0;
    let newEvents = events.slice();

    if (datetime1) {
      time1 = datetime1;
    }
    
    if (datetime2) {
      time2 = datetime2;
    }
    
    // Just time
    if(time1 && type1 == "" && city1 == "") {
      for (let i = 0; i < events.length; i++) {
        if(newEvents[i].includes(time1)) {
          const split = newEvents[i].split(' ');
          const input = split[0] + " for " + time2 + " in " + split[4];
          newEvents.splice(i, 1);
          newEvents.splice(i, 0, input);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Okay, I updated everything on " + time1 + " to be on " + time2 + ". Is there anything else you would like me to do?";
      }
    }
    // Just type 
    else if(time1 == "" && type1 && city1  == "") {
      for (let i = 0; i < events.length; i++) {
        if(newEvents[i].includes(type1)) {
          const split = newEvents[i].split(' ');
          const input = type2 + " for " + split[2] + " in " + split[4];
          newEvents.splice(i, 1);
          newEvents.splice(i, 0, input);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Okay, I updated every " + type1 + " event to be a " + type2 + ". Is there anything else you would like me to do?";
      }
    }
    // Just city
    else if(time1 == "" && type1 == "" && city1) {
      for (let i = 0; i < events.length; i++) {
        if(newEvents[i].includes(city1)) {
          const split = newEvents[i].split(' ');
          const input = split[0] + " for " + split[2] + " in " + city2;
          newEvents.splice(i, 1);
          newEvents.splice(i, 0, input);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Okay, I updated everything happening in " + city1 + " to be in " + city2 + ". Is there anything else you would like me to do?";
      }
    }
    // Time, type, and city
    else if (time1 && type1 && city1) {
      const input = type1 + " for " + time1 + " in " + city1;
      for (let i = 0; i < events.length; i++) {
        if(newEvents[i].includes(input)) {
          const split = newEvents[i].split(' ');
          if (type2) {
            split[0] = type2;
          }
          if (time2) {
            split[2] = time2;
          }
          if (city2) {
            split[4] = city2;
          }
          const newInput = split[0] + " for " + split[2] + " in " + split[4];
          newEvents.splice(i, 1);
          newEvents.splice(i, 0, newInput);
          count += 1;
        }
      }
      if(count > 0) {
        speakOutput += "Okay, I updated the event. Is there anything else you would like me to do?";
      }
    }
    // Found none
   if (speakOutput == "") {
      speakOutput += "Sorry, I couldn't find any matching events. Would you like to try again?";
    }
    events = newEvents.slice();
    agent.add(speakOutput);
  }
  
  // Duplicate an existing calendar event
  function duplicateEvent(agent) {
    let time1 = agent.parameters.time1;
    let time2 = agent.parameters.time2;
    const datetime1 = agent.parameters.time1.date_time;
    const datetime2 = agent.parameters.time2.date_time;
	const type1 = agent.parameters.eventType1;
    const type2 = agent.parameters.eventType2;
    const city1 = agent.parameters.city1;
    const city2 = agent.parameters.city2;
    let speakOutput = "";

    if (datetime1) {
      time1 = datetime1;
    }
    
    if (datetime2) {
      time2 = datetime2;
    }
    
    // Just time
    if(time1 && type1 == "" && city1 == "") {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(time1)) {
          const split = events[i].split(' ');
          const input = split[0] + " for " + time2 + " in " + split[4];
          events.push(input);
          speakOutput += "Added " + "'" + input + "'" + " to the calendar. ";
      	}
      }
    }
    // Just type 
    else if(time1 == "" && type1 && city1  == "") {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(type1)) {
          const split = events[i].split(' ');
          const input = type2 + " for " + split[2] + " in " + split[4];
          events.push(input);
          speakOutput += "Added " + "'" + input + "'" + " to the calendar. ";
      	}
      }
    }
    // Just city
    else if(time1 == "" && type1 == "" && city1) {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(city1)) {
          const split = events[i].split(' ');
          const input = split[0] + " for " + split[2] + " in " + city2;
          events.push(input);
          speakOutput += "Added " + "'" + input + "'" + " to the calendar. ";
      	}
      }
    }
    // Time, type, and city
    else if (time1 && type1 && city1) {
      const input = type1 + " for " + time1 + " in " + city1;
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(input)) {
          const split = events[i].split(' ');
          if (type2) {
            split[0] = type2;
          }
          if (time2) {
            split[2] = time2;
          }
          if (city2) {
            split[4] = city2;
          }
          const newInput = split[0] + " for " + split[2] + " in " + split[4];
          events.push(newInput);
          speakOutput += "Added " + "'" + newInput + "'" + " to the calendar. ";
        }
      }
    }
    // Found none
   if (speakOutput == "") {
      speakOutput += "Sorry, I couldn't find any matching events. Would you like to try again?";
    }
    else {
      speakOutput += " Is there anything else you would like me to do?";
    }
    agent.add(speakOutput);
  }
  
  // Shift events with matching values to the front of the array
  function sortEvent(agent) {
    let time = agent.parameters.time;
    const datetime = agent.parameters.time.date_time;
	const type = agent.parameters.eventType;
    const city = agent.parameters.city;
    let speakOutput = "";
    let count = 0;
    
    if (datetime) {
      time = datetime;
    }
    // Just time
    if(time && type == "" && city == "") {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(time)) {
          events.unshift(events.splice(i, 1)[0]);
          count += 1;
        }
      }
      if(count > 0) {
      	speakOutput += "Okay, I sorted the calendar by " + time + ". Type 'list everything in the calendar' to view it";
      }
    }
    // Just type 
    else if(time == "" && type && city  == "") {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(type)) {
          events.unshift(events.splice(i, 1)[0]);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Okay, I sorted the calendar by " + type + ". Type 'list everything in the calendar' to view it";
      }
    }
    // Just city
    else if(time == "" && type == "" && city) {
      for (let i = 0; i < events.length; i++) {
        if(events[i].includes(city)) {
          events.unshift(events.splice(i, 1)[0]);
          count += 1;
      	}
      }
      if(count > 0) {
      	speakOutput += "Okay, I sorted the calendar by " + city + ". Type 'list everything in the calendar' to view it";
      }
    }
    if (speakOutput == "") {
      speakOutput += "Sorry, I couldn't find any matching events. Would you like to try again?";
    }
    agent.add(speakOutput);
  }
    
  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Add Calendar Event Intent', addEvent);
  intentMap.set('Search Calendar Event Intent', searchEvent);
  intentMap.set('Undo Calendar Event Intent', undoEvent);
  intentMap.set('Update Calendar Event Intent', updateEvent);
  intentMap.set('Duplicate Calendar Event Intent', duplicateEvent);
  intentMap.set('Sort Calendar Event Intent', sortEvent);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});