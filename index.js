import api from "./api";

const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

const sensors = [
    {
        id: 1,
        data:[]
    },
]

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
    const updateDataArray = req.body.data;

    if (!updateDataArray || !Array.isArray(updateDataArray) || updateDataArray.length === 0) {
        return res.status(400).json({
            error: "Request body must contain a 'data' array with update fields."
        });
    }

    const sensorIndex = sensors.findIndex(sensor => sensor.id === sensorId);

    if (sensorIndex !== -1) {
        sensors[sensorIndex] = {
            ...sensors[sensorIndex],
            data:[...updateDataArray]
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