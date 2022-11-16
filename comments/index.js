const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments' , (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comment = {
        id: commentId,
        content, 
        status: 'pending'
    }

    const comments = commentsByPostId[req.params.id] || []; // get all comments with post id.

    comments.push(comment); //  push the new comment into the comments array.

    commentsByPostId[req.params.id] = comments;  // assign back the updated comments array back to the commentsByPostId object

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            ...comment,
            postId: req.params.id,
        }
    }).catch((err) => {
        console.log(err.message);
    });
    
    res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
    console.log('Event Received', req.body.type);

    const { type, data } = req.body;

    if(type === 'CommentModerated') {

        const { postId, id, status, content } = data;

        const comments = commentsByPostId[postId];

        const comment = comments.find(comment => {
            return comment.id === id;
        });

        comment.status = status;

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
               ...data
            }
        });
        // console.log(data);
    };

    res.send({});
});


app.listen(4001, () => {
    console.log('Listening on port 4001');
})