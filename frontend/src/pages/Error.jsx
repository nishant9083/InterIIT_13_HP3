import React from 'react';
import { Container, Typography, Button } from '@mui/material';

const ErrorPage = () => {
	return (
		<Container className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<Typography variant="h1" component="h1" className="text-red-500 mb-4">
				404 - Page Not Found
			</Typography>
			<Typography variant="h6" component="p" className="mb-6">
				The page you are looking for does not exist.
			</Typography>
			<Button variant="contained" color="primary" href="/">
				Go to Home
			</Button>
		</Container>
	);
};

export default ErrorPage;
