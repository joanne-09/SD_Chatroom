import React, {useState} from 'react';
import config from '../config';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import './SignIn.css';

const auth = getAuth(config);

// Sign in page and can link to Sign up
interface SignInProps {
  handleSignUp: () => void;
}

class MainSignIn extends React.Component < SignInProps > {
  public state : any;

  constructor(props: SignInProps) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  handleSignIn = async (event: React.FormEvent) => {
    const { email, password } = this.state;

    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('User signed in successfully!');
    } catch {
      alert('Error signing in');
    }
  };

  // Sign in and Sign up with Google
  handleSignInGoogle = () => {
    let provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider).then((result) => {
      alert('Signed in Successfully!');
    }).catch((error) => {
      alert('Error signing in with Google');
    });
  };

  render () {
    const { handleSignUp } = this.props;
    const { email, password } = this.state;

    return(
      <div>
        <h2>Sign In</h2>
        <div>
          <div>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              value={email}
              onChange={(e) => {
                this.setState({ email: e.target.value });
              }}
            />
          </div>

          <div>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              name='password'
              value={password}
              onChange={(e) => {
                this.setState({ password: e.target.value });
              }}
            />
          </div>

          <button onClick={this.handleSignIn}>Sign In</button>
          <button onClick={this.handleSignInGoogle}>Sign In with Google</button>

          <a href={'#'} onClick={handleSignUp}>Sign Up</a>
        </div>
      </div>
    );
  };
}

// Sign up
const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User created successfully!');
    } catch {
      alert('Error creating user');
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label>Name</label>
          <input
            type='text'
            id='name'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            name='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            name='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type='submit'>Register</button>
      </form>
    </div>
  );
};

export { MainSignIn, SignUp };