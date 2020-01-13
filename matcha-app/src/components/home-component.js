import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "../styles/overload.css";
import "../styles/helpers.css";
import "../styles/index.css";
import '../../node_modules/font-awesome/css/font-awesome.min.css'; 
import axios from 'axios'; 
// import "../styles/debug.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

var sesh = "lmk310500@gmail.com";
var token = "admin";
var load = require("../images/load.gif");
var load2 = require("../images/load2.gif");
var ip = require("../server.json").ip;
var nll = require("../images/chibi.jpg");

export default class Home extends Component {
    constructor(props){
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.state = {
            name: '',
            last: '',
            display: load,
            bio: '',
            images: [],
            img1: nll,
            img2: nll,
            img3: nll,
            img4: nll,
            img5: nll
        };
    }


    componentDidMount () {
        axios.post(ip+"/users/get_spec", {"email":sesh,"target":"name last bio img","token":token}).then(res => {
            console.log(res);
            if (res.data === "invalid token" || res.data === "token not present"){
                return (window.location.href = ip+"/login");
            }
            else if (res.data[0].name){
                var data = {};
                data.name = res.data[0].name;
                data.last = res.data[0].last;
                data.bio = res.data[0].bio;
                if (res.data[0].img.img1 == 'null'){
                    data.img1 = nll;
                    data.display = nll;
                }
                else{
                    data.img1 = res.data[0].img.img1;
                    data.display = res.data[0].img.img1;
                }
                if (res.data[0].img.img2)
                    data.img2 = nll;
                else
                    data.img2 = res.data[0].img.img2;
                if (res.data[0].img.img3)
                    data.img3 = nll;
                else
                    data.img3 = res.data[0].img.img3;
                if (res.data[0].img.img4)
                    data.img4 = nll;
                else
                    data.img4 = res.data[0].img.img4;
                if (res.data[0].img.img5)
                    data.img5 = nll;
                else
                    data.img5 = res.data[0].img.img5;
                this.setState(data);
            }
        });
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
                <div id="navMenu" className="navbar-menu">
                    <div className="navbar-end">
                        <div className="control is-small has-icons-right search-margin">
                            <input className="input is-hovered is-small is-rounded" type="text" placeholder="Search" />
                            <span className="icon is-small is-right">
                                <i className="fa fa-search"></i>
                            </span>
                        </div>
                        <Link to="/" className="navbar-item has-text-info">Home</Link>
                        <Link to="/user" className="navbar-item has-text-info">Profile</Link>
                        <Link to="/edit" className="navbar-item has-text-info">Profile Editor</Link>
                    </div>
                </div>
            </div>
        </nav>
            <div className="container">
                <div className="columns is-centered shadow">
                    <div className="column is-half bg_white_1">
                        <figure class="image"> {/* is-3by4 */}
                            <Carousel autoPlay className="image img_carousel">
                                <div>
                                    <img alt="image 1" className="m_image" src={this.state.img1} />
                                    <p className="legend">Legend 1</p>
                                </div>
                                <div>
                                    <img alt="image 2" className="m_image" src={this.state.img2} />
                                    <p className="legend">Legend 2</p>
                                </div>
                                <div>
                                    <img alt="image 3" className="m_image" src={this.state.img3} />
                                    <p className="legend">Legend 3</p>
                                </div>
                                <div>
                                    <img alt="image 4" className="m_image" src={this.state.img4} />
                                    <p className="legend">Legend 4</p>
                                </div>
                                <div>
                                    <img alt="image 5" className="m_image" src={this.state.img5} />
                                    <p className="legend">Legend 5</p>
                                </div>
                            </Carousel>
                        </figure>
                        <div className="column center_b">
                        <p>
                            <button className="button is-warning">
                                <span className="icon">
                                    <i className="fa fa-arrow-left"></i>
                                </span>
                            </button>
                            <button className="button is-danger">
                                <span className="icon">
                                    <i className="fa fa-times"></i>
                                </span>
                            </button>
                            <button className="button is-primary">
                                <span className="icon is-small">
                                    <i className="fa fa-star"></i>
                                </span>
                            </button>
                            <button className="button is-success">
                                <span className="icon is-small">
                                    <i className="fa fa-heart"></i>
                                </span>
                            </button>
                            <button className="button is-hovered">
                                <span className="icon is-small">
                                    <i className="fa fa-exclamation"></i>
                                </span>
                            </button>
                        </p>
                    </div>
    
                        <div className="column center">
                        <div className="column center">
                <article className="media center">
                    <figure className="media-left">
                        <figure className="image is-64x64">
                            <img alt="Asuna" src={this.state.display} />
                        </figure>
                    </figure>
                    <div className="media-content">
                        <div className="content">
                            <p>
                                <strong>{this.state.name}</strong> <a>{this.state.name}_{this.state.last}</a><br />
                                <span className="has-text-grey">{this.state.tags}<br />
                                <time datetime="2018-04-20">Apr 20</time> · 20 min read</span>
                            </p>
                        </div>
                    </div>
                </article>
                <br />
                <hr />
                {/* <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi eveniet neque dignissimos aperiam nemo quas mollitia aspernatur quis alias, odit veniam necessitatibus pariatur recusandae libero placeat magnam voluptas. Odio, in.
                </p> */}
                <p>
                    {this.state.bio}
                </p>
            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </section>

        )
    }
}
