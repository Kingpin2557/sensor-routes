import { port } from './process/wifi.js';

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

const allowedOrigin = ['https://cdpn.io', 'http://localhost:5173'];
const corsOptions = {
    origin: allowedOrigin,
    methods: 'GET,POST,PATCH',
    allowedHeaders: 'Content-Type',
};
app.use(cors(corsOptions));


app.use(express.json());


const sensors = [
    {
        id: 1,
        data:[]
    },
]


app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Sensor API. Use /sensors for all data.',
        available_routes: ['/sensors (GET)', '/sensor (POST)', '/sensor/:id (PATCH)']
    });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/sensors', (req, res) => {
    res.status(200).send({
        sensors: sensors
    });
});

app.post('/sensor', (req, res) => {
    const newSensor = req.body;

    if (!newSensor || !newSensor.id) {
        return res.status(400).send({
            error: 'A sensor object with an ID is required in the body.'
        });
    }

    const idExists = sensors.some(sensor => sensor.id === newSensor.id);

    if (idExists) {
        return res.status(400).send({
            error: `Sensor ID ${newSensor.id} already exists.`
        });
    }

    sensors.push(newSensor);

    res.status(201).send({
        message: `Sensor ID ${newSensor.id} added successfully.`,
        data: newSensor
    });
})

app.patch('/sensor/:id', (req, res) => {
    const sensorId = parseInt(req.params.id);

    const sensorIndex = sensors.findIndex(sensor => sensor.id === sensorId);

    if (sensorIndex !== -1) {
        const existingSensor = sensors[sensorIndex];

        sensors[sensorIndex] = {
            ...existingSensor,
            ...req.body
        };

        return res.status(200).json({
            message: `Sensor with ID ${sensorId} patched successfully.`,
            sensor: sensors[sensorIndex]
        });

    } else {
        return res.status(404).json({
            error: `Error: Sensor with ID ${sensorId} not found.`
        });
    }
});

app.post("/wifi", (req, res) => {
    port.write(
        JSON.stringify({
            type: "wifi",
            ssid: req.body.ssid,
            password: req.body.password,
        }) + "\n"
    );

    res.json({ status: "sent" });
});

app.listen(
    PORT,
    () => console.log(`🚀 Server running on http://localhost:${PORT}/sensors`)
);


export default app;