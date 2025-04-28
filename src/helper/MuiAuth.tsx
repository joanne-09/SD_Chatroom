import React, { useState } from 'react';
import {
  Button,
  Paper,
  TextField,
  Box,
  Link,
  styled,
} from '@mui/material';

const AuthButton = styled(Button)({
	width: '100%',
	marginTop: '5px',
	marginBottom: '5px',
	backgroundColor: 'var(--color-button-green)',
	color: 'var(--color-button-text)',
	textTransform: 'none',
	'&: hover': {
		backgroundColor: 'var(--color-button-green-dark)',
		color: 'white',
	}
})

const AuthLink = styled(Link)({
	display: 'block',
	width: '100%',
	textAlign: 'center',
	marginTop: '8px',
})

export const SignInPage = (
	{ handleSignIn, handleSignInGoogle }:
		{
			handleSignIn: (email: string, password: string) => void;
			handleSignInGoogle: () => void;
		}
) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	return (
		<Box
			sx={{
				width: '40%',
				minWidth: '300px',
			}}
		>
			<Paper
				elevation={5}
				sx={{
					padding: '20px',
					backgroundColor: 'var(--color-navbar)',
				}}
			>
				<h1
					style={{
						fontSize: '2.5em',
						fontWeight: '900',
						marginTop: '20px',
						color: 'var(--color-text-orange)',
					}}
				>
					Sign In
				</h1>
				<form>
					<TextField
						label="Email"
						variant="outlined"
						fullWidth
						margin="normal"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<TextField
						label="Password"
						type="password"
						variant="outlined"
						fullWidth
						margin="normal"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<AuthButton
						variant="contained"
						color="primary"
						type="submit"
						onClick={(e) => {
							e.preventDefault();
							handleSignIn(email, password);
						}}
					>
						Sign In
					</AuthButton>
					<AuthButton
						variant="contained"
						color="secondary"
						type="button"
						onClick={() => {
							handleSignInGoogle();
						}}
					>
						Sign In With Google
					</AuthButton>
				</form>
				<AuthLink href="/signUp" underline="hover" color="var(--color-text-green)">
					Sign Up
				</AuthLink>
				<AuthLink href="/" underline="hover" color="var(--color-text-green)">
					Back to Home
				</AuthLink>
			</Paper>
		</Box>
	)
}

export const SignUpPage = (
	{ handleSignUp }:
		{ handleSignUp: (name: string, email: string, password: string) => void; }
) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	return (
		<Box
			sx={{
				width: '40%'
			}}
		>
			<Paper
				elevation={5}
				sx={{
					padding: '20px',
					backgroundColor: 'var(--color-navbar)',
				}}
			>
				<h1
					style={{
						fontSize: '2.5em',
						fontWeight: '900',
						marginTop: '20px',
						color: 'var(--color-text-orange)',
					}}
				>
					Sign Up
				</h1>
				<form>
					<TextField
						label="Name"
						variant="outlined"
						fullWidth
						margin="normal"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<TextField
						label="Email"
						variant="outlined"
						fullWidth
						margin="normal"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<TextField
						label="Password"
						type="password"
						variant="outlined"
						fullWidth
						margin="normal"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<AuthButton
						variant="contained"
						color="primary"
						type="submit"
						onClick={(e) => {
							e.preventDefault();
							handleSignUp(name, email, password);
						}}
					>
						Sign Up
					</AuthButton>
				</form>
				<AuthLink href="/" underline="hover" color="var(--color-text-green)">
					Back to Home
				</AuthLink>
			</Paper>
		</Box>
	)
}