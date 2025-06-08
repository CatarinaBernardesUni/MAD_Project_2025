/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const { google } = require('googleapis');

exports.addClassToCalendar = functions.firestore
  .document('classes/{classId}')
  .onCreate(async (snap, context) => {
    const classData = snap.data();

    if (!classData) return;

    try {
      const auth = await google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: `Class: ${classData.subjectId}`,
        description: classData.additionalNotes || '',
        start: {
          dateTime: `${classData.date}T${classData.startTime}`,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: `${classData.date}T${classData.endTime}`,
          timeZone: 'America/Sao_Paulo',
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'firebase-adminsdk-fbsvc@mad-project-2025.iam.gserviceaccount.com',
        resource: event,
      });

      console.log('Event created:', response.data.htmlLink);
    } catch (error) {
      console.error('Error creating calendar event:', error);
    }
  });

