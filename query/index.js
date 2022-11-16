const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});

const handleEvent = (type, data) => {
    if(type === 'PostCreated') {
        const { id, title } = data;
        
        posts[id] = { id, title, comments: [] };

    };

    if(type === 'CommentCreated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        post.comments.push({ id, content, status })
    };


    if(type === 'CommentUpdated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        const comment = post.comments.find(comment => {
            return comment.id === id;
        });

        comment.status = status;
        comment.content = content;
    };
};


app.post('/events', (req, res) => {
    
    console.log('Event Received', req.body.type);
    
    const { type, data } = req.body;

    handleEvent(type, data);


    res.send({});
});

app.listen(4003, async () => {
    console.log('Listening on 4003');

    try {
        const res = await axios.get('http://event-bus-srv:4005/events');
        
        res.data.forEach(event => {
            console.log('Processing event:', event.type);
            handleEvent(event.type, event.data);
        })
        
    } catch (error) {
        console.log(error.message);
    }
});

