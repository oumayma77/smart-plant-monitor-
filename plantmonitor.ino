#include <WiFi.h> 
#include <PubSubClient.h> 
WiFiClient wifi ; 
PubSubClient mqtt(wifi);  

const char* ssid="Ooredoo 4G_93F21B" ; 
const char* pwd="8E76665E6B" ;  
const char* host ="test.mosquitto.org" ; 
const char* moisturetopic = "plant/oumayma_001/moisture" ; 
const char*  lighttopic = "plant/oumayma_001/light" ; 
const  char* temperaturetopic = "plant/oumayma_001/temperature" ; 
 
float moisture , light , temperature ; 
void connectwifi() {  
  WiFi.begin(ssid,pwd) ; 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500) ;  
    Serial.println('.');
  } 
  Serial.println("connected ! "); 
  Serial.println("adresse IP= ") ; 
  Serial.print(WiFi.localIP()) ; 
}

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.println("Connecting to MQTT...");
    
    if (mqtt.connect("arduino_plant_001")) {  //arduino_plant_ ... = client ID 
      Serial.println("Connected to MQTT!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqtt.state());
      delay(5000);
    }
  }
}

 void simulateSensorData() { 
  moisture = random(30,90) ; //slowly dry out 
  light = random (20 , 80)  ;
  temperature = random(180, 280) / 10.0; 
 }

 void publishdata() { 
  mqtt.publish(moisturetopic , String(moisture).c_str()) ; 
  mqtt.publish(lighttopic , String(light).c_str()) ; 
  mqtt.publish(temperaturetopic , String(temperature).c_str()) ; 

  Serial.print("Moisture: "); Serial.print(moisture);
  Serial.print("%, Light: "); Serial.print(light);
  Serial.print("%, Temp: "); Serial.println(temperature);
 }

void setup() { 
  Serial.begin(115200) ; 
  connectwifi() ; 
  mqtt.setServer(host,1883);

}

void loop() {  
  if (!mqtt.connected()) {
  connectMQTT() ; } 
  mqtt.loop() ;
  // 2. Simulate and publish sensor data every 10 minutes
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish >  120000) {  // chaque 2 minutes 
    simulateSensorData();   // Generate new values
    publishdata();          // Send to MQTT
    lastPublish = millis(); // Reset timer
}
delay(100) ; 
}