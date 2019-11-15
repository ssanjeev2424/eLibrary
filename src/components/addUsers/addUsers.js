import React, { Component } from 'react';
import axios from 'axios';
import './addUsers.css';

class AddUsers extends Component{
  _isMounted= false;
  constructor(props) {

    super(props);
    this.state = {
        Email: "",
        Password: "",
        FirstName: "",
        LastName: "",
        StartDate: "2019-11-10",
        IsAdmin: false,
        validationError: "",
        topics : [],
        user: {

        },
        cnt: 0
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateFieldsAndCreateUser = this.validateFieldsAndCreateUser.bind(this);
  }

  handleChange(evt) {
    console.log("Handle change being executed..");
    var x = this.state.cnt + 1;
    this.setState({cnt: x});
    if(evt.target.name === 'IsAdmin') {
        this.setState({ [evt.target.name]: evt.target.checked});
        return;
      }

    if(this.state.cnt > 2) {
      this.setState({ [evt.target.name]: evt.target.value });
    }
  }
    
validateFieldsAndCreateUser = (values) => {
    const _this = this;
    console.log("Validate Fields being executed..");

    const payload = axios.post(`http://localhost:3001/api/addUsers`, values)
        .then((result) => {
      // Note: Error's "data" is in result.response.data (inside "response")
      // success's "data" is in result.data
      
      this.setState({Email: "", Password: ""});
      
      if (result.response && result.response.status !== 200) {
        //signInUserFailure(result.response.data);
        console.log(result.response.data);
        console.log("error in auth");
      } else {
        console.log("User Created")
      }
    }).catch(err => {
        console.log(err)
    });
};

  handleSubmit(event) {
    console.log("Handle submit being executed..");
    const token = sessionStorage.jwtToken;
    this.validateFieldsAndCreateUser({token: token, Email: this.state.Email, Password: this.state.Password, IsAdmin: this.state.IsAdmin, FirstName: this.state.FirstName, LastName: this.state.LastName, StartDate: this.state.StartDate});
    event.preventDefault();
  }

  componentDidMount() {
    this._isMounted = true;
    this.setState({Email: "", Password: ""});
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
		return (
      <div >
          <div >
            <div ><strong>** ADD USER **</strong></div>
          </div>
          <hr></hr>
        
            <div >
                <form onSubmit={this.handleSubmit} className="form-style-9">

                    <ul>
                      <li>
                    <input type="text" name="FirstName" className="field-style field-split align-left" placeholder="First Name" value={this.state.FirstName} onChange={this.handleChange}/>
              
                    <input type="text" name="LastName" className="field-style field-split align-right" placeholder="Last Name" value={this.state.LastName} onChange={this.handleChange}/>
                    </li>

                    
                    <li>
                    <input type="text" name="Email" className="field-style field-full align-none" placeholder="Email" value={this.state.Email} onChange={this.handleChange}/>
                    </li>

             
                    <li>
                    <input type="password" name="Password" className="field-style field-full align-none" placeholder="Password" value={this.state.Password} onChange={this.handleChange}/>
                    </li>

                    <label>
                    <div> 
                    Is Admin?
                    <input type="checkbox" name="IsAdmin" value={this.state.IsAdmin} onChange={this.handleChange}/>
                    </div>
                    </label>

                    <li>
                    <input className="btn-medium" type="submit" value="Submit" />
                    </li>
                    </ul>
                </form>
            </div>
        
        </div>
    )
  }
}

export default AddUsers;
