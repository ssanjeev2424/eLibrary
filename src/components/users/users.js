import React, { Component } from 'react';
import axios from 'axios';
import './users.css';

class Users extends Component{
  constructor(props) {
    super(props);
    this.state = {
        Email: "",
        FirstName: "",
        LastName: "",
        validationError: "",
        topics: [],
        user: {

        },
        searchResults: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.searchEmployees = this.searchEmployees.bind(this);
  }

  handleChange(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }
    
  searchEmployees = (values) => {
      const _this = this;
      console.log("Searched for: ", values);
      const payload = axios.post(`http://localhost:3001/api/searchUsers`, values)
          .then((result) => {
        if (result.response && result.response.status !== 200) {
          this.setState({searchResults: []});
          console.log("error in auth");
        } else {
          console.log("Fetched: ", result.data);
          this.setState({searchResults: result.data});
          //console.log(result.data);
        }
      }).catch(err => {
          this.setState({searchResults: []});
          console.log(err)
      });
  };

  handleSubmit(event) {
    const token = sessionStorage.jwtToken;
    this.searchEmployees({Email: this.state.Email, FirstName: this.state.FirstName, LastName: this.state.LastName, token: token});
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
      <div >
          <div >
            <div ><strong>** SEARCH USERS **</strong></div>
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
                    <input className="btn-medium" type="submit" value="Submit" />
                    </li>
                    </ul>
                </form>
            </div>
            
            
            <hr></hr>

            <div>
              {
                this.state.searchResults[0] && (
                    <div className="border">
                    <table style={{width:"100%"}}>
                    <tbody>
                      <tr className="tHeading"><td>Name</td><td>Email</td></tr>
                      {
                        
                        this.state.searchResults.map(function (i) {
                          return (<tr className="tRow">
                            <td key={i.userid.toString()} className="bolder hvr">{i.firstname + " " + i.lastname}</td>
                            <td>{i.email}</td>
                          </tr>);

                        })
                      }
                    </tbody>
                    </table>
                   
                    </div>
                  )
              }
              {
                !this.state.searchResults[0] && (
                  <div className="no-results">No Results</div>
                )
              }
             
            </div>

        </div>
    )
  }
}

export default Users;