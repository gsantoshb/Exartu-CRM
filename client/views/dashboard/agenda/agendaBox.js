var eventsInline = [
    {
        "date": "2015-03-29 17:30:00",
        "type": "meeting",
        "title": "Test Last Year",
        "description": "Lorem Ipsum dolor set",
        "url": ""
    },
    {
        "date": "2015-03-24 17:30:00",
        "type": "meeting",
        "title": "Test Last Year",
        "description": "Lorem Ipsum dolor set",
        "url": ""
    },
    {
        "date": "2015-03-30 19:00:00",
        "type": "meeting",
        "title": "Project 1 meeting",
        "description": "Lorem Ipsum dolor set",
        "url": ""
    },
    {
        "date": "2015-03-30 23:00:00",
        "type": "demo",
        "title": "Project 1 demo",
        "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "url": "http://www.event2.com/"
    },
    {
        "date": "2015-03-31 03:00:00",
        "type": "meeting",
        "title": "Test Project 1 Brainstorming",
        "description": "Lorem Ipsum dolor set",
        "url": "http://www.event3.com/"
    },
    {
        "date": "2015-03-31 22:00:00",
        "type": "test",
        "title": "A very very long name for a f*cking project 1 events",
        "description": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
        "url": "http://www.event4.com/"
    },
    {
        "date": "2015-03-31 22:00:00",
        "type": "meeting",
        "title": "Project 1 meeting",
        "description": "Lorem Ipsum dolor set",
        "url": "http://www.event5.com/"
    },
    {
        "date": "2015-04-02 22:00:00",
        "type": "demo",
        "title": "Project 1 demo",
        "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "url": "http://www.event6.com/"
    },
    {
        "date": "2015-04-05 20:00:00",
        "type": "meeting",
        "title": "Test Project 1 Brainstorming",
        "description": "Lorem Ipsum dolor set",
        "url": "http://www.event7.com/"
    },
    {
        "date": "2015-04-10 22:00:00",
        "type": "test",
        "title": "A very very long name for a f*cking project 1 events",
        "description": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
        "url": "http://www.event8.com/"
    },
    {
        "date": "2015-04-19 05:00:00",
        "type": "demo",
        "title": "Project 1 demo",
        "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "url": "http://www.event9.com/"
    },
    {
        "date": "2015-04-20 22:00:00",
        "type": "meeting",
        "title": "Test Project 1 Brainstorming",
        "description": "Lorem Ipsum dolor set",
        "url": "http://www.event10.com/"
    },
    {
        "date": "2015-04-26 20:00:00",
        "type": "test",
        "title": "A very very long name for a f*cking project 1 events",
        "description": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
        "url": "http://www.event11.com/"
    }
];

Template.agendaBox.rendered = function(){
    $("#eventCalendarHumanDate").eventCalendar({
        jsonData: eventsInline,
        jsonDateFormat: 'human',  // 'YYYY-MM-DD HH:MM:SS'
        startDate: '2015-3-29'
    });
};