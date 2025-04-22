import React from 'react';
import { MainSignIn, SignUp } from './components/SignIn';
import Menu from './components/Menu'
import './App.css';

class App extends React.Component {
  public state : any;
  // public handleSignUp : any;

  constructor(props: any) {
    super(props);

    this.state = {
      authentication: 'menu',
    }
  }

  handleSignUp = () => {
    this.setState({
      authentication: 'signUp',
    })
  }

  handleSignIn = () => {
    this.setState({
      authentication: 'signIn',
    })
  }

  render() {
    const { authentication } = this.state;

    return (
      <div className="App">
        {authentication == 'signIn' &&
            <MainSignIn
                handleSignUp={this.handleSignUp}
            />
        }
        {authentication == 'signUp' &&
          <SignUp />
        }
        {authentication == 'menu' &&
          <Menu
            handleSignIn={this.handleSignIn}
          />
        }
      </div>
    );
  };
}

export default App;
