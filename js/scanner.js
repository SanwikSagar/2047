window.G = window.G || {};

G.Scanner = (function () {
  const U = G.utils;
  let scanning = null;
  let scanProgress = 0;
  const SCAN_TIME = 2.2;

  const SCAN_INFO = {
    satellite: {
      name: 'Training Satellite', type: 'ARTIFICIAL SATELLITE',
      observation: 'Box-shaped body with solar panel arrays and a communications dish. It relays signals between Earth and spacecraft.',
      tags: ['communication', 'orbit', 'solar power'],
      knowledgeId: 'satellite.overview',
      kora: 'This satellite is a human-made machine orbiting Earth. It helps with phone signals, weather forecasts and GPS. It stays up by falling around Earth continuously.'
    },
    crater: {
      name: 'Impact Crater', type: 'IMPACT CRATER',
      observation: 'Circular depression with a raised rim of ejected material. The bowl shape and preserved rim suggest a relatively young impact.',
      tags: ['meteoroid impact', 'round shape', 'ejecta rim'],
      knowledgeId: 'moon.craters',
      kora: 'Something hit this place very hard. Happily, our current mission is not responsible. The round shape and raised rim are classic signs of a meteoroid impact.'
    },
    apollo_marker: {
      name: 'Apollo 11 Historical Marker', type: 'HISTORICAL SITE',
      observation: 'A memorial plaque marking where Apollo 11 astronauts collected samples in 1969. Bootprint patterns are preserved in the dust nearby.',
      tags: ['Apollo 11', '1969', 'human exploration', 'samples'],
      knowledgeId: 'apollo11',
      kora: 'On 20 July 1969, Neil Armstrong and Buzz Aldrin walked here. The rocks they collected are still studied in laboratories today.'
    },
    ch1_marker: {
      name: 'Chandrayaan-1 Capsule', type: 'KNOWLEDGE CAPSULE',
      observation: 'A holographic data capsule containing records of India\'s first Moon mission, launched by ISRO in 2008.',
      tags: ['Chandrayaan-1', 'ISRO', 'India', 'orbiter'],
      knowledgeId: 'chandrayaan1',
      kora: 'Chandrayaan-1 orbited the Moon and found evidence of water molecules on its surface. India\'s first Moon mission — a huge achievement.'
    },
    ch2_marker: {
      name: 'Chandrayaan-2 Capsule', type: 'KNOWLEDGE CAPSULE',
      observation: 'A holographic data capsule containing records of the 2019 mission with its orbiter, Vikram lander and Pragyan rover.',
      tags: ['Chandrayaan-2', 'ISRO', 'lander', 'rover'],
      knowledgeId: 'chandrayaan2',
      kora: 'Chandrayaan-2 carried an orbiter, a lander and a rover. The orbiter still works today. Landing is hard — the mission taught scientists a great deal.'
    },
    ch3_marker: {
      name: 'Chandrayaan-3 Capsule', type: 'KNOWLEDGE CAPSULE',
      observation: 'A holographic data capsule containing records of the 2023 mission that landed near the Moon\'s south pole.',
      tags: ['Chandrayaan-3', 'ISRO', 'south pole', 'Pragyan'],
      knowledgeId: 'chandrayaan3',
      kora: 'In August 2023, Chandrayaan-3 made India the first country to land near the Moon\'s south pole. The Pragyan rover studied the soil and temperature.'
    },
    channel: {
      name: 'Dry River Channel', type: 'ANCIENT CHANNEL',
      observation: 'A winding, carved channel with smooth banks and a flat floor — shapes typically cut by flowing liquid over long periods.',
      tags: ['ancient water', 'erosion', 'valley'],
      knowledgeId: 'mars.water',
      kora: 'This channel was almost certainly carved by flowing water. Billions of years ago, Mars was warmer and wetter than it is today.'
    },
    layered_rock: {
      name: 'Layered Rock Formation', type: 'SEDIMENTARY LAYERS',
      observation: 'Stacked rock layers of different colours and thicknesses. Layering like this often forms when material settles in water over time.',
      tags: ['sediment', 'layers', 'water evidence'],
      knowledgeId: 'mars.rovers',
      kora: 'These layers are like pages in a book. They often form when sediment settles in lakes or rivers — more evidence that water once flowed here.'
    },
    console: {
      name: 'Evidence Console', type: 'SCIENCE INSTRUMENT',
      observation: 'A field console ready to receive your observations. Combine the channel and rock evidence to form a conclusion.',
      tags: ['evidence', 'conclusion', 'scientific method'],
      knowledgeId: 'science.method',
      kora: 'Time to think like a scientist. What did you observe? What does the evidence tell you? Form your conclusion.'
    },
    rock: {
      name: 'Surface Rock', type: 'GEOLOGICAL SAMPLE',
      observation: 'A weathered rock showing mineral grains and surface alteration patterns consistent with long exposure.',
      tags: ['geology', 'minerals', 'surface'],
      knowledgeId: null,
      kora: 'A fine specimen. Rocks are history books — every mineral grain tells a story about the world it came from.'
    }
  };

  function startScan(poi) {
    if (scanning) return false;
    const info = SCAN_INFO[poi.kind];
    if (!info) return false;
    scanning = { poi: poi, info: info };
    scanProgress = 0;
    G.Audio.play('scan');
    return true;
  }

  function update(dt) {
    if (!scanning) return null;
    scanProgress += dt / SCAN_TIME;
    if (scanProgress >= 1) {
      const done = scanning;
      scanning = null;
      scanProgress = 0;
      completeScan(done);
      return { finished: true, poi: done.poi, info: done.info };
    }
    return { finished: false, progress: scanProgress, info: scanning.info };
  }

  function completeScan(entry) {
    const poi = entry.poi;
    const info = entry.info;
    poi.scanned = true;
    G.World.pulseScanRing(poi.obj.position, 0x5dffa0);
    G.Audio.play('discover');
    if (info.knowledgeId) {
      const isNew = G.Save.unlockKnowledge(info.knowledgeId, 'scanned');
      if (isNew) {
        G.UI.discoveryToast('Knowledge Unlocked', info.knowledgeId.split('.').pop().replace(/_/g, ' '));
        G.Journal.refresh();
      }
    }
    G.Missions.onScan(poi);
    G.UI.notify('Scan complete: ' + info.name, 'good');
  }

  function cancel() {
    scanning = null;
    scanProgress = 0;
  }

  function isScanning() { return !!scanning; }
  function progress() { return scanProgress; }
  function current() { return scanning; }

  return {
    startScan: startScan, update: update, cancel: cancel,
    isScanning: isScanning, progress: progress, current: current,
    infoFor: function (kind) { return SCAN_INFO[kind]; }
  };
})();
