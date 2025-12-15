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

// app.patch('/sensor/:id', (req, res) => {
//     const sensorId = parseInt(req.params.id);
//     const updateDataArray = req.body.data;
//
//     if (Object.keys(req.body).length === 0) {
//         return res.status(400).json({ error: "Request body must contain fields to update." });
//     }
//
//     const sensorIndex = sensors.findIndex(sensor => sensor.id === sensorId);
//
//     if (sensorIndex !== -1) {
//         sensors[sensorIndex] = {
//             ...sensors[sensorIndex],
//             data:[...updateDataArray],
//             userConfig: req.body.userConfig
//         };
//
//         return res.status(200).json({
//             message: `Sensor with ID ${sensorId} patched successfully.`,
//             sensor: sensors[sensorIndex]
//         });
//
//     } else {
//         return res.status(404).json({
//             error: `Error: Sensor with ID ${sensorId} not found.`
//         });
//     }
// });

app.patch('/sensor/:id', (req, res) => {
    const sensorId = parseInt(req.params.id);

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body must contain fields to update." });
    }

    const sensorIndex = sensors.findIndex(sensor => sensor.id === sensorId);

    if (sensorIndex !== -1) {
        const existingSensor = sensors[sensorIndex];
        let updatedSensor = { ...existingSensor };

        if (req.body.data) {
            updatedSensor.data = [...req.body.data];
        }

        if (req.body.userConfig) {
            updatedSensor.userConfig = req.body.userConfig;
        }


        updatedSensor = {
            ...updatedSensor,
            ...req.body
        }

        delete updatedSensor.data;
        delete updatedSensor.userConfig;

        updatedSensor.data = req.body.data ? [...req.body.data] : existingSensor.data;
        updatedSensor.userConfig = req.body.userConfig !== undefined ? req.body.userConfig : existingSensor.userConfig;

        sensors[sensorIndex] = {
            ...existingSensor,
            ...req.body,

            userConfig: req.body.userConfig !== undefined
                ? req.body.userConfig
                : existingSensor.userConfig
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

app.listen(
    PORT,
    () => console.log(`🚀 Server running on http://localhost:${PORT}/sensors`)
);


export default app;