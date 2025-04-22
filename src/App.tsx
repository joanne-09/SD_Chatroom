import React from 'react';
import SignUp from './components/SignIn';
import Menu from './components/Menu'
import './App.css';

class App extends React.Component {
  public state : any;
  // public handleSignUp : any;

  constructor(props: any) {
    super(props);

    this.state = {
      signUp: false,
    }
  }

  handleSignUp = () => {
    this.setState({
      signUp: true,
    })
  }

  render() {
    return (
      <div className="App">
        {this.state.signUp && <SignUp />}
        {!this.state.signUp &&
          <Menu
            handleSignUp={this.handleSignUp}
          />
        }
      </div>
    );
  };
}

export default App;
