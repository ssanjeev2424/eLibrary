import React, { Component } from 'react';
import axios from 'axios';
import './addBooks.css';

class AddBooks extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
            BookName: "",
            AuthorName: "",
            GenreName: "",
            Description: "",
            Link: "",
            validationError: "",
            topics: [],
            user: {

            }
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFieldsAndAddBook = this.validateFieldsAndAddBook.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    validateFieldsAndAddBook = (values) => {
        const _this = this;
        

        const payload = axios.post('http://localhost:3001/api/addBook', values)
            .then((result) => {
          // Note: Error's "data" is in result.response.data (inside "response")
          // success's "data" is in result.data
          
          this.setState({BookName: "", AuthorName: ""})
          
          if (result.response && result.response.status !== 200) {
            //signInUserFailure(result.response.data);
            console.log(result.response.data);
            console.log("error in auth");
          } else {
            console.log("Book Added")
          }
        }).catch(err => {
            console.log(err)
        });        
    };

    handleSubmit(event) {
        const token = sessionStorage.jwtToken;
        this.validateFieldsAndAddBook({token: token, BookName: this.state.BookName, AuthorName: this.state.AuthorName, GenreName: this.state.GenreName, Description: this.state.Description, Link: this.state.Link});
        event.preventDefault();
    }
    
    componentDidMount() {
        this._isMounted = true;
        const _this = this;
        const token = sessionStorage.jwtToken;
        const values = {token: token};
        axios.post('http://localhost:3001/api/getAllGenres',values).then((result) => {
          if(result.response && result.response.status !== 200) {
            console.log("failed to load Genres in AddBooks !")
          } else {
             let topicsFromApi = result.data.map(topic => { return {value: topic.genrename, display: topic.genrename} });
            _this.setState({ topics: [{value: '', display: 'Select Genre'}].concat(topicsFromApi) });
          }
        })
    }   

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
		return (
      <div>
          <div >
            <div><strong>** ADD BOOK **</strong></div>
          </div>
          <hr></hr>
        
            <div >
                <form onSubmit={this.handleSubmit} className="form-style-9">
                 <ul>
                   <li>
                    <input type="text" name="BookName" placeholder="Book Name" className="field-style field-full align-none" value={this.state.BookName} onChange={this.handleChange}/>
                    </li>
                     <li>
                    <input type="text" name="AuthorName" placeholder="Author Name" className="field-style field-full align-none" value={this.state.AuthorName} onChange={this.handleChange}/>
                    </li>

                   <li>
                    <select value={this.state.GenreName} placeholder="Genre" className="field-style field-full align-none"
                    onChange={(e) => this.setState({GenreName: e.target.value, validationError: e.target.value === "" ? "You must select a topic" : ""})}>
                        {this.state.topics.map((topic) => <option key={topic.value} value={topic.value}>{topic.display}</option>)}
                    </select>
                    </li>

                   
                    <li>
                    <textarea rows={8} cols={16} type="text" placeholder="Description" className="field-style" name="Description" value={this.state.Description} onChange={this.handleChange}/>
                    </li>

                   
                     <li>
                    <input type="text" name="Link" placeholder="Link" className="field-style field-full align-none" value={this.state.Link} onChange={this.handleChange}/>
                    </li>
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

export default AddBooks;