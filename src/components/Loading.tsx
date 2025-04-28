import {
	Box,
	CircularProgress,
} from '@mui/material';

export const Loading = () => {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				backgroundColor: 'var(--bg-gradient)',
			}}
		>
			<CircularProgress
				size={100}
				sx={{
					color: 'var(--color-green)',
				}}
			/>
		</Box>
	);
}