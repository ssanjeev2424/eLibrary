import React, { Component } from 'react';
import axios from 'axios';
import './books.css';

class Books extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
            BookName: "",
            AuthorName: "",
            GenreName: "",
            validationError: "",
            topics: [],
            user: {

            },
            searchResults: [],
            favAdded: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.searchBooks = this.searchBooks.bind(this);
        this.addFavorite = this.addFavorite.bind(this);
        this.clearFav = this.clearFav.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    searchBooks = (values) => {
      console.log("Searched for: ", values);
        const _this = this;
        const payload = axios.post('http://localhost:3001/api/searchBooks', values)
            .then((result) => {
          if (result.response && result.response.status !== 200) {
            this.setState({searchResults: []});
            console.log("error in auth");
          } else {
            this.setState({searchResults: result.data});
            console.log("Fetched Data: ", result.data);
          }
        }).catch(err => {
            this.setState({searchResults: []});
            console.log(err)
        });
    }
	
	clearFav = () => {
		this.setState({favAdded: []});
	}
	
    addFavorite = (userid, bookid) => {
      console.log("Add Favorite being executed..");

      const token = sessionStorage.jwtToken;
      const values = { token: token, UserId: userid, BookId: bookid }
      
      const payload = axios.post('http://localhost:3001/api/addFavorite', values)
          .then((result) => {
        if (result.response && result.response.status !== 200) {
          console.log("error in auth");
        } else {
          //this.setState({favAdded: result.data});
          console.log("Fav Added.. Response:", result.response);
        }
      }).catch(err => {
          console.log(err)
      });       
    }

    handleSubmit(event) {
        const token = sessionStorage.jwtToken;
        this.searchBooks({token: token, BookName: this.state.BookName, AuthorName: this.state.AuthorName, GenreName: this.state.GenreName});
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
      const _this = this;
      console.log("Render Fn Props: ", this.props);
      var id = this.props.user.userId;

		return (
      <div>
          
          <div >
            <div><strong>** SEARCH BOOKS **</strong></div>
          </div>
          <hr></hr>
        
            <div>
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
                      <tr className="tHeading"><td>Name</td><td>Author</td><td>Genre</td><td>Link</td><td></td></tr>
                      {
                        
                        this.state.searchResults.map(function (i) {
                          return (<tr className="tRow">
                            <td key={i.bookid.toString()}>{i.bookname}</td>
                            <td>{i.authorname}</td>
                            <td>{i.genrename}</td>
                            <td><a href={i.link}>Go</a></td>
                            <td>
                            <button className="cursor" onClick={()=> _this.addFavorite(id, i.bookid)}>Add to Favorites</button>
                            </td>
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
                  <div >No Results</div>
                )
              }
             
            </div>            

        
        </div>
    )
  }

}

export default Books;
