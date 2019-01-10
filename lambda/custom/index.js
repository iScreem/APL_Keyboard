/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    var sAttributes = await handlerInput.attributesManager.getSessionAttributes();

    //initialize keyboardText in session attributes
    sAttributes["keyboardText"] = "";

    const speechText = 'Welcome to the A P L Keyboard demo. Please enter your email';
    handlerInput.attributesManager.setSessionAttributes(sAttributes);


    //use the keyboard.json APL and pass the title(keyboard prompt) and the input (variable to capture input for)
    if (deviceHasDisplay(handlerInput)) {
      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: require('./keyboard.json'),
        datasources: {
          "Keyboard": {
            "type": "object",
            "properties": {
              "title": "Enter email",
              "input": "email"
            }
          }
        }
      })
      .getResponse();
    }
    else {
      return handlerInput.responseBuilder
      .speak("This example is for APL Devices. Please Try on another device")
      .getResponse();
    }
  },
};

const TouchHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' && handlerInput.requestEnvelope.request.arguments[0] === "keyboard");
  },
  async handle(handlerInput) {
    var sAttributes = await handlerInput.attributesManager.getSessionAttributes();

    //getting current text string being entered
    var keyboardText = sAttributes.keyboardText;

    //last key pressed
    var key = handlerInput.requestEnvelope.request.arguments[2];

    //the variable that the keybooard is capturing input for
    var input = handlerInput.requestEnvelope.request.arguments[1];

    //add the last key pressed to the speech text
    //instead of speaking last character pressed, could substitute an audio "click" sound or something
    var speechText = key;

    switch (key) {
      case "Back":
        //backspace the last character from string
        keyboardText = keyboardText.slice(0,-1);
        break;
      case "SPACE":
        //add a space to current text string
        keyboardText = keyboardText + " ";
        break;
      case "Enter":
        //done entering string for current variable

        //save input(variable) as session attribute
        sAttributes[input] = keyboardText;
        //clear the current keyboard string value;
        keyboardText = "";

        switch (input) {
          case "email":
            //start collecting keyboard input for username
            input = "username";
            //set title on Keyboard APL
            speechText = " Enter user name";
            break;
          case "username":
            //start collecting keyboard input for gamertag
            input = "gamertag";
            speechText = " Enter gamer tag";
            break;
          case "gamertag":
            //gamertag is last variable in this example. Show APL for captured variables

            //pass the output.json APL that renders the variables and pass the data
            return handlerInput.responseBuilder
              .speak("Thank you for your input")
              .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: require('./output.json'),
                datasources: {
                  "Keyboard": {
                    "type": "object",
                    "properties": {
                      "title": keyboardText,
                      "input": input,
                      "email": sAttributes.email,
                      "username": sAttributes.username,
                      "gamertag": sAttributes.gamertag
                    }
                  }
                }
              })
              .getResponse();
              break;
        }
        break;
      default: 
        keyboardText = keyboardText + key;
    }

  //set and save current keyboard text to session attributes
  sAttributes.keyboardText = keyboardText;
  handlerInput.attributesManager.setSessionAttributes(sAttributes);

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      document: require('./keyboard.json'),
      datasources: {
        "Keyboard": {
          "type": "object",
          "properties": {
            "title": keyboardText,
            "input": input
          }
        }
      }
    })
    .getResponse();
  }
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello World!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function deviceHasDisplay(handlerInput) {
  var result = 
  handlerInput &&
  handlerInput.requestEnvelope && 
  handlerInput.requestEnvelope.context &&
  handlerInput.requestEnvelope.context.System &&
  handlerInput.requestEnvelope.context.System.device && 
  handlerInput.requestEnvelope.context.System.device.supportedInterfaces && 
  handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty('Alexa.Presentation.APL');

  return result;
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    TouchHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
