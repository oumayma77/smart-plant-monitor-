  let plantState = {
            moisture: 65,
            light: 45,
            temperature: 22,
            lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }

        function updateDisplay() {
            // Mettre à jour les jauges
            document.getElementById('moistureValue').textContent = plantState.moisture + '%';
            document.getElementById('lightValue').textContent = plantState.light + '%';
            document.getElementById('tempValue').textContent = plantState.temperature + '°C';

            document.getElementById('moistureGauge').value = plantState.moisture;
            document.getElementById('lightGauge').value = plantState.light;
            document.getElementById('tempGauge').value = (plantState.temperature - 15) * 6.67;

            
            updateRecommendations();

           
            updateStats();
        }

        function updateRecommendations() {
            const recommendations = [];

            if (plantState.moisture < 30) {
                recommendations.push(" Arroser dans les 24h");
            }
            if (plantState.moisture < 20) {
                recommendations.push(" ARROSAGE URGENT - Plante très sèche");
            }
            if (plantState.light < 25) {
                recommendations.push(" Déplacer vers plus de lumière");
            }
            if (plantState.temperature > 28) {
                recommendations.push(" Température élevée - Éloigner du radiateur");
            }
            if (plantState.temperature < 16) {
                recommendations.push(" Température basse - Protéger du froid");
            }

            const list = document.getElementById('recommendationsList');

            if (recommendations.length === 0) {
                list.innerHTML = '<p>✅ Toutes les conditions sont optimales</p>';
            } else {
                list.innerHTML = recommendations.map(rec => `<p>${rec}</p>`).join('');
            }
        }

        function updateStats() {
            const diffDays = Math.floor((new Date() - plantState.lastWatered) / (1000 * 60 * 60 * 24));
            document.getElementById('lastWatered').textContent = diffDays + 'j';

            // Calculer le prochain arrosage (exemple simple)
            const nextWater = plantState.moisture < 40 ? 'Aujourd\'hui' : 'Dans 2j';
            document.getElementById('nextWatering').textContent = nextWater;

            // Score de santé (exemple simple)
            const healthScore = Math.min(100, plantState.moisture + plantState.light / 2);
            document.getElementById('healthScore').textContent = Math.round(healthScore) + '%';
        }

        

        const broker = "wss://test.mosquitto.org:8081/mqtt";
        const moisturetopic = "plant/oumayma_001/moisture";
        const lighttopic = "plant/oumayma_001/light";
        const temperaturetopic = "plant/oumayma_001/temperature";

        /* connect to MQTT  */
        const client = mqtt.connect(broker);

        client.on('connect', () => {
            console.log('connected to MQTT');
            client.subscribe(moisturetopic);
            client.subscribe(lighttopic);
            client.subscribe(temperaturetopic);

        });

        /*handle incoming MQTT messages */
        client.on('message', (topic, message) => {
            console.log('📨 TOPIC:', topic, 'VALUE:', message.toString());

            const value = parseFloat(message.toString());

            if (topic == moisturetopic) {
                console.log(' Moisture topic MATCH!');
                plantState.moisture = value;
            } else if (topic == lighttopic) {
                console.log(' Light topic MATCH!');
                plantState.light = value;
            } else if (topic == temperaturetopic) {
                console.log(' Temperature topic MATCH!');
                plantState.temperature = value;
            } else {
                console.log(' Unknown topic received:', topic);
            }

            updateDisplay();
        });

        /* error handling */
        client.on('error', (error) => {
            console.error(' MQTT error:', error);
    document.querySelector('.plant-status').textContent = ' Erreur MQTT';

        });
