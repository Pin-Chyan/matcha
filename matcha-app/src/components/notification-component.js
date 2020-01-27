import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import "../styles/overload.css";
import "../styles/helpers.css";
import "../styles/index.css";
import '../../node_modules/font-awesome/css/font-awesome.min.css'; 
import axios from 'axios';
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default class Home extends Component {
    constructor(props){
        super(props);
        this.div_key = Date.now();
        this.jwt = localStorage.token;
        this.ip = require('../server.json').ip;
        this.nll = require("../images/chibi.jpg");
        this.pos = 0;
        this.state = {};
        console.log(this.ip);
        async function server_get(ip,jwt){
            let promise = await axios.post(ip+"/users/getEmail", {} ,{ headers: { authorization: `bearer ${jwt}` } });
            if (promise.status === 200)
                return promise.data;
        }
        server_get(this.ip,this.jwt).then(res => {
            console.log('eve online');
            ///      <<<< begin binding after database online >>>>
            this.globalbtn_handler = this.globalbtn_handler.bind(this);
            this.handleChange = this.handleChange.bind(this);
            this.is_liked = this.is_liked.bind(this);
            this.busy = 0;
            this.curr_page = [0,0,0];
            this.other_page = [0,0,0];
            this.state = {
                "user" : res,
                "checked": false
            }
            if (this.props.location.user){
                this.setState({"user":this.props.location.user});
                this.eve_mount();
            }
            else
                this.userData_getter(0);
        }).catch(err => {console.log('eve redirect' + err)});
    }
    userData_getter(reset){
        console.log('getting data......');
        async function get_data(email,jwt,ip,target){
            console.log(email);
            let promise = await axios.post(ip + '/users/get_spec',{"email":email, "target":target, "token":jwt});
            if (promise.status === 200)
                return promise.data;
        }
        ///      <<<< target will be customised for each page for optimisation >>>>
        get_data(this.state.user.email,this.jwt,this.ip,"name email last bio tag img likes liked viewed").then(userGet_res => {
                this.setState({"user":userGet_res[0]});
                if (reset === 0)
                    this.eve_mount();
        }).catch(err => {console.log('eve redirect' + err)})
    }
    eve_mount(){
        async function get_matches(email,jwt,ip){
            let promise = await axios.post(ip +'/search/test_search', {"email":email, "token":jwt, "search_conditions":[-1,-1,-1,-2,-1,-1,-1],"search_input":"null"})
            if (promise.status === 200){
                return (promise);
            }
        }
        get_matches(this.state.user.email,this.jwt,this.ip).then(res => {
            if (res !== 'no result'){
                console.log('results loaded...');
                this.setState({"results":res.data});
                this.Carousel_handle(this.state.results[0]);
                this.page_handler('found');
            }
        }).catch(err => {console.log('eve redirect' + err)})
    }

///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< Page states >>>>
//

    page_handler(mode){
        if (mode === 'found'){
            var nav_bar = this.nav_constructor();
            if (document.getElementById('navMenu'+this.div_key))
                ReactDOM.render(nav_bar, document.getElementById('navMenu'+this.div_key))
            this.Carousel_handle(this.state.results[0]);
        }
        console.log('render');
        this.userData_getter(1);
    }

///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                      <<<< Page logic >>>>
//

    redirecthandler = e => {
        this.props.history.push({
            pathname:e.target.id,
            user: this.state.user
        });
    }

    searchHandle = e => {
        this.setState({search:e.target.value});
    }
    keyHandle = e => {
        if (e.key == 'Enter'){
            var search_input = 'null';
            if (this.state.search){
                if (this.state.search.trim() != '')
                    search_input = this.state.search;
            }
            this.props.history.push({
                pathname: '/search',
                user: this.state.user,
                search_in: search_input 
            });
        }
    }

    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    handleChange(checked) {
        this.setState({checked})
    }

    is_liked = async() => {
        console.log(this.state.user.likes);
        console.log(this.state.results[this.pos].likes);
        var me = this.state.user.likes;
        var me_id = this.state.user._id;
        var you = this.state.results[this.pos].likes;
        var you_id = this.state.results[this.pos]._id;
        if (me.includes(you_id) && you.includes(me_id))
            return (1);
        else
            return (0);
    }

    globalbtn_handler(e){
        var buttonval = e.target.value;
        async function async_hell(ip,user,target,jwt) {
            var data = {};
            data.img = {};
            data.email = user;
            data.token = jwt;
            data.target = target;
            if (buttonval === 'Prev' || buttonval === 'Next')
                return buttonval === 'Prev' ? 'Prev' : 'Next';
            else if (buttonval === "Like"){
                let req = await axios.post(ip+"/users/like", data);
                if (req.status === 200){
                    if (req.data === "Already Liked!")
                        console.log("Already Liked!");
                    else
                        console.log("liked!");
                }
            }
            else if (buttonval === "Unlike"){
                let req = await axios.post(ip+"/users/Del_like", data);
                if (req.status === 200){
                    if (req.data === "Not Liked")
                        console.log("Not Liked");
                    else
                        console.log("Unliked");
                }
            }
            else if (buttonval === "Report"){
                console.log("reported!");
            }
            else if (buttonval === "Message"){
                return ('redirect');
            }
            else
                console.log("you missed the button!");
        }
        async_hell(this.ip,this.state.user.email,this.jwt,this.state.results[this.pos].email).then( res => {
            if (res === 'Prev' || res === 'Next'){
                if ((this.pos + 1 < this.state.results.length) && (res === 'Next'))
                    this.pos++;
                else if ((this.pos - 1 > -1) && (res === 'Prev'))
                    this.pos--;
                this.Carousel_handle(this.state.results[this.pos]);
                console.log(this.pos);
            } 
            if (res === 'redirect'){
                this.props.history.push({
                    pathname: "/chat/new",
                    user: this.state.user,
                    data: this.state.results[this.pos].email
                })
            }
        });
    }

    Carousel_handle(res){
        console.log(res);
        if (res){
            var carousel_data = {
                "carousel_name":res.name,
                "carousel_last":res.last,
                "carousel_bio":res.bio,
                "carousel_tag":res.tag,
                "carousel_img1":res.img.img1 === 'null' ? this.nll : res.img.img1,
                "carousel_img2":res.img.img2 === 'null' ? this.nll : res.img.img2,
                "carousel_img3":res.img.img3 === 'null' ? this.nll : res.img.img3,
                "carousel_img4":res.img.img4 === 'null' ? this.nll : res.img.img4,
                "carousel_img5":res.img.img5 === 'null' ? this.nll : res.img.img5
            }
            if (document.getElementById('cont' + this.div_key))
                ReactDOM.render(this.mid_constructor(carousel_data), document.getElementById('cont' + this.div_key));
            // var like = this.is_liked(); NOOOOO
            if (document.getElementById('button'+ this.div_key))
                ReactDOM.render(this.button_constructor(1), document.getElementById('button' + this.div_key));
                /////here<><><><><><><><><><><><><><>
        }
    }
    
    render () {
        return (
            <section className="section hero">
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
                        <div id={"navMenu"+this.div_key} className="navbar-menu"></div>
                    </div>
                </nav>
            <div id={"cont"+this.div_key} className="container"></div>
        </section>

        )
    }

    nav_constructor(){
        var element1 = (
            <div className="navbar-end">
                <div className="control is-small has-icons-right search-margin">
                    <input className="input is-hovered is-small is-rounded" type="text" placeholder="Search" onChange={this.searchHandle} onKeyDown={(e) => this.keyHandle(e)}/>
                    <span className="icon is-small is-right">
                        <i className="fa fa-search"></i>
                    </span>
                </div>
                <a className="navbar-item " style={{color:this.state.other_page}} onClick="{}" ><i className="fa fa-inbox"></i></a>
                <a className="navbar-item " style={{color:this.state.other_page}} id='/' onClick={this.redirecthandler}>Home</a>
                <a className="navbar-item " style={{color:this.state.curr_page}} id='/user' onClick={this.redirecthandler}>Profile</a>
                <a className="navbar-item " style={{color:this.state.other_page}} id='/edit' onClick={this.redirecthandler}>Profile Editor</a>
                <a className="navbar-item " style={{color:this.state.other_page}} id='/logout' onClick={this.redirecthandler}>Logout</a>
            </div>
        )
        return(element1);
    }
    mid_constructor(data){
        return (
            <div className="column is-centered shadow">
                <div className="column is-half bg_white_4">
                    <div className="column center">
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src={data.carousel_img1} />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>{data.carousel_name}</strong> <a>{data.carousel_name}_{data.carousel_last}</a><br />
                                        <span className="has-text-grey">User viewed your image<br />
                                        <time>Apr 20</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src={data.carousel_img1} />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>{data.carousel_name}</strong> <a>{data.carousel_name}_{data.carousel_last}</a><br />
                                        <span className="has-text-grey">user liked your image<br />
                                        <time>Apr 20</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src='https://media.discordapp.net/attachments/472313197836107780/553808062780014632/aHbnHYY.png' />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>Megumin</strong> <a>Megumin_Crimson</a><br />
                                        <span className="has-text-grey">user viewed your image<br />
                                        <time>Apr 21</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src='https://imgur.com/TYmZ6H7.png' />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>Remu</strong> <a>Remu_</a><br />
                                        <span className="has-text-grey">user viewed your image<br />
                                        <time>Apr 22</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src='https://imgur.com/H9S37yu.png' />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>Yuno</strong> <a>Yuno_Gasai</a><br />
                                        <span className="has-text-grey">user viewed your image<br />
                                        <time>Apr 24</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src='https://imgur.com/H9S37yu.png' />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>Yuno</strong> <a>Yuno_Gasai</a><br />
                                        <span className="has-text-grey">user liked your image<br />
                                        <time>Apr 24</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src='https://media.discordapp.net/attachments/472313197836107780/571169868276039710/bMKEgh7.png' />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>Zero Two</strong> <a>Zero Two_</a><br />
                                        <span className="has-text-grey">user viewed your image<br />
                                        <time>Apr 26</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src='https://media.discordapp.net/attachments/472313197836107780/584161628447178854/oxjuaWX.png' />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>Rias</strong> <a>Rias_Gremory</a><br />
                                        <span className="has-text-grey">user viewed your image<br />
                                        <time>Apr 26</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                        <article className="media center">
                            <figure className="media-left">
                                <figure className="image is-64x64">
                                    <img className="image is-64x64 m-scale" alt="Asuna" src='https://media.discordapp.net/attachments/472313197836107780/584161628447178854/oxjuaWX.png' />
                                </figure>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong>Rias</strong> <a>Rias_Gremory</a><br />
                                        <span className="has-text-grey">user liked your image<br />
                                        <time>Apr 26</time></span>
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        )
    }
}