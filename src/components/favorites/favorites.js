import React, { Component } from 'react';
import './favorites.css';
import axios from 'axios';

class Favorites extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            favList: []
        };

        this.searchList = this.searchList.bind(this);
        this.deleteBookHandler = this.deleteBookHandler.bind(this);
    }

    deleteBookHandler = (bookId) => {
      console.log("Deleting Favorites for user: ",this.props.user.userId," and bookID: ", bookId);

      const token = sessionStorage.jwtToken;
      const values = {
        token: token,
        UserId: this.props.user.userId,
        BookId: bookId
      }

      const payload = axios.post('http://localhost:3001/api/deleteFavorite', values)
          .then((result) => {
        if (result.response && result.response.status !== 200) {
          console.log("error in auth");
        } else {
          console.log("Favorite Deleted");
          this.searchList({token: token, UserId: this.props.user.userId, FirstName: this.props.user.firstName});
        }
      }).catch(err => {
          console.log(err)
      });     
      
      //this.searchList({token: token, UserId: this.props.user.userId, FirstName: this.props.user.firstName});
    }

    searchList = (values) => {
        console.log("Searching FavList for user: ", values.FirstName, " and ID: ", values.UserId);
        const _this = this;

        const payload = axios.post('http://localhost:3001/api/searchFavorites', values)
            .then((result) => {
          if (result.response && result.response.status !== 200) {
            this.setState({favList: []});
            console.log("error in auth");
          } else {
            this.setState({favList: result.data});
            console.log("Fetched Favorite List: ", result.data);
          }
        }).catch(err => {
            this.setState({favList: []});
            console.log(err)
        });        
    }

    componentDidMount() {
        this._isMounted = true;
        console.log("SessionStorage: ", sessionStorage);
        const token = sessionStorage.jwtToken;
        //console.log(this.props.user);
        this.searchList({token: token, UserId: this.props.user.userId, FirstName: this.props.user.firstName});
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
    	const _this = this;
    	console.log("Fav Props: ", this.props);
        return (
            <div>
              {
                this.state.favList[0] && (
                    <div className="border">
                    <table style={{width:"100%"}}>
                    <tbody>
                      <tr className="tHeading"><td><strong>Book Name</strong></td><td><strong>Author</strong></td><td><strong>Genre</strong></td>
                      <td><strong>Link</strong></td><td><strong>?</strong></td></tr>
                      {
                        
                        this.state.favList.map(function (i) {
                          return (<tr className="tRow">
                            <td key={i.bookid.toString()} >{i.bookname}</td>
                            <td>{i.authorname}</td>
                            <td>{i.genrename}</td>
                            <td><a href={i.link}>Go</a></td>
                            <td><button className="Button"
                                  onClick={() => _this.deleteBookHandler(i.bookid)}>
                              Remove</button></td>
                          </tr>);

                        })
                      }
                    </tbody>
                    </table>
                   
                    </div>
                  )
              }
              {
                !this.state.favList[0] && (
                  <div>No Favourite Books Added</div>
                )
              }                
            </div>
        );
    }
}

export default Favorites;
