import express from "express";
import cors from "cors";

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

app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src 'self' http://localhost:8787; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"
    );
    next();
});


const sensors = [];


app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Sensor API. Use /sensors for all data.',
        available_routes: ['/sensors (GET)', '/sensor/:id (GET)', '/sensor (POST)', '/sensor/:id (PATCH)','/sensor/:id (DELETE)' , '/wifi (PATCH)']
    });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/sensors', (req, res) => {
    res.status(200).send({
        sensors: sensors
    });
});

app.get('/sensor/:id', (req, res) => {
    const sensorId = parseInt(req.params.id);
    const sensor = sensors.find(sensor => sensor.id === sensorId);

    if (sensor) {
        res.status(200).send({
            sensor: sensor
        });
    } else {
        res.status(404).send({
            error: `Sensor with ID ${sensorId} not found.`
        });
    }
})

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

app.patch('/wifi', (req, res) => {
    const { ssid, password } = req.body;

    if (!ssid || !password) {
        return res.status(400).json({ error: "SSID and password are required." });
    }

    // Check if any sensors exist
    if (sensors.length === 0) {
        return res.status(404).json({
            error: "No sensors found. Please connect a sensor before updating WiFi."
        });
    }

    sensors.forEach(sensor => {
        sensor.wifi = { ssid, password };
    });

    res.status(200).json({
        message: `Updated ${sensors.length} sensors.`,
        sensors: sensors
    });
});


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

app.delete('/sensor/:id', (req, res) => {
    const sensorId = parseInt(req.params.id);
    const sensorIndex = sensors.findIndex(sensor => sensor.id === sensorId);

    if (sensorIndex !== -1) {
        sensors.splice(sensorIndex, 1);
        return res.status(200).json({
            message: `Sensor with ID ${sensorId} deleted successfully.`
        });
    } else {
        return res.status(404).json({
            error: `Error: Sensor with ID ${sensorId} not found.`
        });
    }
})


app.listen(
    PORT,
    () => console.log(`🚀 Server running on http://localhost:${PORT}/sensors`)
);


export default app;