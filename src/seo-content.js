// Text for the Mumbai landing pages and the legal pages, shared by the browser and the server.
// Each page answers its own question first and says something the others don't. Distances and times
// are approximate, and nothing here promises a price or that a car is free: both are settled on WhatsApp.

export const ROUTES = [
  {
    slug: 'mumbai-to-lonavala', place: 'Lonavala', trip: 'weekend',
    suits: 'Any well-kept car',
    distance: 'About 83 km', time: 'About 2 hours', road: 'Mumbai–Pune Expressway',
    title: 'Mumbai to Lonavala car rental: self-drive or with driver',
    h1: 'Mumbai to Lonavala car rental',
    slogan: 'Close enough for a day trip, pretty enough to stay over.',
    description: 'Rent a car from Mumbai to Lonavala: about 83 km and 2 hours on the Expressway. Self-drive or with a driver. Ask on WhatsApp.',
    answer: 'Lonavala is about 83 km from Mumbai, roughly 2 hours by car on the Mumbai–Pune Expressway when traffic is light. Most cars handle the drive well. For a family with bags, an SUV or seven-seater is more comfortable through the ghat section.',
    paras: [
      'This is the easiest hill drive from the city, which is also why it gets busy. Leaving before 7 am on a Saturday can save you a long crawl near the ghat, and coming back before Sunday evening does the same.',
      'The monsoon is when Lonavala is at its greenest, and when you need the most patience. Fog can settle on the ghat, so keep your headlights on and your speed down. Side roads to viewpoints such as Tiger Point and Bhushi Dam are narrower and rougher than the Expressway, so a little extra ground clearance helps.',
    ],
    tips: [
      'The Expressway is a toll road, so ask us about FASTag when you enquire.',
      'Karla and Bhaja caves are close by if you want more than viewpoints.',
      'Download offline maps, since network can drop in the ghat.',
    ],
    faqs: [
      { q: 'How long is the drive from Mumbai to Lonavala?', a: 'Usually about 2 hours for the 83 km, and longer on weekend mornings and in heavy rain. Where in Mumbai you start from also makes a big difference.' },
      { q: 'Can I do Lonavala as a day trip from Mumbai?', a: 'Yes. Many people do. Leave early and start back before evening traffic builds. Tell us your timings and we will confirm what fits.' },
      { q: 'Which car is best for Lonavala in the monsoon?', a: 'The Expressway is fine in any well-kept car. If you plan to visit viewpoints on side roads, or are taking more people and bags, an SUV gives you more ground clearance and room.' },
    ],
  },
  {
    slug: 'mumbai-to-pune', place: 'Pune', trip: 'business',
    suits: 'A sedan, with or without a driver',
    distance: 'About 150 km', time: 'About 3 hours', road: 'Mumbai–Pune Expressway',
    title: 'Mumbai to Pune car rental: self-drive or with driver',
    h1: 'Mumbai to Pune car rental',
    slogan: 'A straight run down the Expressway, for work or family.',
    description: 'Rent a car from Mumbai to Pune: about 150 km and 3 hours on the Expressway. One-way or return, self-drive or with a driver.',
    answer: 'Pune is about 150 km from Mumbai, roughly 3 hours by car on the Mumbai–Pune Expressway. A sedan suits this drive well: it is quiet at highway speed and has a closed boot for your bags. Choose a driver if you want to work on the way.',
    paras: [
      'Most people on this road are going for a day of meetings, visiting family or moving a child to college. If you have meetings at the other end, a car with a driver means you can take calls on the way and skip the parking at each stop.',
      'Starting from South Mumbai, Atal Setu from Sewri is a quick way out of the city towards the Expressway. From the suburbs, the usual way is through Vashi or Airoli, so compare routes in Google Maps just before you leave.',
      'Tell us whether you need a return trip or a one-way drop, and whether you are staying over. We confirm what is possible, and what is included, in writing on WhatsApp.',
    ],
    tips: [
      'The Expressway and Atal Setu are toll roads, so ask us about FASTag when you enquire.',
      'Leave extra time around Khandala ghat at weekends and in heavy rain.',
      'If you are moving house or sending a student, tell us how many bags you have.',
    ],
    faqs: [
      { q: 'How long does Mumbai to Pune take by car?', a: 'About 3 hours in normal traffic. It takes longer if you start in the northern suburbs, at weekends, or when work on the road slows the ghat section.' },
      { q: 'Can I rent a car one-way from Mumbai to Pune?', a: 'Tell us your dates and where you want to end the trip. We will confirm on WhatsApp whether a one-way drop is possible for those dates.' },
      { q: 'Should I self-drive or take a driver to Pune?', a: 'Self-drive suits a relaxed family trip. A driver suits a day of meetings, since you can work on the way and do not need to find parking.' },
    ],
  },
  {
    slug: 'mumbai-to-nashik', place: 'Nashik', trip: 'family',
    suits: 'A seven-seater or SUV for family trips',
    distance: 'About 170 km', time: 'About 3.5 to 4 hours', road: 'NH160, through Kasara Ghat',
    title: 'Mumbai to Nashik car rental: self-drive or with driver',
    h1: 'Mumbai to Nashik car rental',
    slogan: 'Temples, vineyards and a ghat worth taking slowly.',
    description: 'Rent a car from Mumbai to Nashik: about 170 km and 3.5 to 4 hours through Kasara Ghat. Good for Trimbakeshwar and family trips.',
    answer: 'Nashik is about 170 km from Mumbai, roughly 3.5 to 4 hours by car on NH160 through Thane, Bhiwandi and Kasara Ghat. For family and temple trips with elders, a seven-seater or SUV gives more room and an easier ride. Couples and small groups are fine in a sedan.',
    paras: [
      'Leaving Mumbai is the slow part. Traffic around Thane and Bhiwandi can take longer than the highway after it, so an early start makes the whole day easier. Many drivers now also use the Samruddhi Expressway for part of the way, so compare both in Google Maps before you leave.',
      'People usually come for one of three things: the temples at Panchavati and Trimbakeshwar, the vineyards just outside the city, or a longer trip that includes Shirdi. If you are combining stops, tell us the full plan so that we can suggest a car that stays comfortable for the whole trip.',
    ],
    tips: [
      'Trimbakeshwar can be very crowded on festival days, so plan parking and walking time.',
      'Going with elders? Mention it, and we will suggest an easier car to get in and out of.',
      'Kasara Ghat has its own uphill and downhill lanes, but heavy trucks still slow it down.',
    ],
    faqs: [
      { q: 'How far is Nashik from Mumbai by road?', a: 'About 170 km, depending on where you start. It usually takes 3.5 to 4 hours, including the slower stretch through Thane and Bhiwandi.' },
      { q: 'Can I visit Trimbakeshwar and Shirdi on the same trip?', a: 'Yes, many people do, but it is a long day to do both alongside the drive from Mumbai. Share your plan and how many days you have, and we will suggest a car and whether a driver would help.' },
      { q: 'Which car suits a family trip to Nashik?', a: 'A seven-seater or SUV is the comfortable choice with elders, children and bags. Tell us how many are travelling and we will suggest what fits.' },
    ],
  },
  {
    slug: 'mumbai-to-shirdi', place: 'Shirdi', trip: 'family',
    suits: 'A seven-seater or SUV',
    distance: 'About 240 to 265 km', time: 'About 5 to 6 hours', road: 'NH160 through Kasara Ghat',
    title: 'Mumbai to Shirdi car rental: self-drive or with driver',
    h1: 'Mumbai to Shirdi car rental',
    slogan: 'A long day on the road, so choose a car the elders will like.',
    description: 'Rent a car from Mumbai to Shirdi: about 240 to 265 km and 5 to 6 hours. Good for family temple trips. Self-drive or with a driver.',
    answer: 'Shirdi is about 240 to 265 km from Mumbai, roughly 5 to 6 hours by car on NH160 through Kasara Ghat, then through Ghoti or Nashik. Many families go for the Sai Baba temple and stay one night. A seven-seater or SUV keeps elders comfortable on the long drive.',
    paras: [
      'Your route depends on whether you want to stop in Nashik. The Ghoti road is shorter. Going through Nashik adds some distance but makes it easy to include Trimbakeshwar or Panchavati. Many drivers also use the Samruddhi Expressway for part of the way, so compare routes in Google Maps just before you leave.',
      'Most people plan around darshan rather than the drive. Thursdays, weekends and festivals are usually the busiest days at the temple, so check timings with the Shirdi Sai Baba Sansthan and leave yourself extra time. If you would rather rest on the way home, a driver is worth considering.',
    ],
    tips: [
      'Arrange darshan and your stay ahead of time for Thursdays, weekends and festival days.',
      'Leaving early gets you past the morning traffic around Thane and Bhiwandi.',
      'Carry water and snacks, since elders and children may not want to wait for a highway stop.',
    ],
    faqs: [
      { q: 'How long does Mumbai to Shirdi take by car?', a: 'Usually 5 to 6 hours for the 240 to 265 km, depending on your route, traffic and where in Mumbai you start.' },
      { q: 'Can I go from Mumbai to Shirdi and back in one day?', a: 'It is possible but tiring, with 10 hours or more on the road plus time at the temple. Most families stay one night. A driver makes a same-day return much easier.' },
      { q: 'Which car is best for a family trip to Shirdi?', a: 'A seven-seater or SUV gives elders more room and an easier ride. Tell us how many are coming and how many bags you have, and we will suggest what fits.' },
    ],
  },
  {
    slug: 'mumbai-to-alibaug', place: 'Alibaug', trip: 'weekend',
    suits: 'A hatchback or compact SUV',
    distance: 'About 95 to 105 km', time: 'About 2.5 to 3.5 hours', road: 'Atal Setu, Chirle and Pen',
    title: 'Mumbai to Alibaug car rental: self-drive or with driver',
    h1: 'Mumbai to Alibaug car rental',
    slogan: 'A beach weekend, by road or with your car on the ferry.',
    description: 'Rent a car from Mumbai to Alibaug: about 100 km by road through Atal Setu and Pen, or take the Ro-Ro ferry. Ask us on WhatsApp.',
    answer: 'Alibaug is about 95 to 105 km from Mumbai by road, roughly 2.5 to 3.5 hours through Atal Setu, Chirle and Pen. You can also cross by Ro-Ro car ferry from Bhaucha Dhakka to Mandwa, about an hour on the water. A hatchback or compact SUV is easiest in Alibaug’s narrow lanes.',
    paras: [
      'Road or ferry depends on where you are starting. From South Mumbai, the Ro-Ro can be the more relaxed choice, as long as a sailing fits your plans. From the suburbs, the road usually makes more sense because you avoid the drive down to the ferry wharf.',
      'Rental cars and ferries need a quick check first. If you want to take the Ro-Ro, tell us when you enquire, and check sailing times with the ferry operator before you leave, since schedules change with the season and the sea.',
      'Once you arrive, a smaller car is easier to live with. Many lanes near the beaches and holiday homes are narrow, and parking near the water is limited on busy weekends.',
    ],
    tips: [
      'Book the Ro-Ro ahead at weekends and on public holidays.',
      'Atal Setu is a toll road, so ask us about FASTag when you enquire.',
      'Please stay off the beach sand: cars get stuck easily, and salt water is hard on them.',
    ],
    faqs: [
      { q: 'Should I drive to Alibaug or take the Ro-Ro ferry?', a: 'From South Mumbai the Ro-Ro is often the more relaxed choice, if a sailing suits you. From the suburbs, driving through Atal Setu and Pen is usually simpler. Allow time for boarding if you take the ferry.' },
      { q: 'Can I take a rental car on the Alibaug ferry?', a: 'Tell us before you book the crossing and we will confirm it for your car. Check sailing times with the ferry operator too, since they change with the season.' },
      { q: 'How long does the drive from Mumbai to Alibaug take?', a: 'About 2.5 to 3.5 hours by road, depending on traffic and where you start.' },
    ],
  },
  {
    slug: 'mumbai-to-mahabaleshwar', place: 'Mahabaleshwar', trip: 'family',
    suits: 'An SUV or seven-seater',
    distance: 'About 260 km', time: 'About 5 to 7 hours', road: 'Expressway, then NH48 through Wai',
    title: 'Mumbai to Mahabaleshwar car rental: self-drive or driver',
    h1: 'Mumbai to Mahabaleshwar car rental',
    slogan: 'A longer drive, so pick the car you’ll want on hour five.',
    description: 'Rent a car from Mumbai to Mahabaleshwar: about 260 km and 5 to 7 hours. Best as an overnight trip, self-drive or with a driver.',
    answer: 'Mahabaleshwar is about 260 km from Mumbai, roughly 5 to 7 hours by car on the Mumbai–Pune Expressway and NH48 through Wai and Panchgani. Plan at least one night there. An SUV or seven-seater is the comfortable choice, and a driver is worth considering for the climb and the return.',
    paras: [
      'This is the longest of the popular drives from Mumbai, and the last hour is a winding climb through Pasarni Ghat. That is where a car with space and good air conditioning earns its keep, particularly with children or elders on board.',
      'It is not a good day trip. With up to 7 hours on the road each way, most people stay at least one night, and many pair it with Panchgani. If you are self-driving, plan to reach the ghat in daylight.',
      'The season matters more here than on the other routes. Winter and early summer are the usual time to visit. Mahabaleshwar gets very heavy rain from June to September, when many viewpoints and some stays slow down or close, so check before you plan a monsoon trip.',
    ],
    tips: [
      'Start early so that you reach Pasarni Ghat in daylight.',
      'Fuel up before you start climbing, and carry water and snacks.',
      'Thinking about a driver? Ask us what their overnight stay involves.',
    ],
    faqs: [
      { q: 'How far is Mahabaleshwar from Mumbai by car?', a: 'About 260 km on the Expressway route. It usually takes 5 to 7 hours, with the last section a slow climb through Pasarni Ghat.' },
      { q: 'Can I do Mahabaleshwar as a day trip from Mumbai?', a: 'We would not suggest it. With up to 7 hours each way, most people stay at least one night.' },
      { q: 'Should I take a driver to Mahabaleshwar?', a: 'If you are not used to long ghat drives, or you would rather rest on the way back, a driver is worth considering. Share your dates and we will confirm the options on WhatsApp.' },
    ],
  },
  {
    slug: 'mumbai-to-goa', place: 'Goa', trip: 'weekend',
    suits: 'An SUV or sedan, ideally with two drivers',
    distance: 'About 580 to 610 km', time: 'About 10 to 13 hours', road: 'NH48 through Kolhapur, or NH66 along the Konkan',
    title: 'Mumbai to Goa car rental: self-drive or with driver',
    h1: 'Mumbai to Goa car rental',
    slogan: 'The classic road trip, and better split over two days.',
    description: 'Rent a car from Mumbai to Goa: about 600 km and 10 to 13 hours by NH48 or the Konkan coast. Self-drive or with a driver. Ask on WhatsApp.',
    answer: 'Goa is about 580 to 610 km from Mumbai, roughly 10 to 13 hours by car. NH48 through Pune and Kolhapur is usually faster, while NH66 along the Konkan coast is more scenic but can be slower. Many people split the drive with a night on the way. An SUV or sedan suits it best.',
    paras: [
      'Choose your road before you leave. NH48 is mostly wide highway, so it is the usual choice if you want to arrive the same day. NH66 passes Chiplun and Sawantwadi, with coastal views and more small towns. Roadworks have slowed parts of it, so check recent reports before you commit to it.',
      'A single day of driving is long for anyone, and longer with children. Stopping overnight around Kolhapur on NH48, or Chiplun or Ratnagiri on NH66, makes the trip far more pleasant. Want to fly home and end the rental in Goa? Tell us first, because a one-way drop needs to be confirmed for your dates.',
      'During the monsoon, the ghats and the Konkan stretch can see heavy rain and the occasional landslide. Give yourself plenty of daylight and check the forecast before you set off.',
    ],
    tips: [
      'Two drivers make this trip safer. Travelling alone? Ask about a car with a driver.',
      'Both routes have tolls, so ask us about FASTag when you enquire.',
      'Many Goan village lanes are narrow, so a very large car can be awkward to park.',
    ],
    faqs: [
      { q: 'How long does it take to drive from Mumbai to Goa?', a: 'About 10 to 13 hours for 580 to 610 km, without long stops. Traffic leaving Mumbai and your choice of road make the biggest difference.' },
      { q: 'Which is the better road to Goa, NH48 or NH66?', a: 'NH48 through Pune and Kolhapur is usually quicker. NH66 along the Konkan is more scenic but can be slower, so it suits people who are in no hurry.' },
      { q: 'Can I leave the rental car in Goa and fly back?', a: 'Tell us your dates and we will confirm on WhatsApp whether a one-way drop in Goa is possible for that trip.' },
    ],
  },
];

export const AREAS = [
  {
    slug: 'mumbai-airport', name: 'Mumbai Airport', trip: 'airport',
    title: 'Mumbai Airport car rental: pickups and drops',
    h1: 'Car rental at Mumbai Airport',
    slogan: 'Tell us your flight. We’ll plan the car around your bags.',
    description: 'Car rental for Mumbai Airport pickups and drops, with room for your luggage. Share your flight and terminal on WhatsApp.',
    answer: 'Drive Ease arranges cars for pickups and drops at Mumbai’s Chhatrapati Shivaji Maharaj International Airport. Share your flight, terminal, address and number of bags on WhatsApp, and we confirm the car and the meeting point. Using Navi Mumbai International Airport? Tell us and we will confirm what we can do.',
    paras: [
      'Check your ticket on the day. Mumbai now has two airports, and Terminal 1 is being rebuilt in phases, so some flights have moved. Your ticket and your airline’s app will show the correct airport and terminal, and we can plan properly once you share them.',
      'Bags are what usually go wrong on an airport run. Four people with four big suitcases rarely fit in a small car, even when the seats add up. Tell us about the bags as well as the headcount.',
    ],
    goodFor: ['Family arrivals with big suitcases', 'Early morning and late night flights', 'Visitors who then need a car for a few days'],
    faqs: [
      { q: 'Can you pick me up from a late-night flight at Mumbai Airport?', a: 'Tell us your flight time when you message. We confirm what is possible for that time in the chat before you commit.' },
      { q: 'Which terminal should I tell you?', a: 'Whichever your ticket shows on the day of travel. Terminals have been changing at Mumbai Airport, so please check your airline’s app and share it with your flight number.' },
    ],
  },
  {
    slug: 'andheri', name: 'Andheri', trip: 'business',
    title: 'Car rental in Andheri, Mumbai: self-drive or with driver',
    h1: 'Car rental in Andheri',
    slogan: 'Close to the airport, and most of the western suburbs.',
    description: 'Car rental in Andheri, Mumbai, for office days, airport runs and weekend drives. Self-drive or with a driver. Ask on WhatsApp.',
    answer: 'Looking for a car on rent in Andheri? Tell us your pickup point in Andheri East or West, your dates and how many are travelling. We reply on WhatsApp with the cars that fit, and confirm whether and where we can meet you.',
    paras: [
      'Andheri East and Andheri West call for different trips. In the East you are close to the airport, MIDC and SEEPZ, so people tend to want a car for meetings and flights. The West is Lokhandwala and Versova, where it is more often an evening out, or a weekend drive.',
      'The Western Express Highway and the Jogeshwari–Vikhroli Link Road take you north, south or across to Powai, but all of them slow down at rush hour. If you are visiting Andheri for work, a driver saves you the parking search at each stop.',
    ],
    goodFor: ['Meetings around MIDC and SEEPZ', 'Quick airport drops', 'Weekend drives from the western suburbs'],
    faqs: [
      { q: 'Can I get a car with a driver for office meetings in Andheri?', a: 'Yes, tell us your stops and timings on WhatsApp and we will suggest a car and driver, then confirm what is included.' },
      { q: 'Do you pick up from both Andheri East and West?', a: 'Tell us your exact pickup point. We confirm on WhatsApp what we can do for it.' },
    ],
  },
  {
    slug: 'bandra', name: 'Bandra', trip: 'city',
    title: 'Car rental in Bandra, Mumbai: self-drive or with driver',
    h1: 'Car rental in Bandra',
    slogan: 'Narrow lanes, the Sea Link, and very little parking.',
    description: 'Car rental in Bandra, Mumbai, for BKC meetings, evenings out and trips across the Sea Link. Self-drive or with a driver.',
    answer: 'Looking for a car on rent in Bandra? Share your pickup point, dates and how many are travelling on WhatsApp. For Bandra’s narrow lanes a hatchback is easiest. For meetings at BKC, a sedan with a driver saves you hunting for parking.',
    paras: [
      'Bandra has two sides for car hire. Around BKC it is office days, client visits and arrivals from the airport, where a smart sedan and a driver make sense. Around Hill Road, Pali Hill and Carter Road, the lanes are tight and parking is hard to find, so a smaller car is less stressful.',
      'The Bandra–Worli Sea Link is the quick way to South Mumbai, and the Western Express Highway heads north to the airport. If you are coming in by train at Bandra Terminus with luggage, share your arrival time and we will plan around it.',
    ],
    goodFor: ['Client visits at BKC', 'Arrivals at Bandra Terminus', 'A small car for the lanes around Hill Road'],
    faqs: [
      { q: 'Which car is easiest to drive and park in Bandra?', a: 'A hatchback. It handles narrow lanes well and fits tighter parking spots. If you have a driver, a larger car is fine, since they can drop you at the door.' },
      { q: 'Can you meet me at Bandra Terminus?', a: 'Share your train and arrival time on WhatsApp and we will confirm whether we can meet you there.' },
    ],
  },
  {
    slug: 'dadar', name: 'Dadar', trip: 'family',
    title: 'Car rental in Dadar, Mumbai: self-drive or with driver',
    h1: 'Car rental in Dadar',
    slogan: 'The middle of the city, a good place to start a family trip.',
    description: 'Car rental in Dadar, Mumbai, for family trips, station arrivals and out-of-town drives. Self-drive or with a driver. Ask on WhatsApp.',
    answer: 'Looking for a car on rent in Dadar? Tell us your pickup point near the station or Shivaji Park, your dates and how many are travelling. We reply on WhatsApp with suitable cars and confirm the pickup. Dadar’s central spot makes it easy to head out in any direction.',
    paras: [
      'Dadar sits where the Western and Central railway lines meet, so plenty of trips start with someone arriving here by train. If your family is coming in with luggage, share the train and time, and we will agree a clear meeting point.',
      'From Dadar, the Sea Link takes you to Bandra and the western suburbs, the Coastal Road takes you south to Marine Drive, and the Eastern Express Highway takes you towards Thane and the road to Nashik. The lanes around the station, the flower market and Shivaji Park can be crowded, so pick a pickup point a little away from the rush if you can.',
    ],
    goodFor: ['Relatives arriving by train', 'Family trips to Nashik and temples', 'Weddings and functions around Shivaji Park'],
    faqs: [
      { q: 'Can I be picked up right outside Dadar station?', a: 'The area outside the station gets crowded, so a nearby spot often works better. Share your train and we will confirm a meeting point on WhatsApp.' },
      { q: 'Can you arrange several cars for a function in Dadar?', a: 'Tell us the date, venues and number of guests who need a ride. We will work out how many cars you need and confirm on WhatsApp.' },
    ],
  },
  {
    slug: 'powai', name: 'Powai', trip: 'business',
    title: 'Car rental in Powai, Mumbai: self-drive or with driver',
    h1: 'Car rental in Powai',
    slogan: 'For offices, long stays and quick escapes out of the city.',
    description: 'Car rental in Powai, Mumbai, for visiting teams, monthly rentals and weekend drives towards Lonavala. Self-drive or with a driver.',
    answer: 'Looking for a car on rent in Powai? Share your pickup point around Hiranandani, Chandivali or IIT Bombay, your dates and how long you need the car. We reply on WhatsApp with the cars that fit. Visiting teams and new residents can also ask about longer rentals.',
    paras: [
      'Powai has a lot of people who are new to the city: teams on a project, families who have just moved and students with visiting parents. A monthly rental can make more sense than juggling cabs while you settle in, so ask about it if you are here for a few weeks.',
      'The Jogeshwari–Vikhroli Link Road connects Powai to both the Western and Eastern Express Highways. That makes it a handy start for weekend drives, as you can reach the road to Lonavala and Pune without crossing the whole city. Allow extra time at rush hour.',
    ],
    goodFor: ['Visiting teams and project stays', 'Monthly rentals while you settle in', 'Weekend drives towards Lonavala'],
    faqs: [
      { q: 'Can I rent a car monthly in Powai?', a: 'Tell us how long you need it, roughly how much you will drive and whether you want a driver. We will explain what is included for longer rentals on WhatsApp.' },
      { q: 'Can my company arrange cars for visiting staff in Powai?', a: 'Yes, share the dates, how many people and the places they need to reach. We will suggest suitable cars and confirm everything in one chat.' },
    ],
  },
  {
    slug: 'borivali', name: 'Borivali', trip: 'family',
    title: 'Car rental in Borivali, Mumbai: self-drive or with driver',
    h1: 'Car rental in Borivali',
    slogan: 'Start north, and skip the city on your way out.',
    description: 'Car rental in Borivali, Mumbai, for family outings and trips north along the highway. Self-drive or with a driver. Ask on WhatsApp.',
    answer: 'Looking for a car on rent in Borivali? Tell us your pickup point in Borivali East or West, your dates and how many are travelling. We reply on WhatsApp with the cars that fit. Starting this far north, you can head up the highway without crossing the rest of Mumbai.',
    paras: [
      'Borivali’s big advantage is its position. The Western Express Highway carries on north towards Vasai, Virar and Gujarat, so drives in that direction can start without any city traffic. If you are heading for Lonavala, Pune or Alibaug instead, allow extra time, as you will be crossing most of Mumbai first.',
      'Trips here are often family outings: a day at Sanjay Gandhi National Park, a visit to relatives or a drive up the coast. If you are going north with children and bags, tell us how many are coming and we will suggest a car with enough room.',
    ],
    goodFor: ['Family outings', 'Drives north towards Vasai and Virar', 'Visits to Sanjay Gandhi National Park'],
    faqs: [
      { q: 'Is Borivali a good place to start a trip to Lonavala or Pune?', a: 'It works, but you have to cross a large part of Mumbai first, so allow extra time and leave early, ideally before the morning rush.' },
      { q: 'Can you pick up from both Borivali East and West?', a: 'Tell us your exact pickup point and we will confirm on WhatsApp.' },
    ],
  },
  {
    slug: 'south-mumbai', name: 'South Mumbai', trip: 'business',
    title: 'Car rental in South Mumbai: self-drive or with driver',
    h1: 'Car rental in South Mumbai',
    slogan: 'From Colaba to Worli, without the parking hunt.',
    description: 'Car rental in South Mumbai: Colaba, Fort, Nariman Point and Worli. For meetings, visitors and trips out by Atal Setu. Ask on WhatsApp.',
    answer: 'Looking for a car on rent in South Mumbai? Share your pickup point in Colaba, Fort, Nariman Point or Worli, with your dates and plans, on WhatsApp. For a day of meetings or sightseeing, a car with a driver is usually easiest, because parking near offices and attractions is scarce.',
    paras: [
      'Parking is the deciding factor here. Around Fort, Nariman Point and Colaba it can take longer than the drive itself, which is why a driver who can drop you at the door and wait nearby is a popular choice for meetings and for visitors seeing the city.',
      'For getting out of town, South Mumbai has two good shortcuts. The Coastal Road and Sea Link take you north along the shore, and Atal Setu from Sewri takes you across the harbour towards Pune, Lonavala and Alibaug. You can also take your car to Alibaug on the Ro-Ro ferry from Bhaucha Dhakka.',
    ],
    goodFor: ['A day of meetings around Fort and Nariman Point', 'Visitors seeing the Gateway of India and Marine Drive', 'Quick exits by Atal Setu towards Pune and Alibaug'],
    faqs: [
      { q: 'Is it better to self-drive or take a driver in South Mumbai?', a: 'For most people, a driver, because parking near offices and landmarks is hard to find. If you are heading out of the city, self-drive works well once you reach Atal Setu or the Coastal Road.' },
      { q: 'Can I hire a car for a day of sightseeing in South Mumbai?', a: 'Yes. Share your stops and timing on WhatsApp, and we will suggest a car and driver and confirm what is included.' },
    ],
  },
];

export const CAR_TYPES = [
  {
    slug: 'hatchback', name: 'Hatchbacks', trip: 'city',
    title: 'Hatchback on rent in Mumbai: small, easy city cars',
    h1: 'Hatchbacks on rent in Mumbai',
    slogan: 'The easiest cars for Mumbai’s traffic and tight parking.',
    description: 'Rent a hatchback in Mumbai for city driving, tight parking and short trips. See the cars, seats and boot space. Enquire on WhatsApp.',
    answer: 'A hatchback is the easiest rental car to drive in Mumbai: small enough for narrow lanes and tight parking, and comfortable for up to four adults on shorter trips. Choose something larger if you have more than two big suitcases, or will spend long hours on the highway.',
    paras: [
      'Most of what makes driving in Mumbai hard is space, not distance. A hatchback squeezes through traffic, turns in tight lanes and fits parking spots that bigger cars have to pass. If you are new to the city, it is the least stressful place to begin.',
      'It works well for errands, a visit across the city, and two people heading out for a weekend. It is less suited to four adults with full-size suitcases, because the boot fills up quickly.',
    ],
    faqs: [
      { q: 'How many people fit in a rental hatchback?', a: 'Four adults fit comfortably on shorter trips, and five at a squeeze. Each car’s page lists its seats and bags.' },
      { q: 'Is a hatchback fine for a trip to Lonavala?', a: 'Yes, for two to four people without much luggage. With more bags or a full car, a sedan or SUV will feel better on the ghat.' },
    ],
  },
  {
    slug: 'sedan', name: 'Sedans', trip: 'business',
    title: 'Sedan on rent in Mumbai: comfort and a closed boot',
    h1: 'Sedans on rent in Mumbai',
    slogan: 'Quiet, comfortable, with a boot that keeps bags out of sight.',
    description: 'Rent a sedan in Mumbai for airport runs, meetings and highway trips. See the cars, seats and boot space. Enquire on WhatsApp.',
    answer: 'A sedan is a good rental choice in Mumbai for airport runs, business travel and highway trips to Pune or Nashik. It is quieter and more settled than a hatchback at speed, and its closed boot keeps luggage out of sight. It seats four adults in comfort.',
    paras: [
      'A sedan is what you pick when how you arrive matters. It looks right outside an office or a hotel, and it gives rear passengers more legroom than a hatchback, which is useful if you are being driven.',
      'Its boot is the other reason to choose one. Suitcases sit out of sight rather than behind the rear seats, which is handy when you stop on the way. It is longer than a hatchback, though, so parking takes more care in crowded parts of the city.',
    ],
    faqs: [
      { q: 'Is a sedan or an SUV better for Mumbai to Pune?', a: 'A sedan is usually the better choice for up to four people on the Expressway, as it is quiet and steady at highway speed. Choose an SUV if you have a lot of luggage or plan to use rough side roads.' },
      { q: 'How many bags fit in a rental sedan?', a: 'Usually two to three suitcases, depending on the car. Each car’s page lists its bag space, and you can tell us your bags on WhatsApp.' },
    ],
  },
  {
    slug: 'suv', name: 'SUVs', trip: 'weekend',
    title: 'SUV on rent in Mumbai: for ghats, bags and getaways',
    h1: 'SUVs on rent in Mumbai',
    slogan: 'More room, more ground clearance, built for the weekend.',
    description: 'Rent an SUV in Mumbai for weekend getaways, ghat roads and monsoon drives. See the cars, seats and boot space. Enquire on WhatsApp.',
    answer: 'An SUV is the rental car to pick in Mumbai for ghat roads, monsoon drives and weekend trips with bags. It sits higher over waterlogged patches and rough side roads, and has more boot space than a hatchback. In return, it is harder to park in the crowded parts of the city.',
    paras: [
      'The sitting height is what most people notice first. You see further ahead in traffic and on ghat bends, and the extra ground clearance helps on the broken patches that appear on side roads in the monsoon.',
      'SUVs come in different sizes, and it is worth being honest about what you need. A compact SUV is easy to live with for two or three people, while a larger one suits a full group and bags. If you are torn, the Concierge can compare them for your trip.',
    ],
    faqs: [
      { q: 'Do I need an SUV for Lonavala or Mahabaleshwar?', a: 'Not for the main roads, which a well-kept car handles fine. An SUV is more comfortable with more people and bags, and it helps on rough side roads in the monsoon.' },
      { q: 'Is an SUV hard to drive in Mumbai?', a: 'It is not hard to drive, but parking takes more care, especially in older parts of the city. A compact SUV is a good middle ground.' },
    ],
  },
  {
    slug: '7-seater', name: '7-seaters', trip: 'family',
    title: '7-seater car on rent in Mumbai for families and groups',
    h1: '7-seater cars on rent in Mumbai',
    slogan: 'Keep the whole family in one car.',
    description: 'Rent a 7-seater in Mumbai for family trips, airport pickups and groups. See the cars, seats and luggage space. Enquire on WhatsApp.',
    answer: 'A 7-seater is the rental car to choose in Mumbai when more than five people are travelling together, or when four or five travel with big suitcases. Remember that when all seven seats are full, there is little room left for bags, so tell us about your luggage as well as your headcount.',
    paras: [
      'Keeping everyone in one car makes a family trip far simpler. You don’t have two cars to coordinate, no one gets left behind at a toll plaza, and grandparents and children can travel together.',
      'The third row is the thing to think through. It is good for children and shorter trips, but less comfortable for adults over many hours, and it uses the space where the bags would otherwise go. If you have seven adults and full-size luggage, ask us about the options before you decide.',
    ],
    faqs: [
      { q: 'Do seven people and their bags fit in a 7-seater?', a: 'Usually not with big suitcases. With all seats in use, the boot is small. Tell us your headcount and bags, and we will suggest what will actually fit.' },
      { q: 'Which is better for a family trip, a 7-seater or two cars?', a: 'One 7-seater is simpler and keeps everyone together. Two smaller cars can suit a large group with a lot of luggage. We can help you decide on WhatsApp.' },
    ],
  },
  {
    slug: 'automatic', name: 'Automatic cars', trip: 'city',
    title: 'Automatic car on rent in Mumbai: no clutch in traffic',
    h1: 'Automatic cars on rent in Mumbai',
    slogan: 'Stop-start traffic, with no clutch to worry about.',
    description: 'Rent an automatic car in Mumbai and skip the clutch in stop-start traffic. See the cars, seats and boot space. Enquire on WhatsApp.',
    answer: 'An automatic is the most relaxing rental car to self-drive in Mumbai, because stop-start traffic means no constant clutch work. It is especially useful if you are visiting from a place where you normally drive automatics, or if you will spend hours in the city.',
    paras: [
      'Anyone who has spent an hour on the Western Express Highway at rush hour knows how tiring a clutch can get. An automatic removes that, and also makes hill starts on sloping lanes and ghat roads simpler.',
      'If you only drive automatics, say so in your first message, along with your dates, and we will suggest from the ones that suit your trip.',
    ],
    faqs: [
      { q: 'Are automatic rental cars available in Mumbai?', a: 'Yes, the automatic cars in our fleet are listed on this page. Tell us your dates on WhatsApp and we will confirm which are free.' },
      { q: 'Is an automatic good for ghat roads?', a: 'Yes. Modern automatics handle ghats well, and hill starts are simpler. On long descents, use a lower gear or sport mode if the car has one, rather than riding the brakes.' },
    ],
  },
];

export const FIT_FAQS = [
  { q: 'Do four people and four suitcases fit in a sedan?', a: 'Usually not. A sedan seats four adults in comfort but tends to hold two or three big suitcases. For four full-size bags, look at an SUV or a seven-seater.' },
  { q: 'Do seven people and their luggage fit in a 7-seater?', a: 'Rarely with big suitcases. With all seven seats in use, the boot is small. Five or six people with big bags is a more comfortable load, or you can ask about two cars.' },
  { q: 'What counts as a big bag?', a: 'Count suitcases and large holdalls. Small backpacks and handbags usually fit in the cabin, around your feet or on your lap.' },
];

// Written from what the site actually does. The client should have these reviewed before relying on them.
const ask = (site) => [site.phone, site.email].filter(Boolean).join(' or ');
export const LEGAL = {
  '/privacy': {
    title: 'Privacy policy',
    description: (site) => `What ${site.businessName} collects when you send an enquiry or use this website, why we keep it, and how to ask us to change or delete it.`,
    updated: '5 November 2026',
    sections: (site) => [
      { h: 'The short version', p: [`${site.businessName} uses this website to answer car rental enquiries. We only ask for what we need to reply to you. We don’t sell your details, and the website doesn’t take payments.`] },
      { h: 'What we collect', p: [
        'If you send an enquiry form, we save what you enter: your name, phone number, email if you give it, travel dates, pickup and destination, the number of people and bags, the car you asked about and your message.',
        'If you tap a WhatsApp button, you carry on in WhatsApp, and we receive whatever you send us there. WhatsApp’s own terms and privacy policy apply to that chat.',
      ] },
      { h: 'Why we use it', p: ['We use your details to reply to you, suggest a car and arrange your trip. Our team may keep notes on your enquiry so that whoever replies knows what has been discussed.'] },
      { h: 'Anonymous counters', p: ['We count how often buttons such as WhatsApp and Share are used, for each day, car and part of the site. These counts contain no name, phone number, IP address or message text, and they can’t identify you.'] },
      { h: 'What stays on your device', p: ['My Garage and Compare keep your chosen cars in your own browser, and we can’t see them. Your browser also remembers that a button has already been counted during your visit. You can clear all of this in your browser settings. We don’t use advertising cookies. Staff who sign in to the admin area get a sign-in cookie, and visitors don’t need one.'] },
      { h: 'Visitor statistics', p: ['We may use Google Analytics to see which pages bring enquiries. When it is switched on, it sets analytics cookies, and Google processes technical details such as your IP address. We don’t use it to identify you.'] },
      { h: 'Who else is involved', p: ['Like most websites, this one uses outside services to run: website hosting, a database to store enquiries, and image hosting for photos. These providers may see basic technical information such as your IP address when your browser loads the page. WhatsApp handles the chats you start with us.'] },
      { h: 'How long we keep it, and your choices', p: [`We keep enquiries for as long as we need them to look after you and keep proper records. To ask what we hold about you, or to have it corrected or deleted, contact us on ${ask(site)}.`] },
    ],
  },
  '/terms': {
    title: 'Website terms',
    description: (site) => `How the ${site.businessName} website works: it sends enquiries, not bookings. Prices, deposits and availability are confirmed with our team.`,
    updated: '5 November 2026',
    sections: (site) => [
      { h: 'This website sends enquiries', p: [`This website helps you ask ${site.businessName} about renting a car. Sending an enquiry or a WhatsApp message is not a booking, and a car is reserved for you only once our team confirms it.`] },
      { h: 'Rates, deposits and rental terms', p: ['This website doesn’t show rates or take payments. Our team confirms the cost, deposit, kilometre limits, documents and any other conditions with you directly, in writing on WhatsApp, before you commit.'] },
      { h: 'Cars and photos', p: ['We try to keep car details accurate, but features can differ between cars of the same model. Some photos show the model in general and may not be the exact car you receive. Please ask us if a particular detail matters to you. Availability depends on your dates.'] },
      { h: 'Road and travel information', p: ['Distances, drive times and route tips on this website are approximate guides. Roads, tolls, ferry timings and airport terminals change, so please check them before you travel. You are responsible for following traffic laws and holding a valid licence when you drive.'] },
      { h: 'Using this website', p: ['Please don’t misuse this website, for example by sending false enquiries or trying to break into it. Its text and design belong to us or the people who licensed them to us.'] },
      { h: 'Changes and contact', p: [`We may update these terms from time to time, and the date on this page shows the latest version. They are governed by the laws of India. For questions, contact us on ${ask(site)}.`] },
    ],
  },
};
