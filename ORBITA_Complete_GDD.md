# 2047: The Great Space Expedition
## Complete Game Design Document (GDD)

**Working title:** 2047: The Great Space Expedition  
**Genre:** Educational Space Exploration / Adventure Simulation  
**Target audience:** Grade 4–5 students, approximately ages 9–11  
**Primary platform:** Web / Browser  
**Recommended engine:** Unity WebGL or equivalent WebGL-capable engine  
**Players:** Single-player  
**Core promise:** Explore space, discover real science, talk to a witty spacecraft companion, and learn by doing rather than memorising.

> **Design constraint:** The game uses no developer-hosted generative AI, LLMs, AI-generated game content, or AI-driven dialogue generation. The companion is powered by a deterministic knowledge-retrieval system, authored response templates, rules, keyword/semantic indexes, and procedural systems. Browser speech recognition and operating-system speech synthesis may be used as platform capabilities; their availability and implementation can vary by browser/device.

---

# 1. HIGH CONCEPT

The player becomes a junior space explorer beginning on Earth and gradually travelling through the Solar System in a small educational research spacecraft. They pilot a ship, deploy a rover, scan celestial objects, observe phenomena, collect virtual samples, repair equipment, solve navigation and science problems, and maintain an expanding **Explorer's Journal**.

The game world is procedurally assembled from real scientific parameters and curated knowledge sourced primarily from NASA and ISRO, with Wikipedia used as a secondary reference and cross-checking source. The player never receives a giant textbook dump. Instead, knowledge appears because the player has physically reached a place, scanned something, asked a question, completed a task, or encountered a mission problem.

A companion called **KORA** (Knowledge & Orbital Reconnaissance Assistant) travels with the player. KORA explains difficult ideas in child-friendly language, answers questions from the game's verified knowledge base, gives hints, tells small jokes, and occasionally delivers dry commentary about the player's questionable piloting decisions.

The educational fantasy is simple:

**“I am not reading about space. I am exploring it.”**

---

# 2. DESIGN PILLARS

## 2.1 Explore First, Explain Second

The game should create curiosity before explanation. A player sees a strange crater, glowing aurora, storm system, ring shadow, ice field, or asteroid. They investigate it. Then KORA explains what they just encountered.

## 2.2 Real Science, Playable Abstraction

The game should respect real science while accepting that real astronomical distances and scales cannot be represented literally in a fun school game. Distances, travel times, terrain size, and orbit spacing are therefore deliberately compressed and labelled as **game scale**.

## 2.3 Learn Through Action

Each important concept should be attached to something the player does:

- Gravity → land a rover safely.
- Orbits → plan a transfer route.
- Phases → observe the Moon from different positions.
- Atmosphere → compare planets using instruments.
- Geology → scan rocks and craters.
- Solar energy → manage panels and power.
- Communication → repair a data link.
- Scientific method → make an observation, record evidence, then form a conclusion.

## 2.4 Companion, Not Chatbot

KORA should feel conversational without pretending to be an unlimited artificial intelligence. Every answer comes from a controlled knowledge graph or an authored fallback line.

## 2.5 Failure Should Teach

No harsh “Game Over” for a wrong science answer. The game should respond with feedback, a clue, a short explanation, and another attempt.

## 2.6 Wonder Matters

Space should feel enormous, quiet, beautiful, strange, and occasionally funny. Educational software has committed enough crimes against visual design already.

---

# 3. EDUCATIONAL VISION

## 3.1 Learning Objectives

By the end of the core campaign, a Grade 4–5 player should be able to:

1. Identify the Sun, eight planets, Earth's Moon, major dwarf planets, asteroids, and comets.
2. Explain the basic difference between a star, planet, moon, asteroid, and comet.
3. Describe why planets orbit the Sun and moons orbit planets at an elementary level.
4. Compare rocky planets and giant planets.
5. Explain gravity using observable gameplay.
6. Recognise that planetary conditions differ in temperature, atmosphere, gravity, and surface composition.
7. Explain why the Moon has phases.
8. Describe the basic purpose of spacecraft, landers, orbiters, rovers, satellites, and space stations.
9. Recognise major milestones such as Apollo 11 and Indian lunar exploration.
10. Explain the basic idea behind scientific observation, evidence, measurement, and hypothesis.
11. Understand that not every space object can be visited directly and that scientists often investigate distant objects using telescopes and spacecraft.
12. Build confidence asking questions about science.

## 3.2 Learning Style

The game follows a loop of:

**Observe → Ask → Explore → Measure → Solve → Record → Explain → Revisit**

The player should encounter the same concept in multiple contexts. For example, gravity appears on Earth, the Moon, Mars, and Jupiter's moons rather than being explained once in a textbook screen.

---

# 4. TARGET PLAYER EXPERIENCE

## Intended feeling

The player should feel like:

- a young explorer,
- a scientist,
- a pilot,
- part of a larger space program,
- and the owner of a small mysterious ship with a very opinionated robot companion.

## Avoid

- long lectures,
- difficult controls,
- frightening failure loops,
- excessive menus,
- giant walls of text,
- arbitrary fantasy facts presented as science,
- unmoderated chat,
- competitive leaderboards that make lower-performing children feel bad.

---

# 5. STORY OVERVIEW

## Premise

In a near-future fictional educational exploration program, children can remotely operate a safe experimental exploration craft through a simulated Solar System. The player is selected as a **Junior Explorer**.

The spacecraft contains KORA, a navigation and science companion originally built to help astronauts understand incoming mission data.

The player's long-term assignment is to complete the **Solar System Knowledge Expedition**.

There is no villain. The conflict comes from exploration problems, scientific mysteries, equipment failures, navigation challenges, and incomplete knowledge.

## Main narrative question

**How much can one curious explorer discover by the time they return home?**

## Narrative structure

### Act I — Home Planet
Earth, Moon, launch basics, satellites, communication, astronomy, and the first mission.

### Act II — Our Neighbourhood
Mercury, Venus, Mars, near-Earth objects, asteroids, and the asteroid belt.

### Act III — The Giant Worlds
Jupiter, Saturn, rings, moons, storms, magnetism, and spacecraft missions.

### Act IV — The Cold Edge
Uranus, Neptune, dwarf planets, Kuiper Belt objects, and the concept of distant exploration.

### Act V — Beyond the Map
Telescopic astronomy, exoplanets, the Milky Way, and what scientists can learn without physically visiting a world.

The final mission returns the player to Earth to present an **Explorer's Field Report** containing evidence gathered throughout the campaign.

---

# 6. CORE GAME LOOP

The complete loop is:

1. Choose a destination or mission.
2. Plot a route.
3. Pilot or fast-travel through compressed space.
4. Arrive near a celestial body.
5. Scan the surroundings.
6. Detect points of scientific interest.
7. Deploy the rover when a surface is available.
8. Explore and perform interactive science tasks.
9. Ask KORA questions.
10. Unlock knowledge cards.
11. Complete a mission challenge.
12. Return data to a station or Earth.
13. Answer a short knowledge check.
14. Improve the Explorer's Journal.
15. Unlock the next destination or optional mission.

The key design choice is that **knowledge is a reward**. There should be no need to grind coins just to reach the next planet.

---

# 7. PLAYER CHARACTER

## Identity

The player chooses:

- name,
- avatar,
- suit accent,
- helmet style,
- exploration badge.

Avoid detailed body customisation that increases production scope. The player is intended to feel represented without turning the game into a character-creation simulator.

## Player progression

Progression uses ranks instead of combat levels:

- Cadet Explorer
- Junior Navigator
- Field Explorer
- Planetary Scout
- Solar System Researcher
- Mission Specialist
- Master Explorer

Ranks unlock equipment and destinations, not pay-to-win advantages.

---

# 8. KORA: THE AI-LIKE COMPANION WITHOUT AI

## 8.1 Identity

**Name:** KORA  
**Expansion:** Knowledge & Orbital Reconnaissance Assistant  
**Role:** Navigation, science education, mission support, comic relief.

## 8.2 Personality

KORA is:

- curious,
- precise,
- patient,
- slightly sarcastic,
- protective of the player,
- excited about discoveries,
- occasionally unimpressed by reckless driving.

Example tone:

> “That crater is approximately as old as a very large number of birthdays. I recommend we measure it instead of guessing.”

> “You have selected the correct answer. I am documenting this historic event.”

> “Please stop driving the rover directly into the rock. The rock has already won.”

These lines are authored and selected from rules, not generated.

## 8.3 Companion Modes

### Explain Mode
Simple explanation of a known topic.

### Hint Mode
Provides a clue without giving the answer immediately.

### Mission Mode
Provides objective-related instructions.

### Discovery Mode
Comments on new observations.

### Casual Mode
Optional jokes and personality lines.

### Safety Mode
Warns about game-system hazards such as low rover energy or low communication signal.

---

# 9. DETERMINISTIC COMPANION INTELLIGENCE

The companion should appear smart because the underlying information architecture is smart.

## 9.1 Input pipeline

**Player voice/text → Normalisation → Topic matching → Intent detection → Knowledge retrieval → Response selection → Personality layer → TTS**

## 9.2 Text normalisation

Normalise:

- lowercase text,
- punctuation,
- common spelling mistakes,
- contractions,
- number words,
- common child phrasing.

Example:

“why is mars red”

and

“why does mars look red”

map to the same intent.

## 9.3 Intent categories

A lightweight deterministic intent table can include:

- WHAT_IS
- WHY
- HOW
- WHERE
- WHEN
- COMPARE
- MISSION_HELP
- OBJECT_IDENTIFICATION
- FACT_CHECK
- NAVIGATION_HELP
- QUIZ_HINT
- CASUAL
- UNKNOWN

## 9.4 Topic matching

Each knowledge topic has:

- canonical name,
- aliases,
- keywords,
- related topics,
- planet association,
- mission association,
- grade level,
- difficulty,
- source references.

Example:

`CHANDRAYAAN_3`

Aliases:

- chandrayaan 3
- chandrayaan-3
- india moon mission
- vikram lander
- pragyan rover

## 9.5 Retrieval

Use deterministic retrieval such as:

- keyword index,
- inverted index,
- TF-IDF ranking,
- weighted keyword matching,
- edit-distance spelling correction,
- topic graph traversal.

No free-form language model is necessary.

## 9.6 Response assembly

A response is selected from authored templates.

Example:

**Intent:** WHY  
**Topic:** Mars colour  
**Answer template:**

“Researchers explain Mars' reddish appearance mainly through iron minerals in its surface material. They can investigate those materials using spacecraft and rovers.”

Then the personality layer may append:

“Basically, Mars has a very serious rust problem.”

The scientific answer remains the authoritative portion.

## 9.7 Unknown questions

KORA must never invent an answer.

Fallback hierarchy:

1. Find exact topic.
2. Find related topic.
3. Offer known nearby topic.
4. Say that the game does not currently have that answer.

Example:

> “I do not have a verified answer for that one yet. Try asking me about Mars, rovers, gravity, or the Moon.”

This is one of the most important systems in the entire project.

---

# 10. VOICE SYSTEM

## 10.1 Voice input

Use browser Web Speech capabilities where supported. `SpeechRecognition` provides microphone-driven recognition, but browser support is not universal, so the game must always provide a text-input fallback. MDN currently classifies SpeechRecognition as limited-availability. citeturn936467search4

### Browser flow

1. Player presses microphone button.
2. Browser permission is requested.
3. Player speaks.
4. Transcript appears on screen.
5. Player can confirm/edit the transcript.
6. KORA processes the text through the local deterministic knowledge system.
7. KORA speaks the answer.

## 10.2 Voice output

Use browser `speechSynthesis` for real-time voice output. MDN currently lists SpeechSynthesis as widely available across browsers/devices. citeturn878261search1turn878261search8

This allows the game to generate spoken responses from the game's own text without a generative voice model.

## 10.3 Voice design

The ideal KORA voice:

- warm,
- clear,
- slightly robotic,
- moderate pace,
- friendly,
- highly intelligible for children.

Do not make the voice excessively robotic. The joke is that KORA is a machine, not that KORA is impossible to understand.

## 10.4 Guaranteed fallback

If speech recognition is unavailable:

**Ask KORA [type your question]**

The experience must remain fully playable.

## 10.5 Strict no-AI option

If the company interprets “no AI” to include browser speech recognition, disable voice recognition and provide:

- physical keyboard input,
- on-screen keyboard for tablets,
- a fixed voice-command library using buttons.

Speech synthesis may still be used as a system accessibility feature, subject to company policy.

---

# 11. KNOWLEDGE SYSTEM

This is the foundation of the project.

## 11.1 Source hierarchy

### Tier 1 — Primary scientific organisations
NASA, ISRO and other official science agencies when appropriate.

### Tier 2 — Encyclopaedic cross-reference
Wikipedia and Wikimedia resources.

### Tier 3 — Educational references
Trusted educational organisations, museums, universities, and public science institutions.

The game should not treat a random webpage as equivalent to a mission archive.

NASA currently describes the Solar System as containing eight planets and five officially recognized dwarf planets, with hundreds of moons and numerous smaller bodies. NASA also distinguishes terrestrial planets from the outer giant planets. citeturn801158search0turn801158search1

ISRO's current spacecraft mission listing includes Chandrayaan-1, Chandrayaan-2, Chandrayaan-3, the Mars Orbiter Mission, Aditya-L1, and XPoSat among India's science missions. citeturn878261search7

## 11.2 Content ingestion pipeline

Do not fetch arbitrary webpages and display their raw text to children.

Instead:

**Internet sources → Content ingestion → Source metadata → Fact extraction → Human/editor review → Grade-appropriate rewrite → Knowledge JSON → Versioned game build**

For Wikipedia, use the MediaWiki API rather than brittle HTML scraping. MediaWiki documents APIs for retrieving page content and parsing pages. citeturn877363search2turn877363search3

## 11.3 Knowledge pack schema

Each topic should contain fields like:

```json
{
  "id": "planet.mars.surface.color",
  "topic": "Why Mars looks red",
  "planet": "mars",
  "grade": "4-5",
  "difficulty": 2,
  "keywords": ["mars", "red", "iron", "surface"],
  "summary": "Mars appears reddish because iron-bearing materials on its surface have altered and produce rust-like colours.",
  "childExplanation": "Mars looks red because iron in its rocks and dust can form reddish minerals.",
  "misconceptions": ["Mars is covered in red paint"],
  "relatedTopics": ["mars.surface", "mars.atmosphere", "mars.rovers"],
  "missionHooks": ["scan.red.dust", "compare.earth.rocks"],
  "source": [
    {"provider": "NASA", "url": "..."},
    {"provider": "Wikipedia", "url": "..."}
  ],
  "version": "2026.09"
}
```

## 11.4 Content states

Every knowledge item should have one of:

- DRAFT
- REVIEW
- APPROVED
- PUBLISHED
- RETIRED

## 11.5 Fact confidence

Internally mark:

- well established,
- current mission status,
- historical fact,
- active research,
- hypothesis/uncertain.

When a fact is uncertain, the game should say so.

Example:

> “Scientists are still studying this question. We have evidence, but not a final answer yet.”

That is much better science than pretending every mystery has a tidy answer because children deserve accuracy too.

---

# 12. WIKIPEDIA AND CONTENT LICENSING

If Wikipedia or Wikimedia text/assets are reused, the implementation must respect the applicable license and attribution requirements. Wikimedia states that most Wikimedia text is available under CC BY-SA 4.0 and GFDL, and that reuse generally requires attribution and compliance with the relevant license. citeturn877363search1turn877363search4turn877363search9

Recommended approach:

- Use Wikipedia primarily as a reference.
- Write original child-friendly explanations.
- Preserve source links and attribution metadata.
- Keep a source-and-license manifest.
- Check the license of every reused image, audio clip, or other media individually.
- Prefer original procedural visuals for the game.

NASA and ISRO materials also need individual rights/licensing checks before commercial reuse of specific images, audio, marks, or media.

---

# 13. PROCEDURAL SPACE WORLD

## 13.1 Core philosophy

The world is generated from a **Celestial Body Definition** rather than hand-modelled planet-by-planet.

Each body contains parameters such as:

- radius,
- gravity,
- rotation period,
- orbital position,
- atmospheric class,
- temperature band,
- terrain class,
- surface colour range,
- cloud class,
- ring system,
- moon list,
- scientific points of interest,
- mission history,
- procedural seed.

NASA publishes metric planetary fact-sheet data that can serve as a reliable source for core physical parameters. citeturn801158search6

## 13.2 Basic-shape asset strategy

Most visual assets are generated from:

- spheres,
- cubes,
- cones,
- cylinders,
- toruses,
- planes,
- lines,
- particles,
- procedural meshes.

This directly satisfies the challenge requirement to build assets from simple shapes and systems instead of large collections of authored meshes.

## 13.3 Planet generator

### Base sphere
Create a UV sphere or cube-sphere.

### Terrain
Displace vertices using layered deterministic noise.

### Craters
Generate crater descriptors containing:

- position,
- radius,
- depth,
- rim height,
- age class.

Apply radial displacement and material variation.

### Mountains
Use multiple noise layers plus seeded ridge masks.

### Valleys
Use inverse ridge functions and erosion-like shaping.

### Surface regions
Define procedural regions based on latitude, longitude, elevation, and planet type.

### Atmosphere
Use a simple atmospheric shell with shader-based scattering approximation.

### Clouds
Use scrolling procedural textures/noise.

### Rings
Generate ring bands from radial segments and particle-like debris.

### Stars
Generate deterministic starfield points from a seed.

## 13.4 Scientific constraints

Procedural generation should not invent a fake continent and call it a real Martian landmark.

Use two categories:

### Scientific landmarks
Must be based on published data.

### Procedural filler terrain
Clearly treated as simulated terrain between known points.

The UI can display:

**“Procedurally generated terrain inspired by real planetary data.”**

## 13.5 Real-time generation pipeline

At runtime:

1. Load destination definition.
2. Read scientific parameters.
3. Apply planet seed.
4. Generate body mesh.
5. Generate terrain regions.
6. Add known landmarks.
7. Add mission-specific points of interest.
8. Stream nearby detail.
9. Activate physics only around the player.

---

# 14. SCALE MODEL

A scientifically accurate Solar System cannot be represented at one simultaneous visual scale.

Therefore use three scales:

## Discovery scale
Planet sizes and orbital relationships shown for understanding.

## Navigation scale
Compressed travel distances for gameplay.

## Surface scale
Local areas enlarged for rover gameplay.

Every time an abstraction matters, KORA explains it.

Example:

> “Space is much larger in reality. We are using a compressed travel scale so you can actually reach places before graduating.”

This becomes a learning moment rather than a hidden cheat.

---

# 15. SPACECRAFT SYSTEM

## 15.1 Player ship

The player's ship is a compact research vessel.

Suggested fictional designation:

**EX-01 Explorer**

## 15.2 Core ship functions

- Navigation
- Scanning
- Long-range communication
- Planetary approach
- Orbital insertion
- Docking
- Rover deployment
- Sample/data storage
- Power management
- Fuel management
- Emergency return

## 15.3 Cockpit layout

Keep cockpit readable for Grade 4–5:

**Left:** navigation  
**Centre:** main view  
**Right:** science scanner  
**Bottom:** mission objectives  
**Top:** fuel, power, communication, ship status  
**KORA bubble:** contextual companion panel

## 15.4 Controls

Desktop:

- WASD / arrow keys for movement where appropriate
- mouse for camera
- click to scan
- E / interact
- Space for selected ship action

Gamepad support is optional.

## 15.5 Navigation assist

The ship should auto-stabilise heavily. Full realistic spacecraft simulation would turn a Grade 5 educational game into a very niche orbital mechanics exam.

Advanced players can optionally enable:

- assisted steering,
- relative velocity view,
- basic orbital mode,
- manual docking,
- trajectory preview.

---

# 16. ROVER SYSTEM

## 16.1 Rover role

The rover is the player's hands-on science tool.

It is used for:

- terrain exploration,
- sample collection,
- scanning rocks,
- photographing landmarks,
- measuring environmental conditions,
- deploying instruments.

NASA's Mars Exploration Rover missions provide a strong real-world design reference because rover exploration combines movement with scientific investigation and evidence gathering. NASA describes Spirit and Opportunity as exploring ancient Martian environments and investigating whether they had conditions suitable for life. citeturn936467search13turn936467search14

## 16.2 Rover controls

- drive,
- rotate camera,
- activate scanner,
- collect sample,
- deploy instrument,
- return to ship,
- autopilot return.

## 16.3 Rover mini-game examples

### Crater Age Detective
Compare crater size and distribution to infer which terrain area appears older.

### Rock Scanner
Match measured properties to rock categories.

### Soil Sampler
Choose sampling locations and explain why repeated samples help scientists.

### Wheel Trouble
Restore rover movement by connecting a simple circuit.

### Signal Puzzle
Position the rover or antenna to restore communication.

---

# 17. SCIENCE SCANNER

The scanner is one of the most important tools in the game.

When aimed at an object, it shows:

- object type,
- basic physical information,
- observation notes,
- scientific tags,
- mission relevance,
- newly unlocked knowledge.

Example:

**OBJECT DETECTED: IMPACT CRATER**

**Observation:** Circular depression with raised rim.  
**Topic unlocked:** Meteoroid impacts.  
**KORA:** “Something hit this place very hard. Happily, our current mission is not responsible.”

---

# 18. EXPLORER'S JOURNAL

The Journal is the game's knowledge inventory.

Tabs:

- Planets
- Moons
- Missions
- Spacecraft
- Astronauts
- Science concepts
- Observations
- Questions asked
- Discoveries
- Badges

Each entry contains:

- simple summary,
- expanded explanation,
- visual diagram,
- evidence discovered by the player,
- related missions,
- source links.

## Discovery levels

### Seen
Player has encountered it.

### Scanned
Player has collected basic data.

### Understood
Player completed the associated activity.

### Mastered
Player later answered a related question without assistance.

---

# 19. WORLD STRUCTURE

## 19.1 Earth

Starting area.

Locations:

- launch facility,
- mission control,
- observatory,
- training zone,
- coastal recovery area,
- Earth orbit.

Topics:

- Earth as a planet,
- atmosphere,
- gravity,
- Moon,
- satellites,
- telescopes,
- communication,
- spaceflight basics.

## 19.2 Earth Orbit

Tutorial environment.

Activities:

- inspect satellites,
- practise docking,
- collect space-weather readings,
- visit the first fictional station.

### Fictional station: Terra Gate
A bustling orbital junction where the player learns how stations work.

## 19.3 Moon

First major off-world exploration area.

Topics:

- phases,
- craters,
- lunar surface,
- gravity,
- lunar exploration,
- Apollo 11,
- robotic exploration,
- Indian lunar missions.

NASA records Apollo 11 as the 1969 crewed lunar landing mission involving Neil Armstrong, Buzz Aldrin, and Michael Collins, with landing on July 20, 1969. citeturn936467search0turn936467search2

## 19.4 Chandrayaan Learning Zone

A dedicated educational sequence on India's lunar exploration.

Possible learning capsules:

- Chandrayaan-1
- Chandrayaan-2
- Chandrayaan-3
- orbiter vs lander vs rover
- why landing is difficult
- lunar south polar region
- scientific instruments

ISRO's current mission listing includes Chandrayaan-1 (2008), Chandrayaan-2 (2019, orbiter operational according to the listing), and Chandrayaan-3 (2023, now listed as not operational). citeturn878261search7

The game should represent historical mission facts carefully and distinguish them from the fictional player mission.

## 19.5 Mercury

Focus:

- rocky planet,
- extreme temperature differences,
- short year,
- proximity to the Sun.

Mission example:

**Thermal Balance** — manage observation time and shield orientation.

## 19.6 Venus

Focus:

- dense atmosphere,
- extreme surface environment,
- greenhouse effect at an elementary level,
- radar mapping.

Mission example:

**Cloud Detective** — infer surface information through simulated radar observation.

## 19.7 Mars

Large exploration chapter.

Focus:

- red surface,
- atmosphere,
- ancient water evidence,
- rover exploration,
- polar regions,
- dust storms,
- search for signs of past habitability.

NASA notes evidence that water existed on ancient Mars and explains that rover investigations help scientists understand whether environments could have been habitable. citeturn936467search14

Mission example:

**The Dry River Puzzle** — inspect a valley, compare rock layers, and infer that flowing water may once have influenced the landscape.

## 19.8 Asteroid Belt

Focus:

- asteroids,
- small-body classification,
- resource misconceptions,
- impact risk,
- navigation.

The asteroid belt should not become a cartoon field of randomly packed rocks. It should teach that space is vast and objects are separated by large distances, while gameplay uses an accessible representation.

## 19.9 Jupiter

Focus:

- largest planet,
- gas giant,
- clouds and storms,
- strong gravity,
- moons,
- spacecraft exploration.

NASA identifies Jupiter as the largest planet and describes Jupiter and Saturn as gas giants. citeturn801158search1

Mission example:

**Storm Watch** — observe changing cloud bands and identify the major storm system in an educational abstraction.

## 19.10 Saturn

Focus:

- rings,
- moons,
- gas giant,
- ring particles,
- mission history.

Mission example:

**Ring Survey** — classify ring regions based on particle density and gaps.

## 19.11 Uranus

Focus:

- ice giant,
- unusual rotation orientation,
- faint rings,
- distant exploration.

Mission example:

**Tilted World** — understand that planetary rotation can have unusual orientations.

## 19.12 Neptune

Focus:

- ice giant,
- powerful winds,
- great distance,
- Voyager exploration.

Mission example:

**Wind Mapper** — infer atmosphere movement from simplified instrument readings.

## 19.13 Dwarf Planet / Kuiper Belt Chapter

Focus:

- Pluto,
- Ceres,
- dwarf planet classification,
- Kuiper Belt,
- how scientific definitions change when new evidence appears.

NASA lists five officially recognized dwarf planets in the Solar System: Ceres, Pluto, Haumea, Makemake, and Eris. citeturn801158search0turn801158search1

## 19.14 Deep Space Observatory

Instead of claiming the player physically travels between stars, introduce a telescope mission.

Player controls an observatory and investigates distant worlds using light and simple spectral clues.

This teaches:

**You do not always need to visit something to learn about it.**

---

# 20. FICTIONAL SPACE STATIONS

The stations are fictional and should be clearly marked as such.

## Terra Gate
Earth orbit.

Purpose:

- fuel,
- upgrades,
- beginner quizzes,
- first astronaut NPCs.

## Selene Junction
Lunar orbit.

Purpose:

- lunar missions,
- Chandrayaan story content,
- geology challenge.

## Ares Relay
Mars orbit.

Purpose:

- rover specialists,
- communications puzzle,
- Mars missions.

## Ceres Junction
Asteroid belt.

Purpose:

- navigation training,
- classification challenge,
- small-body science.

## Jove Gateway
Jupiter system.

Purpose:

- moon exploration,
- gravity lessons,
- giant-planet missions.

## Ring Haven
Saturn system.

Purpose:

- ring science,
- photography missions,
- advanced navigation.

Stations can contain NPC astronauts, scientists, engineers, mission coordinators, and fictional mission crews.

---

# 21. ASTRONAUT NPC SYSTEM

NPC astronauts should not become traditional quest-givers who say “collect three moon rocks because reasons.”

They should feel like colleagues.

### NPC types

- Pilot
- Geologist
- Planetary scientist
- Robotics engineer
- Communications specialist
- Mission commander
- Space historian

### NPC interaction

Each astronaut asks questions connected to the location.

Example at Selene Junction:

> “You found a crater with a raised rim. What do you think made it?”

Possible answers:

- wind,
- an impact,
- a tree,
- rain.

The answer system provides feedback and explains why.

---

# 22. QUIZ AND ASSESSMENT SYSTEM

## 22.1 Quiz philosophy

Quizzes should feel like mission checks, not school examinations.

## 22.2 Question types

### Multiple choice
Fast and reliable.

### Drag and match
Planet → feature.

### Sequence
Order the planets.

### Classification
Rocky / giant / dwarf planet / moon / asteroid.

### Observation-based
Look at the scene and infer an answer.

### Prediction
“What would happen if gravity were weaker?”

### Short spoken answer
Player says an answer and speech recognition maps it against accepted keywords where supported.

## 22.3 Difficulty tiers

### Tier 1 — Identify
“What is this?”

### Tier 2 — Describe
“What is it like?”

### Tier 3 — Compare
“How is it different from Earth?”

### Tier 4 — Explain
“Why does this happen?”

### Tier 5 — Apply
“What would you do next in this mission?”

---

# 23. SIDE MISSIONS

Side missions are intentionally short, usually 3–8 minutes.

Examples:

## Lost Beacon
Locate a drifting beacon using signal strength.

Learning:
communication and triangulation.

## The Missing Sample
Determine which rover sample belongs in a specific geological category.

Learning:
classification.

## Solar Panel Trouble
Rotate the panel toward the simulated Sun.

Learning:
solar energy.

## Station Supply Run
Deliver supplies while managing fuel.

Learning:
resource planning.

## Astronaut's Riddle
An astronaut gives clues about a celestial body.

Learning:
recall and inference.

## Photograph Mission
Capture a landmark under requested lighting.

Learning:
observation and documentation.

## Repair the Antenna
Reconnect components in the correct order.

Learning:
basic systems thinking.

---

# 24. REFUEL AND STATION MECHANIC

Space stations act as safe hubs rather than tedious menus.

At a station the player can:

- refuel,
- recharge,
- repair,
- accept missions,
- speak with astronauts,
- review journal entries,
- take a knowledge check,
- upgrade equipment.

## Station knowledge check

Before certain upgrades, the player completes one or two location-related questions.

For example:

**Upgrade:** Advanced Lunar Scanner  
**Question:** “Why do craters have a round shape in many cases?”

The aim is not to block the player permanently. Wrong answers trigger teaching feedback and another opportunity.

---

# 25. RESOURCES

Keep resource management simple.

## Fuel
Used for travel.

## Energy
Used for ship and rover tools.

## Data Storage
Represents mission data capacity.

## Signal
Determines communication reliability.

## Mission Time
Optional timer for selected tasks.

Avoid a hunger/thirst style survival system. A 10-year-old should not be performing accounting on oxygen tanks before breakfast.

---

# 26. UPGRADES

## Ship

- improved scanner,
- larger data storage,
- better solar efficiency,
- improved communications,
- better manoeuvring assist,
- longer mission endurance.

## Rover

- better wheels,
- longer battery life,
- improved camera,
- sample arm,
- drilling tool,
- environmental sensor.

## KORA modules

Not intelligence upgrades. Instead:

- expanded vocabulary,
- extra knowledge packs,
- better translation UI,
- visual explanation modules,
- more personality dialogue.

---

# 27. SCIENCE MINI-GAMES LIBRARY

A reusable mini-game framework should handle many activities.

## Orbit Match
Drag an object into a stable orbit.

## Gravity Drop
Predict and observe fall times.

## Planet Sort
Sort celestial bodies by type.

## Temperature Compare
Compare readings between planets.

## Signal Route
Move antennas to establish communication.

## Sample Match
Match sample properties with likely source.

## Telescope Focus
Focus and identify objects.

## Solar Panel Angle
Optimise panel orientation.

## Crater Measure
Estimate diameter from known reference points.

## Rover Terrain
Choose a safe route using slope and obstacle indicators.

Every mini-game should teach one clear concept.

---

# 28. MISSION DESIGN TEMPLATE

Every mission should use the following structure.

### Mission title
Short and memorable.

### Question
What is the mystery?

### Scientific concept
Exactly one primary learning concept.

### Player action
What does the player physically do?

### Evidence
What does the player observe or measure?

### KORA explanation
20–60 seconds maximum for a typical explanation.

### Challenge
A short application task.

### Journal reward
Unlock one knowledge card.

### Reflection
One optional question.

---

# 29. EXAMPLE COMPLETE MISSION

## Mission: The First Footprints

**Location:** Moon  
**Goal:** Understand human lunar exploration.

### Step 1
Travel from Earth orbit to the Moon.

### Step 2
KORA introduces lunar navigation.

### Step 3
Land in a safe fictional exploration zone.

### Step 4
Locate evidence of historical exploration.

### Step 5
Open a historical mission capsule.

### Step 6
Learn about Apollo 11.

NASA's Apollo 11 mission overview documents the July 20, 1969 lunar landing, the three-person crew, lunar surface scientific objectives, and return to Earth. citeturn936467search2

### Step 7
Complete a rover-style sample task inspired by lunar surface science.

### Step 8
Answer:

“Why did astronauts collect rocks and soil?”

### Step 9
KORA explains that returned samples allow scientists to analyse lunar material directly.

NASA describes Apollo sample collection as an important scientific component of the mission and notes that returned lunar samples expanded understanding of the Moon. citeturn936467search2turn936467search12

### Step 10
Journal entry unlocked:

**HUMAN EXPLORATION — MOON**

---

# 30. CHANDRAYAAN MISSION ARC

Because the target audience is likely to include Indian students, Indian space exploration should be integrated as core content rather than a decorative reference.

## Mission 1 — India Looks at the Moon
Introduce Chandrayaan-1.

Topics:

- why send an orbiter,
- mapping the Moon,
- looking for useful scientific clues.

## Mission 2 — Orbit and Land
Introduce Chandrayaan-2.

Topics:

- orbiter,
- lander,
- rover,
- why landing is difficult.

## Mission 3 — Aiming for the Surface
Introduce Chandrayaan-3.

Topics:

- lander,
- rover,
- precise landing,
- surface experiments,
- lunar south polar region.

ISRO's public mission listing provides the mission dates, launch vehicles, and current operational status for these Chandrayaan missions. citeturn878261search7

## Gameplay rule
Historical missions must never be rewritten to make the player's fictional mission appear to have caused real historical events.

Example:

**Wrong:** “You helped ISRO land Chandrayaan-3.”  
**Correct:** “You are running a fictional training mission inspired by real lunar missions.”

---

# 31. VISUAL DIRECTION

## Style

**Stylised scientific realism.**

Not photorealistic. Not childish toy-world either.

Target visual language:

- clean shapes,
- attractive colours,
- dark space backdrop,
- glowing instruments,
- large readable objects,
- clear silhouettes,
- subtle holographic UI,
- cinematic lighting.

## Planet presentation

Planet visuals should be visually appealing while remaining recognisable.

Use controlled palettes rather than random rainbow materials.

## UI

Inspired by modern aerospace interfaces, but simplified heavily.

Rules:

- one primary action per screen,
- large touch/click targets,
- minimal text,
- strong iconography,
- consistent colour coding.

---

# 32. AUDIO DESIGN

## Music

Three music states:

### Earth
Warm, curious, optimistic.

### Deep space
Wide ambient soundscape with slow harmonic movement.

### Discovery
Short musical motif when unlocking scientific knowledge.

## Sound effects

- scanner ping,
- radio crackle,
- thruster burst,
- rover wheel movement,
- docking clamp,
- data upload,
- mission complete tone.

Space itself should remain quiet. Do not fill every moment with sci-fi explosions.

---

# 33. KORA AUDIO DESIGN

Use one consistent voice for normal speech.

Priority hierarchy:

1. Current mission instruction.
2. Scientific explanation.
3. Safety/system warning.
4. Optional joke.

Never let a joke obscure an important instruction.

## Dialogue pacing

For children:

- short sentences,
- concrete words,
- minimal jargon,
- explain new terms immediately.

Example:

> “An orbiter circles a planet. A lander is built to reach the surface. A rover drives around after landing.”

---

# 34. USER INTERFACE

## Main HUD

Top:

- destination,
- ship status.

Left:

- mission objective.

Right:

- KORA panel.

Bottom:

- Scan,
- Map,
- Rover,
- Journal,
- Talk.

## KORA interaction

Microphone button should be obvious.

When speaking:

**Listening…**

Then:

**You:** “Why is Jupiter so big?”

Then KORA responds with text and voice.

---

# 35. MAP SYSTEM

The map is a simplified educational model.

Modes:

### Solar System View
Planets displayed in order.

### Mission View
Current target and transfer route.

### Local View
Nearby points of interest.

### Knowledge View
Highlighted bodies with incomplete journal entries.

Every destination should visually answer:

**Where am I?**  
**What is nearby?**  
**What can I learn here?**

---

# 36. RESEARCH-DRIVEN WORLD UPDATES

The game can support new content without shipping a completely new client.

## Static content package model

Host versioned JSON packs on a CDN.

Example:

`/knowledge/2026.09/planets/mars.json`

`/knowledge/2026.09/missions/chandrayaan.json`

`/knowledge/2026.09/questions/mars.json`

The game checks a small manifest at startup.

If a newer approved content pack exists:

1. download it,
2. validate checksum,
3. cache it locally,
4. replace the older pack,
5. show “New Mission Knowledge Available”.

This creates the feeling of a living scientific expedition without generating content with AI.

## Important rule

Live internet retrieval should update **approved structured data**, not directly control game dialogue or world generation from arbitrary webpages.

---

# 37. CONTENT UPDATE EXAMPLE

Suppose a new official mission page or new scientific result becomes available.

The pipeline is:

**Source change → ingestion → editor review → child-safe rewrite → quiz creation → planet/mission hooks → publish pack → client downloads pack**

KORA then gains the new knowledge because its knowledge base changed, not because its “brain” became a giant language model.

---

# 38. PROCEDURAL CONTENT GENERATION FROM KNOWLEDGE

Each knowledge fact can have gameplay consequences.

Example:

`gravity = low`

Can affect:

- rover jump/traction behaviour,
- player movement,
- sample physics,
- landing difficulty.

`atmosphere = dense`

Can affect:

- visibility,
- flight model,
- cloud density,
- scanner operation.

`rings = true`

Can generate:

- ring system,
- ring observation missions,
- particle-density mini-games.

`many_moons = true`

Can generate:

- moon catalogue,
- orbit observation tasks,
- comparative missions.

This is the core trick:

**Knowledge becomes game rules.**

---

# 39. DATA MODEL

Suggested high-level objects:

```text
CelestialBody
  id
  type
  parentBody
  physicalData
  visualData
  terrainData
  orbitData
  missionData
  knowledgeTopics[]

KnowledgeTopic
  id
  planetId
  gradeBand
  difficulty
  keywords[]
  aliases[]
  summary
  childExplanation
  advancedExplanation
  sourceRefs[]
  relatedTopics[]

Mission
  id
  location
  objective
  prerequisites[]
  knowledgeTopics[]
  steps[]
  rewards[]
  questionIds[]

Question
  id
  topicId
  difficulty
  questionText
  options[]
  correctOption
  explanation
  hint

DialogueTemplate
  id
  intent
  topicId
  conditions[]
  text
  emotion
  voiceSettings
```

---

# 40. TECHNICAL ARCHITECTURE

## Client

Unity/WebGL game.

## Runtime systems

- WorldManager
- CelestialBodyManager
- ProceduralTerrainSystem
- MissionManager
- KnowledgeManager
- CompanionManager
- VoiceManager
- JournalManager
- StationManager
- QuizManager
- SaveManager
- AudioManager
- UIManager

## Browser bridge

A small JavaScript bridge can expose:

- speech recognition start/stop,
- recognised transcript,
- recognition availability,
- speech synthesis,
- voice enumeration.

Unity communicates with JavaScript through a WebGL interop layer.

---

# 41. PERFORMANCE TARGETS

The game should prioritise stable performance over visual complexity.

Targets:

- 60 FPS on capable desktop systems.
- 30 FPS minimum target on lower-end school hardware where practical.
- Aggressive LOD for planet surfaces.
- GPU instancing for repeated objects.
- Chunked terrain streaming.
- Distance-based culling.
- Minimal physics bodies.
- Simplified collision meshes.
- No constantly running expensive logic on distant objects.

## Planet optimisation

The entire planet should not exist at maximum detail simultaneously.

Use:

**Planet shell → regional chunks → local detail → player vicinity high detail**

---

# 42. SAVE SYSTEM

Save:

- player profile,
- completed missions,
- discovered topics,
- journal progress,
- station unlocks,
- ship upgrades,
- rover upgrades,
- quiz mastery,
- settings,
- voice preference.

For an educational deployment, local save should work without requiring an account.

Optional school mode can export a progress code rather than personal data.

---

# 43. SAFETY AND CHILD PRIVACY

This game targets children, so the architecture should be conservative.

Rules:

- no open web chat,
- no player-to-player text chat in MVP,
- no public profiles,
- no real names required,
- no unnecessary microphone storage,
- no behavioural advertising,
- no voice recordings retained by the game,
- clear microphone permission messaging,
- parent/teacher controls for voice features.

Voice transcription should be processed only as needed for the active query, with the game discarding the transcript after the response unless a learning feature explicitly requires saving text and the deployment policy permits it.

Browser speech APIs may rely on implementation-specific services, so privacy behaviour must be tested separately for each supported browser and documented in the final product privacy policy.

---

# 44. ACCESSIBILITY

Provide:

- subtitles,
- readable font sizes,
- colour-blind-friendly indicators,
- text alternative for every voice interaction,
- adjustable speech rate,
- reduced motion option,
- screen-reader-friendly web shell where possible,
- keyboard-only navigation for menus,
- high-contrast mode.

---

# 45. TEACHER / CLASSROOM MODE

A major opportunity for the product is to make the game useful outside free play.

## Teacher dashboard

Optional web dashboard showing:

- completed planets,
- concepts discovered,
- quiz accuracy,
- mission completion,
- misconceptions detected by repeated wrong answers.

Do not turn the dashboard into a ranking board for children.

## Classroom mission mode

Teacher can select:

- Moon lesson,
- Solar System lesson,
- Mars lesson,
- gravity lesson,
- Indian space missions lesson.

Players then start inside a specific mission scenario.

---

# 46. LEARNING ANALYTICS

Track only useful educational events.

Examples:

- `topic_discovered`
- `topic_explained`
- `question_answered`
- `hint_used`
- `question_mastered`
- `mission_completed`
- `rover_sample_collected`
- `voice_question_asked`

Avoid unnecessary surveillance-style metrics.

Use aggregated, anonymised data for product improvement where possible.

---

# 47. DIFFICULTY ADAPTATION WITHOUT AI

Difficulty can adapt using explicit rules.

Example:

If the player answers 3 questions correctly:

`difficulty += 1`

If the player fails twice:

`difficulty -= 1`

If the player repeatedly uses hints:

show a simpler variant of the next question.

No machine-learning model required.

---

# 48. NO-AI QUIZ ANSWER MATCHING

For spoken answers, define accepted answer sets.

Example:

Question:

“Which planet is the largest?”

Accepted phrases:

- Jupiter
- it is Jupiter
- Jupiter is the largest

Normalize transcript, remove filler words, then compare against accepted phrases using keyword matching and edit distance.

This allows natural-ish answers without a language model.

---

# 49. DISCOVERY EVENTS

Discovery events are automatically generated when meaningful combinations occur.

Example:

Player visits Moon + scans crater + has learned gravity.

Trigger:

**“Moon scientist moment unlocked.”**

KORA:

> “You have now observed a crater, measured the surface, and compared gravity. Congratulations. You are doing actual science instead of simply driving in circles.”

The event then unlocks a short advanced journal entry.

---

# 50. MISSION GENERATION

Missions can be generated from templates.

## Template variables

- destination,
- terrain feature,
- science topic,
- instrument,
- resource constraint,
- question,
- reward.

Example:

`SCAN + ROCK + CLASSIFICATION`

can generate a mission on Mars, Moon, Mercury, or an asteroid with different data.

This greatly reduces content production cost.

---

# 51. PLANET CONTENT MATRIX

| Destination | Primary topics | Vehicle | Example mission |
|---|---|---|---|
| Earth | gravity, atmosphere, satellites | Ship | Launch Prep |
| Moon | craters, phases, lunar missions | Ship + Rover | First Footprints |
| Mercury | heat, rocky worlds, orbit | Ship | Thermal Balance |
| Venus | atmosphere, heat, radar | Ship | Cloud Detective |
| Mars | geology, water evidence, rovers | Ship + Rover | The Dry River Puzzle |
| Asteroids | small bodies, impacts, classification | Ship + optional micro-rover | Rock Hopper |
| Jupiter | gas giants, storms, gravity, moons | Ship | Storm Watch |
| Saturn | rings, moons, gas giants | Ship | Ring Survey |
| Uranus | ice giants, tilt, rings | Ship | Tilted World |
| Neptune | winds, distance, ice giant | Ship | Wind Mapper |
| Pluto/Ceres | dwarf planets, classification | Ship | What Counts as a Planet? |
| Deep Space Observatory | stars, light, exoplanets | Telescope | Find a Faraway World |

---

# 52. CONTENT PACING

Typical session target:

**15–30 minutes.**

A child should be able to make visible progress in one session.

Typical mission pacing:

- 2 min briefing,
- 5–10 min exploration,
- 3–5 min activity,
- 2 min knowledge check,
- 1 min journal reward.

Free exploration can continue indefinitely without progression pressure.

---

# 53. FIRST 30 MINUTES EXPERIENCE

## Minute 0–5
Earth training.

Player sees Earth from orbit.

KORA:

> “Welcome, Explorer. Your home planet looks small from here. It is not small. Your homework is probably still enormous.”

Player learns camera, scan, map, and ship movement.

## Minute 5–10
Satellite inspection.

Player learns what satellites do.

## Minute 10–15
Travel to lunar vicinity.

Player learns basic orbit idea.

## Minute 15–20
Land rover.

Find first crater.

## Minute 20–25
KORA explains craters and lunar gravity.

## Minute 25–30
Mini knowledge check and first Journal page.

The player should finish the opening section feeling that they already accomplished something real.

---

# 54. NARRATIVE DELIVERY

Use three layers.

## Layer 1 — Environmental
The world itself teaches.

## Layer 2 — Companion
KORA explains when relevant.

## Layer 3 — Journal
Player can choose to read deeper material.

Never force all three layers at once.

---

# 55. SCIENTIFIC LANGUAGE RULES

For Grade 4–5:

Use:

- “gas giant” with explanation,
- “gravity pulls things,”
- “orbit means moving around another object,”
- “atmosphere is the layer of gases around a world.”

Avoid unexplained jargon such as:

- albedo,
- magnetosphere,
- periapsis,
- spectroscopy,
- lithosphere.

When advanced terms are necessary, use:

**Term → simple definition → example**

Example:

> “Spectroscopy is a way scientists study light to learn what something is made of.”

---

# 56. MISCONCEPTION SYSTEM

The game should actively identify and correct common misconceptions.

Examples:

### Misconception
“Summer happens because Earth is closer to the Sun.”

### Correction approach
Use a simple Earth-tilt demonstration.

---

### Misconception
“All planets have a solid surface.”

### Correction approach
Show Jupiter's atmosphere and explain that giant planets do not have a normal solid surface to stand on.

NASA describes Jupiter and Saturn as gas giants and Uranus and Neptune as ice giants, with no hard surfaces like terrestrial planets. citeturn801158search1turn801158search5

---

### Misconception
“Astronauts float because there is no gravity in space.”

### Correction approach
Use a simple orbit demonstration.

---

# 57. SCIENCE EXPLANATION RULE

KORA should distinguish:

**Observed fact**  
“We have measured this.”

**Model**  
“Scientists use this model to explain it.”

**Hypothesis / active research**  
“Scientists are still investigating this.”

That distinction is an excellent long-term scientific habit.

---

# 58. MUSIC AND VOICE PERFORMANCE TESTS

Before launch, conduct listening tests with actual Grade 4–5 students.

Measure:

- word recognition,
- explanation retention,
- whether voice speed feels too fast,
- whether jokes distract from the learning point,
- whether the child can repeat the concept afterward.

---

# 59. MVP SCOPE

The MVP should **not** attempt the entire Solar System.

## MVP destinations

- Earth
- Earth orbit
- Moon
- one fictional station
- Mars
- one Mars-orbit station

## MVP systems

- ship flight,
- rover,
- scanner,
- procedural terrain,
- knowledge system,
- KORA text interaction,
- browser voice input where supported,
- speech synthesis,
- journal,
- mission system,
- quiz system,
- save system.

## MVP content

Approximately:

- 30–50 knowledge topics,
- 15–20 missions,
- 50–80 questions,
- 100+ companion lines,
- 10–20 NPC interactions.

---

# 60. VERTICAL SLICE

Recommended vertical slice:

**Earth → Moon → lunar rover → Apollo/Chandrayaan knowledge sequence → fictional lunar station → quiz → return to Earth.**

This slice demonstrates almost every important feature:

- space travel,
- procedural generation,
- rover,
- science scanning,
- knowledge retrieval,
- voice input,
- TTS,
- station NPCs,
- missions,
- quiz,
- progression.

If the vertical slice feels good, the rest of the Solar System becomes content expansion rather than a complete new game architecture.

---

# 61. PRODUCTION PHASES

## Phase 1 — Foundation

- player controller,
- camera,
- ship,
- base planet shader,
- basic UI.

## Phase 2 — Moon Prototype

- procedural Moon,
- rover,
- scanner,
- crater system.

## Phase 3 — Knowledge Engine

- JSON schema,
- topic index,
- deterministic retrieval,
- KORA response system.

## Phase 4 — Voice

- Web Speech bridge,
- transcript UI,
- browser support detection,
- speech synthesis.

## Phase 5 — Mission Framework

- objectives,
- triggers,
- dialogue,
- rewards,
- question checks.

## Phase 6 — Content

- Moon,
- Mars,
- Earth,
- mission history.

## Phase 7 — Educational Testing

- child usability tests,
- teacher review,
- misconception review.

## Phase 8 — Expansion

- inner planets,
- asteroid belt,
- giants,
- dwarf planets.

---

# 62. ASSET PRODUCTION PLAN

## Procedural

Generate:

- planets,
- moons,
- craters,
- rocks,
- terrain,
- stars,
- ring particles,
- basic vegetation-like Earth filler only where needed,
- station modules,
- simple props.

## Handmade from primitive meshes

Create from cubes/cylinders:

- rover,
- ship,
- stations,
- antenna,
- science equipment,
- launch platform,
- containers.

## Reuse strategy

A single science station module can become:

- Earth station,
- lunar station,
- Mars station,
- asteroid station,

by changing:

- scale,
- material,
- lights,
- decals,
- attached modules.

This preserves visual coherence and production speed.

---

# 63. UI CONTENT GENERATION

UI should also be data driven.

Knowledge card JSON can automatically generate:

- journal card,
- scanner result,
- KORA answer,
- quiz question links,
- mission hints,
- discovery notifications.

One source of truth reduces the classic game-development problem where the UI says one thing, the dialogue says another, and the planet quietly does something entirely different.

---

# 64. ERROR HANDLING

## Internet unavailable
Use cached knowledge.

## Knowledge pack unavailable
Fallback to embedded core knowledge pack.

## Voice recognition unavailable
Text box.

## TTS unavailable
Subtitles.

## Procedural terrain fails
Use a deterministic fallback preset.

## Save fails
Use local backup slot.

The player should never be trapped because one browser API decided to have a nervous breakdown.

---

# 65. QUALITY ASSURANCE

## Scientific QA
Every fact must have:

- source,
- review date,
- content owner.

## Gameplay QA
Test:

- travel,
- docking,
- rover deployment,
- scanning,
- mission progression,
- save/load.

## Educational QA
Verify:

- age appropriateness,
- clarity,
- factual correctness,
- misconception handling.

## Voice QA
Test:

- accents,
- background noise,
- misrecognitions,
- keyboard fallback,
- speech rate.

---

# 66. ACCESSIBLE VOICE QUESTIONS

A child can ask:

> “Why is the moon following me?”

KORA should map “following me” to concepts such as:

- Moon orbit,
- Earth's motion,
- apparent movement.

Response:

> “It is not following your spaceship. The Moon is orbiting Earth, and as your position changes, it can look like it is travelling with you.”

The underlying system only needs a controlled map of related phrases.

---

# 67. KORA RESPONSE CATEGORIES

For each topic, author:

- 1 short answer,
- 1 detailed answer,
- 1 hint,
- 1 analogy,
- 1 misconception correction,
- 1 discovery line,
- 2–5 personality comments,
- 1 “I don't know” fallback.

This gives a surprisingly rich companion without AI generation.

---

# 68. KORA ANALOGIES

Keep analogies physically honest enough to not create new misconceptions.

Example:

> “An orbit is like continually falling toward a planet while moving sideways fast enough to keep missing the surface.”

For Grade 4–5, simplify further if needed.

---

# 69. OPTIONAL CO-OP FUTURE EXPANSION

Not part of MVP.

A future classroom mode could let students work together as:

- Pilot
- Science Lead
- Rover Operator
- Communications Officer

Each role gets a limited interface.

This could support classroom teamwork without adding competitive combat systems.

---

# 70. MONETISATION / DISTRIBUTION

Recommended product direction:

- school licensing,
- education bundle,
- institutional deployment,
- free introductory version,
- paid expansion packs for additional science chapters.

Avoid child-targeted advertising.

---

# 71. SUCCESS METRICS

## Product

- session completion rate,
- mission completion,
- return sessions,
- destination exploration.

## Learning

- pre/post concept improvement,
- knowledge retention,
- reduced misconception rate,
- independent answer rate.

## UX

- time to first meaningful action,
- voice success rate,
- average number of help requests,
- accessibility feature usage.

These metrics are product targets, not promises of educational effectiveness until validated with testing.

---

# 72. EXAMPLE CONTENT PACK

## Moon: Gravity

**Short:** Gravity pulls objects toward the Moon.

**Child explanation:** The Moon has less mass than Earth, so its surface gravity is weaker.

**Interaction:** Jump with suit assist and compare jump arcs.

**Question:** Why can you jump higher on the Moon than Earth?

**Hint:** Think about how strongly gravity pulls you.

**Related:** Earth gravity, mass, weight.

---

## Mars: Water Evidence

**Short:** Mars has evidence that liquid water existed on its surface long ago.

**Interaction:** Identify channels and layered rocks.

**Question:** What can landforms shaped by flowing water tell scientists?

**Answer:** They can provide evidence that water once flowed there.

NASA's Mars Exploration Rover material explicitly describes evidence of long-standing water on ancient Mars and its relevance to questions about habitability. citeturn936467search14

---

## Jupiter: Gas Giant

**Short:** Jupiter is a giant planet made mainly of hydrogen and helium.

**Interaction:** Dive through cloud layers in an educational simulation without pretending the player is landing on a solid surface.

**Question:** Why can't you simply park the rover on Jupiter?

**Answer:** Jupiter does not have a solid surface like Earth or Mars.

NASA classifies Jupiter and Saturn as gas giants and the outer planets as giant worlds rather than terrestrial rocky planets. citeturn801158search5

---

# 73. SAMPLE KORA KNOWLEDGE TREE

```text
Moon
├── Physical
│   ├── gravity
│   ├── size
│   ├── surface
│   └── temperature
├── Observation
│   ├── phases
│   ├── craters
│   └── maria
├── Exploration
│   ├── Apollo
│   ├── Chandrayaan-1
│   ├── Chandrayaan-2
│   └── Chandrayaan-3
└── Vehicles
    ├── orbiter
    ├── lander
    └── rover
```

If the player asks:

“What is a lander?”

KORA retrieves `Moon → Exploration → Vehicles → Lander`.

If they then ask:

“Was Chandrayaan-3 a lander?”

The system uses `Chandrayaan-3 → Vikram lander` and `Pragyan rover` topic relationships.

---

# 74. CONTENT AUTHORING TOOL

Build a small internal editor.

The editor should allow a content author to enter:

- topic,
- summary,
- child explanation,
- advanced explanation,
- keywords,
- aliases,
- misconceptions,
- related topics,
- mission hooks,
- questions,
- source URLs,
- review date.

The tool then exports validated JSON.

Validation should reject content missing:

- source,
- topic ID,
- explanation,
- grade band.

---

# 75. SCIENTIFIC SOURCE PANEL

Every journal entry should contain a small:

**Sources**

section.

This can show:

- NASA Science
- ISRO
- Wikipedia
- other approved reference

The full source metadata is available to teachers and optionally the player.

This makes the game teach not only facts, but also:

**“Where did this information come from?”**

---

# 76. REAL-TIME INTERNET KNOWLEDGE: RECOMMENDED IMPLEMENTATION

The challenge's “build environment in real time based on internet knowledge” idea should be implemented carefully.

### Do

Use internet-sourced structured parameters to drive procedural generation.

### Do

Use new approved knowledge packs to add:

- missions,
- discoveries,
- dialogue,
- journal entries,
- question sets.

### Do not

Send raw webpage text directly into a dialogue engine.

### Do not

Let arbitrary web content generate child-facing claims.

### Do not

Treat unverified online content as science.

The most robust architecture is:

**Internet → curated knowledge service → deterministic game runtime.**

---

# 77. EXPLORATION WITHOUT FAST TRAVEL AS THE DEFAULT

Travel should be meaningful, but not boring.

Use two options:

### Pilot
Player sees the journey and performs navigation tasks.

### Jump
Player skips the trip after learning the destination route.

The first time a planet is reached, require a short travel sequence. Later trips can be faster.

This ensures the player learns orbital/navigation concepts without forcing them to stare at a starfield for fifteen real-world minutes.

---

# 78. ENVIRONMENTAL STORYTELLING

The world can quietly communicate knowledge.

On Moon:

- footprints,
- lander silhouettes,
- rover tracks,
- equipment panels.

On Mars:

- old channels,
- layered rock,
- dust,
- rover tracks.

At Saturn:

- ring shadows,
- moon silhouettes,
- changing light.

The player sees first and then asks “why?”

---

# 79. REWARD SYSTEM

Reward curiosity.

Rewards:

- Journal pages,
- badges,
- ship decals,
- rover paint schemes,
- new scanner modes,
- station decorations,
- KORA personality packs.

Avoid loot boxes and random educational rewards.

---

# 80. BADGES

Examples:

**First Scan** — scan your first object.  
**Moon Walker** — complete the first lunar expedition.  
**Rover Driver** — complete a rover mission.  
**Mission Historian** — unlock five historical mission entries.  
**Planet Sorter** — correctly classify all main planet types.  
**Question Machine** — ask KORA ten questions.  
**Evidence Finder** — complete an observation-based mission.  
**Solar System Explorer** — visit every core destination.

Badges should represent behaviours and learning milestones rather than “being smarter.”

---

# 81. SAMPLE ENDGAME

The player returns to Earth after exploring the core Solar System.

Mission:

**The Explorer's Report**

The player selects:

- three planets,
- one Moon mission,
- one historical mission,
- one scientific concept.

They then assemble a simple presentation:

**What I saw → What I measured → What I learned → Where I learned it from**

KORA concludes:

> “Mission complete. You started by asking where the Moon was. You ended by explaining why it has craters. Acceptable progress.”

The credits roll over an animated return-to-Earth sequence.

---

# 82. FUTURE EXPANSIONS

Potential content packs:

### Solar Missions
Sun, solar wind, solar storms, spacecraft observing the Sun.

### Space Weather
Auroras, magnetic fields, solar activity.

### Exoplanet Detective
Use telescope observations rather than physical travel.

### Mission History Pack
NASA, ISRO, ESA, JAXA and other space programs.

### Space Engineering Pack
Rockets, stages, propulsion, communication, power systems.

### Astronomy Pack
Stars, galaxies, black holes, light-years.

---

# 83. RISKS AND MITIGATIONS

| Risk | Impact | Mitigation |
|---|---|---|
| Procedural worlds look repetitive | High | Multiple terrain generators + authored landmark zones |
| Science facts become outdated | High | Versioned source manifests + review dates |
| Wikipedia content licensing is mishandled | High | Use original wording and maintain attribution/license records |
| Browser speech support varies | High | Text fallback + capability detection |
| Voice recognition mishears children | Medium | Confirmation UI + keyword matching + typing fallback |
| Too much reading | High | Contextual short explanations + optional journal depth |
| Space scale feels unrealistic | Medium | Explicit compressed game scale + educational explanation |
| Performance drops on school PCs | High | LOD, chunking, instancing, simplified physics |
| Companion becomes repetitive | Medium | Multiple authored variants and state-driven reactions |
| Child privacy concerns | High | Minimise collection and avoid unnecessary accounts/chat |
| Content production becomes too large | High | Reusable templates + data-driven missions |

---

# 84. THE MOST IMPORTANT DESIGN RULE

Every major gameplay feature should answer:

**“What does the child learn by doing this?”**

If the answer is “nothing, but it looks cool,” keep it optional.

If the answer is:

**“They learn something by observing, making a decision, and seeing the result,”**

that feature belongs in the game.

---

# 85. FINAL PRODUCT DEFINITION

2047 is not a quiz game wearing a spacesuit.

It is an exploration simulation where:

- planets are places to investigate,
- spacecraft are tools,
- the rover is the player's science instrument,
- missions create context,
- astronauts provide social learning,
- KORA provides responsive guidance,
- procedural generation provides scale,
- a curated knowledge system provides scientific accuracy,
- and the Journal turns exploration into lasting knowledge.

The central technical idea is equally important:

**No generative AI is required to make the companion feel smart.**

A carefully designed deterministic system can provide surprisingly rich interaction when it has:

- good source data,
- strong topic relationships,
- synonyms and aliases,
- useful intents,
- hundreds of authored response fragments,
- contextual triggers,
- mission state,
- and a clear personality layer.

The player experiences this as a companion that “understands” them, while the underlying system is simply fast, well-structured software.

That is exactly the kind of engineering trick worth using in this challenge: less magic, more architecture.

---

# 86. RECOMMENDED FIRST BUILD

Build this exact sequence first:

**Earth Orbit → Terra Gate → Moon → Lunar Landing → Rover → Crater Scan → Apollo knowledge → Chandrayaan knowledge → Selene Junction → KORA voice question → station quiz → return to Earth.**

Once this loop works beautifully, add Mars.

Then turn the same systems into:

**Mars → Asteroid Belt → Jupiter → Saturn → Uranus → Neptune → Dwarf Planets → Deep Space Observatory.**

That way the project grows by adding content rather than rewriting the game.

---

# 87. REFERENCE BASE

The GDD's factual foundation should be maintained from current authoritative material during development.

### NASA
- NASA Science — Solar System Facts
- NASA Science — About the Planets
- NASA Planetary Fact Sheet
- NASA Moon Exploration
- NASA Apollo 11 mission material
- NASA Mars Exploration Rover material

### ISRO
- ISRO Spacecraft Missions
- ISRO mission resources and science publications

### Wikipedia / Wikimedia
- Wikipedia Solar System reference material
- MediaWiki API documentation
- Wikimedia reuse/licensing guidance

### Browser platform
- MDN Web Speech API documentation for speech recognition and speech synthesis

---

# 88. KEY REFERENCE NOTES

NASA currently documents eight planets in the Solar System and five officially recognised dwarf planets. citeturn801158search1

NASA's planetary fact sheet provides core comparison data including mass, diameter, gravity, rotation, moons, rings, and magnetic-field information. citeturn801158search6

NASA's Moon exploration material places Apollo 11's human landing in the wider history of lunar robotic and crewed exploration. citeturn936467search1turn936467search2

ISRO's current mission list provides the official mission history and current status categories for Chandrayaan and other Indian space-science missions. citeturn878261search7

Wikipedia/Wikimedia reuse requires attention to the licence of the material being reused and appropriate attribution; do not assume every image or asset on Wikipedia has the same licence. citeturn877363search1turn877363search7

MDN currently documents SpeechRecognition as limited availability and SpeechSynthesis as widely available, so voice input must not be treated as a guaranteed browser feature. citeturn936467search4turn878261search1

---

# 89. ONE-SENTENCE PITCH

**2047 is a kid-friendly space exploration simulation where every planet, mission, rover ride, conversation, and discovery teaches the player something real about our universe.**

# 90. TAGLINE OPTIONS

**Explore it. Ask about it. Learn it.**

**The universe is your classroom.**

**Go farther. Learn more.**

**Your first mission is curiosity.**

---

## END OF GDD
