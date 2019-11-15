import React, { Component } from 'react';
import './Signin.css';
import axios from 'axios';
//import Logo from './logo-light.png';

class SignIn extends Component{
  _isMounted= false;
  constructor(props) {

    super(props);
    this.state = {
        Email: "",
        Password: "",
        validationError: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateAndSignInUser = this.validateAndSignInUser.bind(this);
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
    
    validateAndSignInUser = (values) => {
        const _this = this;                                            /********* */
        const payload = axios.post(`http://localhost:3001/api/auth`, values)
            .then((result) => {
          // Note: Error's "data" is in result.response.data (inside "response")
          // success's "data" is in result.data
          if(_this._isMounted) {
                this.setState({Email: "", Password: ""})
          }
          if (result.response && result.response.status !== 200) {
            //signInUserFailure(result.response.data);
            console.log("error in auth..");
          } else {
              sessionStorage.setItem('jwtToken', result.data.token);    //******************* */
              if(_this._isMounted) {
                  _this.props.OnSuccessSignIn(result.data); 
              }
            }
            
        }).catch(err => {
            console.log(err)
        });
    };

  handleSubmit(event) {
    this.validateAndSignInUser({Email: this.state.Email, Password: this.state.Password});
    event.preventDefault();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
		return (

        <div className="sign-in-container">
            <div className="sign-in-form">
            <h1><span>&nbsp;Log In</span></h1> 
            <h2>To</h2>
             <h1>Library System</h1>
            
            <form onSubmit={this.handleSubmit}>
                <label>
                <div className="form-field sign-in"> 
                Email : 
                <input type="text" name="Email" value={this.state.Email} onChange={this.handleChange}/>
                </div>
                </label>

                <br></br>

                <label>
                <div className="form-field sign-in"> 
                Password : 
                <input type="password" name="Password" value={this.state.Password} onChange={this.handleChange}/>
                </div>
                </label>
                <br></br>
                <input className="btn-medium" type="submit" value="Submit" />
            </form>
            </div>
        </div>
    )
  }
}

export default SignIn;
