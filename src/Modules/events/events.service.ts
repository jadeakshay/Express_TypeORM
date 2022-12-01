import { Repository, MoreThan } from 'typeorm';
import { Event } from './entities/event.entity';
import { Workshop } from './entities/workshop.entity'
import App from "../../app";
import { format } from 'date-fns'
import { json } from 'express';

export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:MM:SS'))

export class EventsService {
  private eventRepository: Repository<Event>;
  private workshopRepository: Repository<Workshop>;
  
  constructor(app: App) {
    this.eventRepository = app.getDataSource().getRepository(Event);
    this.workshopRepository = app.getDataSource().getRepository(Workshop);
  }

  async getWarmupEvents() {
    return await this.eventRepository.find();
  }

  /* TODO: complete getEventsWithWorkshops so that it returns all events including the workshops
    Requirements:
    - maximum 2 sql queries
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - Don't post process query result in javascript
    Hints:
    - open the `src/events/events.service` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /events/events:
    ```json
    [
      {
        id: 1,
        name: 'Laravel convention 2021',
        createdAt: '2021-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 1,
            start: '2021-02-21 10:00:00',
            end: '2021-02-21 16:00:00',
            eventId: 1,
            name: 'Illuminate your knowledge of the laravel code base',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 2,
        name: 'Laravel convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 2,
            start: '2023-10-21 10:00:00',
            end: '2023-10-21 18:00:00',
            eventId: 2,
            name: 'The new Eloquent - load more with less',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 3,
            start: '2023-11-21 09:00:00',
            end: '2023-11-21 17:00:00',
            eventId: 2,
            name: 'AutoEx - handles exceptions 100% automatic',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 3,
        name: 'React convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 4,
            start: '2023-08-21 10:00:00',
            end: '2023-08-21 18:00:00',
            eventId: 3,
            name: '#NoClass pure functional programming',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 5,
            start: '2023-08-21 09:00:00',
            end: '2023-08-21 17:00:00',
            eventId: 3,
            name: 'Navigating the function jungle',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
    ]
    ```
     */

  async getEventsWithWorkshops() {
    let jsonEvents: { id: number; name: string; createdAt: string; workshops: Workshop[]; }[] = []
    
    let eventsPromise = this.eventRepository.createQueryBuilder("event")
      .getMany();

    let workshopsPromise = this.workshopRepository.createQueryBuilder("workshop")
      .getMany();

    return Promise.all([eventsPromise, workshopsPromise]).then((values) => {
      let raw_events = values[0]
      let raw_workshops = values[1]
      
      raw_events.forEach(event => {
        let items = raw_workshops.filter(o => o.eventId === event.id);

        let obj = {
          id: event.id,
          name: event.name,
          createdAt: event.createdAt,
          workshops: items
        };

        jsonEvents.push(obj)
      })
      return jsonEvents
    });
  }

  /* TODO: complete getFutureEventWithWorkshops so that it returns events with workshops, that have not yet started
    Requirements:
    - only events that have not yet started should be included
    - the event starting time is determined by the first workshop of the event
    - the code should result in maximum 3 SQL queries, no matter the amount of events
    - all filtering of records should happen in the database
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - Don't post process query result in javascript
    Hints:
    - open the `src/events/events.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    - join, whereIn, min, groupBy, havingRaw might be helpful
    - in the sample data set  the event with id 1 is already in the past and should therefore be excluded
    Sample response on GET /futureevents:
    ```json
    [
        {
            "id": 2,
            "name": "Laravel convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 2,
                    "start": "2023-10-21 10:00:00",
                    "end": "2023-10-21 18:00:00",
                    "eventId": 2,
                    "name": "The new Eloquent - load more with less",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 3,
                    "start": "2023-11-21 09:00:00",
                    "end": "2023-11-21 17:00:00",
                    "eventId": 2,
                    "name": "AutoEx - handles exceptions 100% automatic",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        },
        {
            "id": 3,
            "name": "React convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 4,
                    "start": "2023-08-21 10:00:00",
                    "end": "2023-08-21 18:00:00",
                    "eventId": 3,
                    "name": "#NoClass pure functional programming",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 5,
                    "start": "2023-08-21 09:00:00",
                    "end": "2023-08-21 17:00:00",
                    "eventId": 3,
                    "name": "Navigating the function jungle",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        }
    ]
    ```
     */
  async getFutureEventWithWorkshops() {
    let jsonEvents: { id: number; name: string; createdAt: string; workshops: Workshop[]; }[] = []

    let eventsPromise = this.eventRepository.createQueryBuilder("event")
      .getMany();
    
    const currentUtcTimeAsSqliteString = new Date().toISOString().replace('T', ' ');

    let workshopsPromise = this.workshopRepository.createQueryBuilder("workshop")
      .where('workshop.start > :now',
        {
          now: currentUtcTimeAsSqliteString,
        }
      ).getMany();

      return Promise.all([eventsPromise, workshopsPromise]).then((values) => {
        let raw_events = values[0]
        let raw_workshops = values[1]
        
        raw_events.forEach(event => {
          let items = raw_workshops.filter(o => o.eventId === event.id);
  
          if (items.length > 0) {
            let obj = {
              id: event.id,
              name: event.name,
              createdAt: event.createdAt,
              workshops: items
            };
    
            jsonEvents.push(obj)
          } 
        });

        return jsonEvents
      });
  }
}

