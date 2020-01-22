import React, { Component } from 'react';
import ReactHtmlParser from 'react-html-parser';
import ReactDOM from 'react-dom'
import "../styles/overload.css";
import "../styles/helpers.css";
import "../styles/index.css";
import axios from 'axios'; 
import '../../node_modules/font-awesome/css/font-awesome.min.css';

var load2 = require("../images/load2.gif");
var load3 = require("../images/scifi.gif");
var nll = require("../images/chibi.jpg");
var sec = require("../images/check.jpg");

//[1,-1,-2,-2,10,-1,-1] search conditions
export default class User extends Component {


///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< eve protocol >>>>
//

    constructor(props){
        super(props);
        this.div_key = Date.now();
        this.jwt = localStorage.token;
        this.ip = require('../server.json').ip;
        this.state = {};
        console.log(this.ip);
        async function server_get(ip,jwt){
            let promise = await axios.post(ip+"/users/getEmail", {} ,{ headers: { authorization: `bearer ${jwt}` } });
            if (promise.status === 200)
                return promise.data;
        }
        server_get(this.ip,this.jwt).then(res => {
            console.log('eve online');
            ///////////////////////////////////////////////////////////
            //      <<<< begin binding after database online >>>>
            this.eve_mount = this.eve_mount.bind(this);
            this.userData_getter = this.userData_getter.bind(this);
            this.page_handler = this.page_handler.bind(this);
            this.searchHandle = this.searchHandle.bind(this);
            this.searcher = this.searcher.bind(this);
            this.busy = 0;
            this.state = {
                "res" : '',
                "html" : '',
                "user" : res
            };
            if (this.props.location.user){
                this.setState({"user":this.props.location.user});
                this.eve_mount();
            } else
                this.userData_getter();
        }).catch(err => {console.log('eve redirect')});
    }
    userData_getter(){
        console.log('getting data......');
        async function get_data(email,jwt,ip,target){
            console.log(email);
            let promise = await axios.post(ip + '/users/get_spec',{"email":email, "target":target}, { headers: { authorization: `bearer ${jwt}` } });
            if (promise.status === 200)
                return promise.data;
        }
        ///      <<<< target will be customised for each page for optimisation >>>>
        get_data(this.state.user.email,this.jwt,this.ip,"name email last bio tag img").then(userGet_res => {
                this.setState({"user":userGet_res[0]});
                this.eve_mount();
        }).catch(err => {console.log('eve redirect')})
    }
    eve_mount() {
        console.log('render');
        this.internal_color = [15,14,14];
        this.state.res = '';
        this.state.links = 'rgb(50, 170, 225)';
        if (this.props.location.search_in && this.props.location.search_in !== 'null'){
            this.setState({"search":this.props.location.data});
            this.searcher();
        } else
            this.page_handler('init',{});
    }


///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< Page states >>>>
//

page_handler(mode, data){
    console.log(window.innerHeight);
    var div_onload = (<div className="columns is-centered shadow"><div className="column bg_white_2"><div onClick={e => this.listener(e)} id={"result"+this.div_key}></div></div></div>);
    var div_load = (<div><img src={load3}></img></div>);
    var cont_div = 'cont' + this.div_key;
    var menu_div = 'navMenu' + this.div_key;
    var res_div = 'result' + this.div_key;
    if (mode == 'loaded'){
        console.log(mode);
        this.rgb_phaser([15,14,14,1,0],'internal_color','res');
        if (document.getElementById(cont_div))
            ReactDOM.render(div_onload, document.getElementById(cont_div));
        if (document.getElementById(menu_div))
            ReactDOM.render(this.nav_constructor(1), document.getElementById(menu_div));
        var column = window.innerWidth > 1400 ? 3 : 2;
        var row = Math.ceil(data.length/column);
        var head = this.header_constructor("Here you go");
        var body = this.row_constructor(row,column,data,1);
        var result = head.concat(body);
        if (document.getElementById(res_div))
            ReactDOM.render(ReactHtmlParser(result), document.getElementById(res_div));
    }
    else if (mode === 'searching'){
        console.log(mode);
        this.rgb_phaser([0,0,0,1,2],'internal_color','res');
        this.sleep(3).then(() => {
            if (document.getElementById(cont_div))
                ReactDOM.render(div_load, document.getElementById(cont_div));
            if (document.getElementById(menu_div))
                ReactDOM.render(this.nav_constructor(2), document.getElementById(menu_div));              
            var head = this.header_constructor("Senpais are searching");
            var body = this.row_constructor(1,1,[{"name":"Give them a sec","img":{"img1":load3}}],0);
            var result = head.concat(body);
        });
    }
    else if (mode == 'init'){
        console.log(mode);
        ReactDOM.render(this.nav_constructor(1), document.getElementById(menu_div));
        if (document.getElementById(cont_div))
            ReactDOM.render(div_onload, document.getElementById(cont_div));
        if (document.getElementById(menu_div))
            ReactDOM.render(this.nav_constructor(1), document.getElementById(menu_div));
        var head = this.header_constructor("Whatcha waiting for");
        var body = this.row_constructor(1,1,[{"name":"type in search bar and press enter to search","img":{"img1":load2}}],0);
        var result = head.concat(body);
        if (document.getElementById(res_div))
            ReactDOM.render(ReactHtmlParser(result), document.getElementById(res_div));
    }
    else if (mode == 'no_res'){
        console.log(mode);
        this.rgb_phaser([15,14,14,1,0],'internal_color','res');
        if (document.getElementById(cont_div))
            ReactDOM.render(div_onload, document.getElementById(cont_div));
        if (document.getElementById(menu_div))
            ReactDOM.render(this.nav_constructor(1), document.getElementById(menu_div));
        var head = this.header_constructor("Cannot Notice senpai");
        var body = this.row_constructor(1,1,[{"name":"try another term to find senpai's","img":{"img1":nll}}],0);
        var result = head.concat(body);
        if (document.getElementById(res_div))
            ReactDOM.render(ReactHtmlParser(result), document.getElementById(res_div));

    }
    else if (mode == 'no_term'){
        console.log(mode);
        if (document.getElementById(cont_div))
            ReactDOM.render(div_onload, document.getElementById(cont_div));
        var head = this.header_constructor("gomenasai");
        var body = this.row_constructor(1,1,[{"name":"cannot find nobody","img":{"img1":nll}}],0);
        var result = head.concat(body);
        if (document.getElementById(res_div))
            ReactDOM.render(ReactHtmlParser(result), document.getElementById(res_div));
        this.sleep(1500).then(() => {
            this.page_handler('init',{});
        })
    }
    else if (mode == 'nice_try'){
        console.log(mode);
        if (document.getElementById(cont_div))
            ReactDOM.render(div_onload, document.getElementById(cont_div));
        var head = this.header_constructor("Sorry dear user");
        var body = this.row_constructor(1,1,[{"name":"But you appear to have been Reckt","img":{"img1":sec}}],0);
        var result = head.concat(body);
        if (document.getElementById(res_div))
            ReactDOM.render(ReactHtmlParser(result), document.getElementById(res_div));
        this.sleep(3000).then(() => {
            this.page_handler('init',{});
        })
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< Page logic >>>>
//

    listener = e => {
        console.log("fuck");
    }
    butt_listener = e => {
        console.log("fuck");
    }

    //      <<<< Page routers

    redirecthandler = e => {
        // console.log(e.target.id);
        this.props.history.push({
            pathname:e.target.id,
            user: this.state.user
        });
    }
    //      the end >>>>


    //      <<<< search functions
    searchHandle = (e) => {
        this.setState({search:e.target.value});
    }
    keyHandle = e => {
        if (e.key === 'Enter'){
            this.searcher();
        }
    }
    searcher(){
        if (this.busy === 0){
            this.busy = 1;
            this.page_handler('searching',{});
        }
    }
    //      end >>>>


    //      <<<< RGB controlers
    rgb_phaser = (altitude,target,state_target) => {
        if (   this[target][0] != altitude[0] 
            || this[target][1] != altitude[1]
            || this[target][2] != altitude[2] ){
            if (this[target][0] != altitude[0]){
                if (this.toPos(this[target][0] - altitude[0]) < altitude[3])
                    this[target][0] = altitude[0];
                else
                    this[target][0] += this[target][0] > altitude[0] ? -1 * altitude[3] : 1 * altitude[3];
            }
            if (this[target][1] != altitude[1]){
                if (this.toPos(this[target][1] - altitude[1]) < altitude[3])
                    this[target][1] = altitude[1];
                else
                    this[target][1] += this[target][1] > altitude[1] ? -1 * altitude[3] : 1 * altitude[3];
            }
            if (this[target][2] != altitude[2]){
                if (this.toPos(this[target][2] - altitude[2]) < altitude[3])
                    this[target][2] = altitude[2];
                else
                    this[target][2] += this[target][2] > altitude[2] ? -1 * altitude[3] : 1* altitude[3];
            }
            altitude[3] += altitude[4];
            this.setState({[state_target]:"rgb(" + this[target][0] + ", " + this[target][1] +", " + this[target][2] + ")"});
            this.sleep(20).then(() => {
                this.rgb_phaser(altitude,target,state_target);
            });
        } else
            console.log("set " + target + " result posted to this.state." + state_target);
    }
    toPos(num){
        if (num < 0)
            return (num * -1);
        else
            return (num);
    }
    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    //      end >>>>

///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< Render Return >>>>
//

    render () {
        return (
        <section className="section hero" style={{backgroundColor: this.state.res,height: window.innerHeight+"px"}}>
        <nav className="navbar hero-head">
            <div className="container">
                <div className="navbar-brand">
                    <figure className="navbar-item image">
                        <img src={require('../images/logo.png')} className="logo_use" alt="Why is this logo broken"/>
                    </figure>
                    <span className="navbar-burger burger" data-target="navMenu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
                    <div id={"navMenu"+this.div_key} className="navbar-menu">{this.state.navmenu}</div>
            </div>
        </nav>
            <div id={"cont"+this.div_key} className="container" >
            </div>
        </section>

        )
    }

//////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< Contructor functions >>>>
//

    nav_constructor(render){
        var element1 = (
            <div  className="navbar-end">
                <div className="control is-small has-icons-right search-margin" >
                    <input id="in" className="input is-hovered is-small is-rounded" type="text" placeholder="Search" onChange={this.searchHandle} onKeyDown={(e) => this.keyHandle(e)}/>
                        <span id="span" className="icon is-small is-right" >
                            <i id="image" className="fa fa-search"></i>
                        </span>
                </div>
                <a className="navbar-item " style={{color:this.state.links}}  id='/' onClick={this.redirecthandler}>Home</a>
                <a className="navbar-item " style={{color:this.state.links}}  id='/user' onClick={this.redirecthandler}>Profile</a>
                <a className="navbar-item " style={{color:this.state.links}}  id='/edit' onClick={this.redirecthandler}>Profile Editor</a>
                <a className="navbar-item " style={{color:this.state.links}}  id='/logout' onClick={this.redirecthandler}>Logout</a>
            </div>
        )
        var element2 = (
            <div  className="navbar-end">
            <div className="control is-small has-icons-right search-margin" ></div>
            <a className="navbar-item " style={{color:this.state.links}}  id='/' onClick={this.redirecthandler}>Home</a>
            <a className="navbar-item " style={{color:this.state.links}}  id='/user' onClick={this.redirecthandler}>Profile</a>
            <a className="navbar-item " style={{color:this.state.links}}  id='/edit' onClick={this.redirecthandler}>Profile Editor</a>
            <a className="navbar-item " style={{color:this.state.links}}  id='/logout' onClick={this.redirecthandler}>Logout</a>
        </div>
        )
        console.log(this.state.links);
        if (render){
            if (render == 1)
                return element1;
            else
                return element2;
        }
        else
            return <div/>;
    }
    header_constructor(heading){
        var start = '<div class="tile is-ancestor"><div class="tile is-parent"><article class="tile is-child box"><p class="title center_b">';
        var header = '<p class="title center_b">' + heading + '</p></article></div></div>';
        return start + header;
    }
    column_constructor(name, image , button, id){
        var article = ['<div class="tile is-parent" style="width=800px "><article class="tile is-child box">','</article></div>'];
        var name_tag = '<h1 class="center_b">' + name + '</h1>';
        var img_tag = '<figure class="image is-3by4"><img class="overflow" src=' + image + ' alt="Asuna_img" /></figure>';
        if (button === 1){
            var res = article[0] + name_tag + img_tag + this.button_constructor() + article[1];
        }
        else
            var res = article[0] + name_tag + img_tag + article[1];
        return(res);
    }
    button_constructor(){
        var className = '"button is-warning is-rounded"';
        return ('<button class=' + className + '>like</button><button class=' + className + '>dislike</button><button class=' + className + '>report</button>');
    }
    row_constructor(rows, columns, data, button){
        var i = 0;
        var divs = "";
        var temp = "";
        var res = "";
        var j = 0;
        var data_pos = 0;
        var max = data.length;
        var image;
        while (j < rows){
            res += '<div class="tile is-ancestor">';
            while (i < columns && data_pos < max){
                if (data[data_pos].img.img1 == 'null')
                    image = nll;
                else
                    image = data[data_pos].img.img1;
                temp = this.column_constructor(data[data_pos].name , image, button);
                res += divs.concat(temp);
                i++;
                data_pos++;
            }
            divs = "";
            i = 0;
            res += '</div>';
            j++;
        }
        return(res);
    }
}