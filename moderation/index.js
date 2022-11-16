const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    
    if(type === 'CommentCreated') {

        const status = data.content.includes('orange') ? 'rejected' : 'approved';
        const { postId, id, content } = data;

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
            data: {
               ...data,
               status
            }
        }).catch((err) => {
            console.log(err.message);
        });
    };

    res.send({});
});

app.listen(4002, () => {
    console.log('Listening on 4002');
});

