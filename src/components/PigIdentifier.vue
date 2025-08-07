<template>
  <div class="container">
    <h1>🐷 Schweine Von Bullerbyn 🐗 </h1>

    <!-- Ergebnisansicht mit Info-Karte -->
    <div v-if="currentNode.result">
  <h2>Gefunden: {{ currentNode.result }}</h2>
  <div class="pig-card">
    <img
      :src="getPigImage(currentNode.result)"
      :alt="`Bild von ${currentNode.result}`"
      class="pig-image"
    />
    <div class="pig-info">
      <h3>{{ currentNode.result }}</h3>
      <p>{{ pigInfo[currentNode.result].description }}</p>
    </div>
  </div>
  <button class="reset-button" @click="reset">Nochmal starten</button>
  <button
    v-if="path.length"
    class="back-button"
    @click="goBack"
  >
    Zurück
  </button>
</div>


    <!-- Fragen & Optionen -->
    <div v-else>
      <div class="question-box">
        <p class="question">{{ currentNode.question }}</p>
      </div>
      <div class="options">
  <button
    v-for="(branch, option) in currentNode.options"
    :key="option"
    class="option-button"
    @click="advance(option)"
  >
    {{ formatLabel(option) }}
  </button>
  <button
    v-if="path.length"
    class="back-button"
    @click="goBack"
  >
    Zurück
  </button>
</div>

    </div>
  </div>
</template>

<script>
import decisionTree from '../assets/decision_tree.json';

export default {
  name: 'PigIdentifier',
  data() {
    return {
      tree: decisionTree,
      path: [],
      currentNode: decisionTree,
      pigInfo: {
        Franz: {
          description: 'Männlich, rosa, rechte Ohrmarke/Loch, normaler Rücken, keine Ohrspitzen, langer Schwanz ohne Haare. Lange Haare an den Ohren. Haltungsstufe 1, Kümmerer – Ferkel untergewichtig, schlechte körperliche Verfassung, bedeuten für Tierindustrie Verluste, erreichen das Schlachtalter selten, kam zusammen mit Ferdinand nach Bullerbyn.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/11/WhatsApp-Bild-2024-11-12-um-12.56.02_971190da.jpg'
        },
        Kiwi: {
          description: 'Männlich, schwarze Flecken im Gesicht, rechte Ohrmarke/Loch, kurzer Schwanz. Sehr redefreudig und kommunikativ, kommt auf einen zu, lässt sich gerne streicheln. Name wegen kleinem Kopf (wie eine Kiwi), mit Flasche aufgezogen, lebte zuerst im Haus der Familie.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2023/03/kiwi.jpg'
        },
        Ronja: {
          description: 'Weiblich, grauer Rücken, rechte Ohrmarke/Loch, kurzer Schwanz. Kümmerer, lag mit Hope und Feline in der Ferkelbucht, von Hedda adoptiert.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/08/WhatsApp-Bild-2024-08-12-um-23.58.03_2ee5d254.jpg'
        },
        Ferdinand: {
          description: 'Männlich, rosa, rechte Ohrmarke/Loch, Ohrrandnekrose (Ohrrand ohne Spitzen). Ausschussprodukt aus Tierindustrie, Ferkel, das nicht richtig wächst, absterbendes Gewebe, Eitergeschwür, heute aber gesund.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/08/WhatsApp-Bild-2024-08-12-um-23.55.27_2553c11a.jpg'
        },
        Hedda: {
          description: 'Weiblich, linke Ohrmarke/Loch, hängende Ohren, langer Schwanz mit Haaren. Sehr dominant, Saugleiste ausgelaugt, Mutter von Hope, Adoptivmutter von Ronja. Letztes Schwein, das nach Bullerbyn kam. War tragend in einem Zuchtbetrieb zur Aufklärung, wurde zusammen mit Nia gerettet und zog Ferkel auf. Im Pass als „saubissig“ eingestuft.',
          image: 'https://veganbullerbyn.de/wp-content/webp-express/webp-images/uploads/2024/07/MG_1300-3.jpg.webp'
        },
        Nia: {
          description: 'Weiblich, linke Ohrmarke/Loch, hängende Ohren, langer Schwanz ohne Haare. Sehr dominant, Saugleiste ausgelaugt, Mutter von Feline. Gemeinsam mit Hedda gerettet, zog zusammen mit ihr Feline, Hope und Ronja auf.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_1467-21.jpg'
        },
        Feline: {
          description: 'Weiblich, linke Ohrmarke/Loch, abgegrenzte Flecken, kurzer Schwanz. Deutlich schmaler als Ronja, kleinstes Ferkel des letzten Wurfs, bernsteinbraune Augen, Duroc-Anteil – daher etwas rötlicher.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/08/WhatsApp-Bild-2024-08-12-um-23.57.27_bbfea4a9.jpg'
        },
        Rosalie: {
          description: 'Weiblich, linke Ohrmarke/Loch, rosa, kurzer Schwanz. Hat Buckel, humpelt/geht auffällig, sehr lang und schmal. Wurde unter Mutter gequetscht, war kurzzeitig gelähmt, mit Krankengymnastik geheilt.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_1639-13.jpg'
        },
        Hope: {
          description: 'Weiblich, linke Ohrmarke/Loch, rosa, geringelt langer Schwanz mit Haaren. Kleinste des Wurfs, Tochter von Hedda, wurde zusammen mit Feline und Ronja von Hedda und Nia aufgezogen.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_1526-26.jpg'
        },
        Justus: {
          description: 'Männlich, komplett gefleckt, voll behaart, keine Ohrmarke/Loch. Hält sich getrennt von der Rotte, frisst, schläft, liegt separat. Wurde im Biobetrieb nicht geschlachtet, als Haustier gehalten. Kann nicht gut mit anderen Schweinen kommunizieren.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_1641-14.jpg'
        },
        Maike: {
          description: 'Weiblich, rosa, voll behaart, rechte Ohrmarke/Loch. Sehr behaart, Mangalitza-Wollschwein. Kümmerling aus Biobetrieb, wurde gerne abgegeben, war lange dominant in der Rotte.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_1628-9.jpg'
        },
        Milli: {
          description: 'Weiblich, größtes Hängebauchschwein, schwarz-weiße Borsten am ganzen Körper. Gemeinsam mit Vanilli vor dem Schlachten gerettet. Ihre Halter:innen begingen Suizid, Nachbar:innen griffen ein.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2023/03/milli-neu.jpg'
        },
        Vanilli: {
          description: 'Weiblich, klein, halb rosa, halb schwarz, weiße Borsten. Ihre Halter:innen begingen Suizid, Angehörige wollten sie schlachten lassen – Nachbar:innen griffen ein.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_1031-9.jpg'
        },
        Strolch: {
          description: 'Männlich, heller Borstenwuchs, deutlicher Buckel, Stoßzähne. Gemeinsam mit Susi vor dem Schlachten gerettet, lebt mit ihr in Bullerbyn.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2023/03/strolch.jpg'
        },
        Susi: {
          description: 'Weiblich, komplett schwarz mit Borsten im Nacken. Angehörige wollten sie nach Tod des Halters schlachten lassen, Enkel rettete sie. Erste Bewohnerin von Bullerbyn.',
          image: 'https://veganbullerbyn.de/wp-content/uploads/2023/03/susi.jpg'
        },
        Frida: {
          description: 'Weiblich, linke Ohrmarke, orangerote Borsten, klare schwarze Flecken im Gesicht und am Schwanz, sehr schuppige Haut, kurzer Schwanz. Stark unterernährt und apathisch gefunden, heute Palliativpatientin in Bullerbyn.',
          image: 'https://veganbullerbyn.de/wp-content/webp-express/webp-images/uploads/2024/07/MG_0979-6.jpg.webp'
        },
        Lili: {
          description: 'Weiblich, Wildschwein, braunes Fell. Unverwechselbar mit Gezi, lebt gemeinsam mit ihr in Bullerbyn.',
          image: 'https://photos.google.com/share/AF1QipM_w4celDO1BxwzdtstbdnjhSnNwAYGsxQsUOP70MPeNY3zLQAc3zBD_duGsfj1UQ/photo/AF1QipN8WAdpjOU3yonBMvoHK-23UtpWXR3hVFzuwvk?key=TlphZXhpMTZ5TWN0b2tfSEc3RHJMQW9aZHphSFR3'
        },
        Gezi: {
          description: 'Weiblich, Wildschwein, graues Fell. Wurde nach illegaler Jagd im Straßengraben gefunden, von Tierärztin aufgepäppelt und kam nach Bullerbyn.',
          image: 'https://veganbullerbyn.de/wp-content/webp-express/webp-images/uploads/2024/07/MG_1622-8.jpg.webp'
        }
}

    };
  },
  methods: {
    advance(option) {
      this.path.push(option);
      this.currentNode = this.currentNode.options[option];
    },
    reset() {
      this.path = [];
      this.currentNode = this.tree;
    },
    goBack() {
      if (this.path.length) {
        this.path.pop();
        let node = this.tree;
        for (const step of this.path) {
          node = node.options[step];
        }
        this.currentNode = node;
      }
    },
    formatLabel(option) {
      const map = {
  "ja": "Ja",
  "nein": "Nein",
  "komplett_gefleckt": "Komplett gefleckt",
  "rosa": "Rosa",
  "braun": "Braun",
  "grau": "Grau",
  "halb_schwarz_rosa_klein": "Halb schwarz, halb rosa (klein)",
  "schwarz_weiss_borsten_groß": "Schwarz/weiß Borsten (groß)",
  "stoßzähne_buckel_helle_borsten": "Stoßzähne, Buckel, helle Borsten",
  "nur_schwarz_borsten_im_nacken": "Nur schwarz, Borsten im Nacken",
  "flecken_gesicht": "Flecken im Gesicht",
  "grau_rücken": "Grau am Rücken",
  "ohne_spitzen": "Ohne Ohrspitzen",
  "long_without_hair": "Langer Schwanz ohne Haare",
  "flecken_genau_abgegrenzt": "Flecken abgegrenzt",
  "short": "Kurz",
  "long_with_hair": "Lang mit Haaren",
  "frida_check": "Orangene Borsten und Flecken im Gesicht?"
}
;
      return map[option] || option;
    },
    getPigImage(name) {
  const info = this.pigInfo[name];
  return info?.image || 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_0979-6.jpg';
}
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 2rem auto;
  font-family: sans-serif;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  color: #212121;
}
.question-box {
  background-color: #fce4ec;
  border: 1px solid #f8bbd0;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.question {
  font-weight: bold;
  margin: 0;
}
.option-button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #f48fb1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #212121;
  font-weight: bold;
}
.option-button:hover {
  background-color: #ec407a;
  color: white;
}

.back-button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: #d1c4e9; /* soft violet */
  color: #4527a0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.back-button:hover {
  background-color: #b39ddb;
  color: white;
}

.reset-button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: #b0bec5;
  color: #37474f;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.reset-button:hover {
  background-color: #90a4ae;
  color: white;
}

.pig-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fdf5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.pig-image {
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.pig-info {
  text-align: center;
  color: #212121;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}
</style>