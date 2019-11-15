import React, { Component } from 'react';
import axios from 'axios';
import SignIn from '../Signin/Signin';
import './Home.css';
import MyProfile from '../myProfile/myProfile';
import SearchBooks from '../books/books';
import AddBook from '../addBooks/addBooks';
import SearchUsers from '../users/users';
import AddUser from '../addUsers/addUsers';
import Favorites from '../favorites/favorites';
import Logo from './logo.jpg';

class Home extends Component{
    constructor(props) {
      super(props);
      this.state = {
          user: {},
             isAuth: false,
             isAdmin: false,
        selectedTab : 1
      };
      this.validateToken = this.validateToken.bind(this);
      this.handleLogOut = this.handleLogOut.bind(this);
      this.handleSuccessSignIn = this.handleSuccessSignIn.bind(this);
      this.changeTab = this.changeTab.bind(this);
    }
    validateToken = (token) => {
      const _this = this;
      const payload = axios.post(`http://localhost:3001/api/authWithToken`, token)
          .then((result) => {
        if (result.response && result.response.status !== 200) {
          console.log("error in auth");
        } else {
            sessionStorage.setItem('jwtToken', result.data.token);
            _this.handleSuccessSignIn(result.data);
          }
      }).catch(err => {
          console.log(err)
      });
    };
    componentDidMount() {
        var token = sessionStorage.jwtToken;
        if(token) {
            this.validateToken({token: token});
        }
    }
    handleSuccessSignIn(data) {
        this.setState({user: data.user, isAdmin: data.user.isAdmin, isAuth: true});
    }
    handleLogOut() {
        this.setState({user:{}, isAdmin:false, isAuth:false});
        sessionStorage.jwtToken = '';
        console.log("logout successful!");
    }
    changeTab(event) {
      var prevtab = document.getElementById("tab-"+this.state.selectedTab);
      prevtab.classList.remove("selected-tab");
      this.setState({selectedTab: parseInt(event.target.id.substr(4, 1))})
      event.target.classList.add("selected-tab");
    }
    render() {
            if(!this.state.isAuth) {
              return (
                  <SignIn OnSuccessSignIn={this.handleSuccessSignIn}/>
              )
          } else {
          
        return (
          <div>
            <div className = "header">

              <div className="hello"><p className="X">Hello {" " + this.state.user.firstName + " " + this.state.user.lastName} !!</p></div>
              
                <button className="btn-medium" onClick={this.handleLogOut}>Log Out</button>
             </div>
              <div className="header-tabs">
              <div className="tab-btn-retro selected-tab" id="tab-1" onClick={this.changeTab}>Home</div>
              <div className="tab-btn-retro" id="tab-2" onClick={this.changeTab}>Books</div>
              <div className="tab-btn-retro" id="tab-3" onClick={this.changeTab}>Users</div>
              <div className="tab-btn-retro" id="tab-4" onClick={this.changeTab}>Favorites</div>
              <div className="tab-btn-retro" id="tab-5" onClick={this.changeTab}>My Profile</div>
             </div>

              <div className="main-page">
              {
                this.state.selectedTab === 1 &&
                (
                  <div className="tab-div">
                    <div><img className="img" src={Logo}></img> </div>
                    <div>
                      <h2><strong>Welcome to eLIBRARY</strong></h2>
                      <p>Its main features are as follows</p>
                      <ul>
                          <li>
                            <h4>Users can <strong>SEARCH</strong> books and ADD a book to his/her favorite list.</h4>
                          </li>
                          <li>
                          <h4>Users can also <strong>SEARCH</strong> for any other user present in the system.</h4>
                          </li>
                          <li>
                          <h4>Users can <strong>DELETE</strong> a book from his/her favorite list.</h4>
                          </li>
                          <li>
                          <h4>Users can <strong>UPDATE</strong> their profile information.</h4>
                          </li>
                          <li>
                          <h4>The Admins of the system have been given extra functionalities from the normal ones.
                            i.e To <strong>ADD</strong> new books to the system, To <strong>ADD</strong> new users to the system</h4>
                          </li>
                      </ul>
                      </div>
                  </div>
                )
              }
              {
                this.state.selectedTab === 2 && 
                (
                  <div className="tab-div"> 
                    {/*<MyIssues user={this.state.user}></MyIssues>
                    <RaiseIssue/> */}
                    
                    <SearchBooks user={this.state.user}/>
                    {this.state.user.isAdmin && <AddBook />}
                  </div>
                )
              }
              {
                this.state.selectedTab === 3 && 
                (
                  <div className="tab-div"> 

                  <SearchUsers />
                  {this.state.user.isAdmin && <AddUser />}       
                  </div>
                )
              }

              {
                this.state.selectedTab === 4 && 
                (
                  <div className="tab-div"> 
                  {/*{this.state.user.isAdmin && <CreateNotice/>}
                  <Notices user={this.state.user}></Notices> */}
                  
                  {/*console.log("Home: ", this.state.user)*/}
                  <Favorites user={this.state.user} />
                  </div>
                )
              }
              {
              this.state.selectedTab === 5 && 
                (
                  <div className="tab-div"> 
                  <MyProfile user={this.state.user} callback={this.handleLogOut}/>
                  </div>
                )
              }
              </div>                      
          </div>
  
              )
          }
    }
  }
  
  export default Home;
  
