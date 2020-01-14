const router = require('express').Router();
let ChatModels = require('../models/chats.models.js');
let UserModels = require('../models/user.models.js');


router.route('/newroom').post( (req, res) => {
    UserModels.findOne({'email':req.body.email}, "_id token").exec().then(doc => {
        if (doc.token == "admin" || doc.token == req.body.token){
            UserModels.findOne({'email':doc.body.target}, "_id").exec().then(data => {
                const _id1 = doc._id;
                const _id2 = data._id;
                const message = req.body.message;
            
                const newChat = new ChatModels({
                    _id1,
                    _id2,
                    message
                });
            
                newChat.save().then( () => res.json('Chatroom created') )
                .catch( err => res.status(400).json('Error: ' + err));
            });
        }
        res.json("done first!");
    })
})

router.route('/msg').post( (req, res) => {
    if (!req.body.token && req.body.target && req.body.msg)
        req.json("error");
    ChatModels.find({'email':req.body.email},"token").exec().then(doc => {
        if (req.body.token == "admin" || doc.token == req.body.token) {
            ChatModels.findOne({'email':req.body.target}, "msg").exec().then(ret => {
                console.log(ret);
                var msg = ret.msg;
                var d = new Date(1432851021000);
                msg.push("["+d.toLocaleString("en-GB")+"] "+req.body.msg);
                ret.msg = msg;
                console.log(msg);
                ret.save().then(r => {res.json("saved")}).catch(err => {res.json(err)});
            })
        }
        else
            res.json("error");
    }).catch(err => {res.json(err)})
})

router.route('/msg_del').post( (req, res) => {
    if (!req.body.token && req.body.target && req.body.msg && req.body.notify)
        req.json("error");
    ChatModels.find({'email':req.body.email},"token").exec().then(doc => {
        if (req.body.token == "admin" || doc.token == req.body.token) {
            ChatModels.findOne({'email':req.body.target}, "msg").exec().then(ret => {
                console.log(ret);
                var pos = ret.msg.findIndex(function (res){return res === req.body.msg});
                var msg = ret.msg;
                msg.splice(pos, 1, "Message Deleted!");
                ret.msg= msg;
                console.log(msg);
                ret.save().then(r => {res.json("saved")}).catch(err => {res.json(err)});
            })
        }
        else
            res.json("error");
    }).catch(err => {res.json(err)})
})

module.exports = router;