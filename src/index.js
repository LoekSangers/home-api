const mqtt = require('mqtt')
const client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}`)

client.on('connect', function () {
    client.subscribe('homeassistant/#', function (err) {

        if (err) {
            throw new Error(`Could not subscribe to homeassistant topic`)
        }
        console.log('Connected to homeassistant topic')
    })

    client.subscribe('home-api/#', function (err) {

        if (err) {
            throw new Error(`Could not subscribe to home-api topic`)
        }
        console.log('Connected to home-api topic')
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(topic, message.toString())

    topic_parts = topic.split('/')
                

    switch (topic_parts[0]) {

        case 'home-api':
            message = JSON.parse(message)
            base = 'homeassistant/' + message.type + '/' + message.id

            switch (topic_parts[1]) {
                case 'setup':
                    switch (topic_parts[2]) {
                        case 'rgb_light':
                            client.publish(base + '/config', JSON.stringify({
                                "~": base,
                                "name": message.name,
                                "unique_id": message.id,
                                "cmd_t": "~/set",
                                "stat_t": "~/state",
                                "schema": "json",
                                "brightness": true,
                                "color_temp": true,
                                "rgb": true,
                                "white_value": true,
                                "device": {
                                    "identifiers": [message.id],
                                    "name": message.name,
                                    "via_device": "Home API"
                                }
                            }))
                            break
                        default:
                            console.log('unknown device for setup on topic: ' + topic)

                    }
                    break
                case 'remove':
                    client.publish(base + '/config', '', {retain: true})
                    break
            }
            break
        case 'homeassistant':
            if(topic_parts[topic_parts.length - 1] === 'set')
            {// echoes back the state as if it did a succesfull update
                topic_parts[topic_parts.length - 1] = 'state'
                client.publish(topic_parts.join('/'), message)
            }
            //TODO do home assistant things --> as in controlling the lights xD
            break
        default:
            console.log('unknown topic: ' + topic)
            break
    }
})