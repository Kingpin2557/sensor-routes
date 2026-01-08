import express from "express";
import cors from "cors";

const app = express();
const PORT = 8080;

const allowedOrigin = ['https://cdpn.io', 'http://localhost:5174','https://lego-iot-kit.vercel.app'];
const corsOptions = {
    origin: function (origin, callback) {
        // Toestaan als origin in de lijst staat of als er geen origin is (bijv. lokale tools)
        if (!origin || allowedOrigin.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
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
let pendingWifi = null;


app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Sensor API. Use /sensors for all data.',
        available_routes: ['/sensors (GET)', '/sensor/:id (GET)', '/sensor (POST)', '/sensor/:id (PATCH)','/sensor/:id (DELETE)', '/sensors (DELETE)' , '/wifi (POST)']
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

    if (pendingWifi) {
        newSensor.wifi = { ...pendingWifi };
    }

    sensors.push(newSensor);

    res.status(201).send({
        message: `Sensor ID ${newSensor.id} added successfully.`,
        data: newSensor
    });
})


app.post('/wifi', (req, res) => {
    const { ssid, password } = req.body;

    if (!ssid || !password) {
        return res.status(400).json({ error: "SSID and password are required." });
    }

    pendingWifi = {
        ssid: ssid,
        password: password
    };

    sensors.forEach(sensor => {
        sensor.wifi = { ...pendingWifi };
    });

    res.status(200).json({
        message: "WiFi credentials have been saved",
        wifi: pendingWifi
    });
});


app.get('/wifi', (req, res) => {
    res.status(200).json({
        wifi: pendingWifi
    });
})


app.patch('/sensor/:id', (req, res) => {
    const sensorId = parseInt(req.params.id);

    const sensorIndex = sensors.findIndex(sensor => sensor.id === sensorId);

    if (sensorIndex !== -1) {
        const existingSensor = sensors[sensorIndex];

        if (req.body.wifi) {
            pendingWifi = { ...req.body.wifi };
        }

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

app.delete('/sensors', (req, res) => {
    sensors.splice(0, sensors.length);
    pendingWifi = null;

    res.status(200).json({
        message: 'All sensors deleted successfully.'
    });
})


app.listen(
    PORT,
    () => console.log(`🚀 Server running on http://localhost:${PORT}/sensors`)
);


export default app;
