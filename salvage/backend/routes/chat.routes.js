const router = require('express').Router();
let ChatModels = require('../models/chats.models.js');
let UserModels = require('../models/user.models.js');
///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< Message Routes >>>>
//

function push_id(id, target_id){
    UserModels.findOne({"_id":id}, "chatrooms").exec().then(res => {
        var array = res.chatrooms;
        if (array.includes(target_id))
            console.log("already included");
        else {
            array.push(target_id);
            res.chatrooms = array;
            res.save().then( () => console.log("Id saved to chatrooms"));
        }
    })
}

router.route('/newroom').post( (req, res) => {
    if (!req.body.token || !req.body.email || !req.body.id1 || !req.body.id2)
        res.status(400).send('empty fields');
    else {
        UserModels.find({"email":req.body.email},"token").then(auth => {
            if ((req.body.token !== "admin") && (req.body.token !== auth[0].token))
                res.status(400).send('forbidden');
            else {
                ChatModels.find({ $or:[
                    { "_id1" : req.body.id1 , "_id2" : req.body.id2},
                    { "_id2" : req.body.id1 , "_id1" : req.body.id2}
                ]}, "messages" ).then(ret => {
                    if (ret[0])
                        res.json(ret[0]._id);
                    else {
                        push_id(req.body.id1, req.body.id2);
                        push_id(req.body.id2, req.body.id1);
                        const _id1 = req.body.id1;
                        const _id2 = req.body.id2;
                        const newChat = new ChatModels({
                            _id1,
                            _id2
                        });
                        newChat.save().then( () => res.json(newChat) )
                        .catch( err => res.status(500).json('Error: ' + err));
                    }
                });
            }
        }).catch(err => {res.status(500).send('error')})
    }
})

function notification_handle(req, check, sender){
    UserModels.findOne({"email": req.body.target}).exec().then(docs => {
        if(check === "message"){
            var user = docs;
            const msg = "You have a new message from "+sender+", how exciting!";
            const NewNotify = { message: msg, viewed: false }
            user.notifications.push(NewNotify);
            docs = user;
            docs.save().catch(err => {console.log(err)});
        }
        else
            console.log("error");
    }).catch(err => {console.log(err)})
}

router.route('/msg').post( (req, res) => {
    if (!req.body.token || !req.body.email || !req.body.msg || !req.body.room)
        res.status(400).send('empty fields');
    else {
        UserModels.find({"email":req.body.email},"token name last").then(auth => {
            if ((req.body.token !== "admin") && (req.body.token !== auth[0].token))
                res.status(400).send('forbidden');
            else {
                ChatModels.findOne({"_id":req.body.room}, "message").exec().then(ret => {
                    if (ret){
                        var sender = auth[0].name+" "+auth[0].last;
                        notification_handle(req, "message", sender);
                        var what = ret.message;
                        var msg = {};
                        var d = new Date();
                        msg.author = req.body.email;
                        msg.target = "there is actually no need for a target here (hurusai)";
                        msg.timestamp = "["+d.toLocaleString("en-GB")+"]";
                        msg.msg = ": "+req.body.msg;
                        what.push(msg);
                        ret.message = what;
                        ret.save().then(r => {res.json("saved");console.log('saved')}).catch(err => {res.json(err)});
                    }
                    else {
                        res.json("well shit");
                    }
                }).catch(err => {res.status(500).send('error')})
            }
        }).catch(err => {res.status(500).send('error')})
    }
})

router.route('/get_msg').post( (req, res) => {
    UserModels.findOne({'email':req.body.target},"_id").exec().then(target => {
        if (!target)
            res.status(500).send('error');
        else
            UserModels.findOne({'email':req.body.email},"_id token").exec().then(doc => {
                if (req.body.token === "admin" || doc.token === req.body.token) {
                    ChatModels.findOne({ $or:[
                        { _id1 : doc._id , _id2 : target._id},
                        { _id2 : doc._id , _id1 : target._id}
                    ]}, "message").exec().then(ret => {
                        res.json(ret);
                    })
                }
                else
                    res.status(402).send('forbidden');
            })
    }).catch(err => {res.status(500).send('error')})
})

router.route('/del_chatroom').post( (req, res) => {
    UserModels.findOne({'email':req.body.email},"_id").exec().then(doc => {
        UserModels.findOne({'email':req.body.target}, "_id").exec().then(ret => {
            if (req.body.token === "admin"){
                pop_id(req.body.target, doc._id);
                pop_id(req.body.email, ret._id);
                ChatModels.findOneAndDelete({ $or:[
                        { _id1 : doc._id , _id2 : ret._id},
                        { _id2 : doc._id , _id1 : ret._id}
                ]}).exec().then(sys => {
                    if (!sys)
                        res.json("chatroom doesn't exist");
                    res.json('chatroom deleted');
                })
            } 
            else
                res.json("Forbbiden");
        });
    }).catch(err => {res.json(err)})
})

router.route('/msg_del').post( (req, res) => {
    if (!req.body.token && req.body.target && req.body.timestamp && req.body.notify)
        req.json("error");
    UserModels.findOne({'email':req.body.email},"token _id").exec().then(doc => {
        if (req.body.token == "admin" || doc.token == req.body.token) {
            UserModels.findOne({'email':req.body.target}, "_id").exec().then(ret => {
                ChatModels.findOne({ $or:[
                    { _id1 : doc._id , _id2 : ret._id},
                    { _id2 : doc._id , _id1 : ret._id}
                ]}, "message").exec().then(ret => {
                var pos = ret.message.findIndex(function (res){return res.timestamp === req.body.timestamp});
                if (pos == -1){
                    res.json("Error with position");
                }
                else {
                    var msg = ret.message;
                    msg.splice(pos, 1);
                    ret.message = msg;
                    ret.save().then(r => {res.json("msg deleted")}).catch(err => {res.json(err)});
                }
            })
        })
        }
        else
            res.json("error");
    }).catch(err => {res.json(err)})
})

function pop_id(email, target_id){
    UserModels.findOne({"_id":email}, "chatrooms").exec().then(res => {
        var array = res.chatrooms;
        if (array.includes(target_id)){
            var pos = array.indexOf(target_id);
            if (pos === -1)
                console.log("id not found in array");
            else {
                array.splice(pos, 1);
                res.chatrooms = array;
                res.save().then( () => console.log("id removed"));
            }
        }
        else 
            console.log("error");
    })
}
module.exports = router;